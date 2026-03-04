using System.IO.Compression;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace ASSentinela.Updater;

internal sealed class UpdateMonitorService
{
    private readonly HttpClient _httpClient;
    private readonly UpdaterConfig _config;
    private readonly string? _githubToken;

    public UpdateMonitorService(UpdaterConfig config)
    {
        _config = config;
        _githubToken = ResolveGitHubToken(config);
        _httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(30)
        };
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("AS-Sentinela-Updater/1.0");
        _httpClient.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
    }

    public void EnsureInstallDirectories()
    {
        Directory.CreateDirectory(_config.InstallRoot);
        foreach (var repo in _config.Repositories)
        {
            Directory.CreateDirectory(repo.InstallPath(_config.InstallRoot));
        }
    }

    public async Task<List<RepoStatus>> CheckAsync(CancellationToken cancellationToken = default)
    {
        EnsureInstallDirectories();
        var results = new List<RepoStatus>();

        foreach (var repo in _config.Repositories)
        {
            results.Add(await CheckRepoAsync(repo, cancellationToken));
        }

        return results;
    }

    public async Task<RepoStatus> CheckRepoAsync(RepoDefinition repo, CancellationToken cancellationToken = default)
    {
        var installPath = repo.InstallPath(_config.InstallRoot);
        var status = new RepoStatus
        {
            Repo = repo,
            InstallPath = installPath
        };

        var local = ReadLocalManifest(repo, installPath);
        status.Installed = local is not null;
        if (local is not null)
        {
            status.LocalManifestPath = local.Value.Path;
            status.LocalVersion = local.Value.Version;
            status.LocalHash = local.Value.Hash;
        }

        var remote = await ReadRemoteManifestAsync(repo, cancellationToken);
        if (remote is null)
        {
            status.Message = "Nao foi possivel localizar o manifest remoto.";
            return status;
        }

        status.ManifestPath = remote.Value.Path;
        status.RemoteVersion = remote.Value.Version;
        status.RemoteHash = remote.Value.Hash;
        status.UpdateAvailable = !status.Installed
            || !string.Equals(status.LocalVersion, status.RemoteVersion, StringComparison.OrdinalIgnoreCase)
            || !string.Equals(status.LocalHash, status.RemoteHash, StringComparison.OrdinalIgnoreCase);
        status.Message = status.UpdateAvailable ? "Atualizacao disponivel" : "Atualizado";
        return status;
    }

    public async Task<RepoStatus> InstallOrUpdateAsync(RepoDefinition repo, CancellationToken cancellationToken = default)
    {
        EnsureInstallDirectories();
        var targetDirectory = repo.InstallPath(_config.InstallRoot);
        var tempRoot = Path.Combine(Path.GetTempPath(), "AS-Sentinela-Updater", Guid.NewGuid().ToString("N"));
        var zipPath = Path.Combine(tempRoot, $"{repo.Repository}.zip");

        Directory.CreateDirectory(tempRoot);

        try
        {
            var url = $"https://api.github.com/repos/{repo.Owner}/{repo.Repository}/zipball/{repo.Branch}";
            await DownloadToFileAsync(url, zipPath, cancellationToken);

            ZipFile.ExtractToDirectory(zipPath, tempRoot);
            var extractedRoot = Directory.GetDirectories(tempRoot)
                .FirstOrDefault(d => Path.GetFileName(d).Contains(repo.Repository, StringComparison.OrdinalIgnoreCase))
                ?? Directory.GetDirectories(tempRoot).FirstOrDefault();

            if (extractedRoot is null)
            {
                throw new InvalidOperationException("Nao foi possivel localizar o conteudo extraido do repositorio.");
            }

            CopyDirectory(extractedRoot, targetDirectory);
            return await CheckRepoAsync(repo, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException(BuildRepoErrorMessage(repo, ex), ex);
        }
        finally
        {
            if (Directory.Exists(tempRoot))
            {
                try { Directory.Delete(tempRoot, true); } catch { }
            }
        }
    }

    private static (string Path, string? Version, string Hash)? ReadLocalManifest(RepoDefinition repo, string installPath)
    {
        foreach (var relativeManifest in repo.ManifestPaths)
        {
            var fullPath = Path.Combine(installPath, relativeManifest.Replace('/', Path.DirectorySeparatorChar));
            if (!File.Exists(fullPath))
            {
                continue;
            }

            var content = File.ReadAllText(fullPath);
            return (relativeManifest, ReadVersion(content), ComputeSha256(content));
        }

        return null;
    }

    private async Task<(string Path, string? Version, string Hash)?> ReadRemoteManifestAsync(RepoDefinition repo, CancellationToken cancellationToken)
    {
        foreach (var manifestPath in repo.ManifestPaths)
        {
            try
            {
                var content = await DownloadManifestAsync(repo, manifestPath, cancellationToken);
                if (content is null)
                {
                    continue;
                }

                return (manifestPath, ReadVersion(content), ComputeSha256(content));
            }
            catch
            {
                // Try next candidate path.
            }
        }

        return null;
    }

    private async Task<string?> DownloadManifestAsync(RepoDefinition repo, string manifestPath, CancellationToken cancellationToken)
    {
        var encodedPath = string.Join("/", manifestPath.Split('/').Select(Uri.EscapeDataString));
        var url = $"https://api.github.com/repos/{repo.Owner}/{repo.Repository}/contents/{encodedPath}?ref={Uri.EscapeDataString(repo.Branch)}";
        using var request = CreateRequest(HttpMethod.Get, url);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        if (!doc.RootElement.TryGetProperty("content", out var contentElement))
        {
            return null;
        }

        var content = contentElement.GetString();
        var encoding = doc.RootElement.TryGetProperty("encoding", out var encodingElement)
            ? encodingElement.GetString()
            : null;

        if (string.IsNullOrWhiteSpace(content))
        {
            return null;
        }

        if (string.Equals(encoding, "base64", StringComparison.OrdinalIgnoreCase))
        {
            var normalized = content.Replace("\n", "").Replace("\r", "");
            return Encoding.UTF8.GetString(Convert.FromBase64String(normalized));
        }

        return content;
    }

    private async Task DownloadToFileAsync(string url, string destinationPath, CancellationToken cancellationToken)
    {
        using var request = CreateRequest(HttpMethod.Get, url);
        using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();

        await using var remoteStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        await using var fileStream = File.Create(destinationPath);
        await remoteStream.CopyToAsync(fileStream, cancellationToken);
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string url)
    {
        var request = new HttpRequestMessage(method, url);
        if (!string.IsNullOrWhiteSpace(_githubToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _githubToken);
        }

        return request;
    }

    private static string? ResolveGitHubToken(UpdaterConfig config)
    {
        var envValue = Environment.GetEnvironmentVariable("AS_SENTINELA_GITHUB_TOKEN");
        if (!string.IsNullOrWhiteSpace(envValue))
        {
            return envValue.Trim();
        }

        return string.IsNullOrWhiteSpace(config.GitHubToken) ? null : config.GitHubToken.Trim();
    }

    private static string BuildRepoErrorMessage(RepoDefinition repo, HttpRequestException ex)
    {
        var status = ex.StatusCode.HasValue ? $"HTTP {(int)ex.StatusCode.Value}" : "falha de rede";
        return $"Falha ao baixar {repo.Name} ({repo.Owner}/{repo.Repository}, branch {repo.Branch}). Verifique se o repositorio existe, se a branch esta correta e se um GitHub token foi configurado para repositorios privados. Detalhe: {status}.";
    }

    private static string? ReadVersion(string manifestJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(manifestJson);
            if (doc.RootElement.TryGetProperty("version", out var version))
            {
                return version.GetString();
            }
        }
        catch
        {
            // Ignore malformed manifests; hash comparison still works.
        }

        return null;
    }

    private static string ComputeSha256(string content)
    {
        var bytes = Encoding.UTF8.GetBytes(content);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash);
    }

    private static void CopyDirectory(string source, string destination)
    {
        Directory.CreateDirectory(destination);

        foreach (var dir in Directory.GetDirectories(source, "*", SearchOption.AllDirectories))
        {
            var relative = Path.GetRelativePath(source, dir);
            Directory.CreateDirectory(Path.Combine(destination, relative));
        }

        foreach (var file in Directory.GetFiles(source, "*", SearchOption.AllDirectories))
        {
            var relative = Path.GetRelativePath(source, file);
            var target = Path.Combine(destination, relative);
            Directory.CreateDirectory(Path.GetDirectoryName(target)!);
            File.Copy(file, target, true);
        }
    }
}
