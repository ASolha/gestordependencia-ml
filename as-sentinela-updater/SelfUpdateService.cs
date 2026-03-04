using System.Diagnostics;
using System.IO.Compression;
using System.Reflection;
using System.Text.Json;

namespace ASSentinela.Updater;

internal sealed class SelfUpdateService
{
    private readonly SelfUpdateOptions _options;
    private readonly HttpClient _httpClient;

    public SelfUpdateService(SelfUpdateOptions options)
    {
        _options = options;
        _httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(30)
        };
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("AS-Sentinela-Updater/1.0");
    }

    public async Task<SelfUpdateStatus> CheckAsync(CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.ReleaseMetadataUrl))
        {
            return new SelfUpdateStatus { Enabled = false };
        }

        var json = await _httpClient.GetStringAsync(_options.ReleaseMetadataUrl, cancellationToken);
        var release = JsonSerializer.Deserialize<SelfUpdateRelease>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? new SelfUpdateRelease();

        var localVersion = ReadLocalVersion();
        var remoteVersion = ParseVersion(release.Version);
        var updateAvailable = remoteVersion is not null
            && localVersion is not null
            && remoteVersion > localVersion
            && !string.IsNullOrWhiteSpace(release.PackageUrl);

        return new SelfUpdateStatus
        {
            Enabled = true,
            UpdateAvailable = updateAvailable,
            LocalVersion = localVersion,
            RemoteVersion = remoteVersion,
            Notes = release.Notes,
            PackageUrl = release.PackageUrl
        };
    }

    public async Task StartSelfUpdateAsync(SelfUpdateStatus status, CancellationToken cancellationToken = default)
    {
        if (!status.UpdateAvailable || string.IsNullOrWhiteSpace(status.PackageUrl))
        {
            throw new InvalidOperationException("Nenhuma atualização do updater está disponível.");
        }

        var baseDirectory = AppContext.BaseDirectory;
        var bootstrapPath = Path.Combine(baseDirectory, _options.BootstrapExecutableName);
        if (!File.Exists(bootstrapPath))
        {
            throw new FileNotFoundException(
                $"Bootstrap não encontrado em {bootstrapPath}. Publique o bootstrap junto do updater.",
                bootstrapPath);
        }

        var tempRoot = Path.Combine(Path.GetTempPath(), "AS-Sentinela-Updater-Self", Guid.NewGuid().ToString("N"));
        var zipPath = Path.Combine(tempRoot, "updater.zip");
        var extractPath = Path.Combine(tempRoot, "package");
        Directory.CreateDirectory(tempRoot);
        Directory.CreateDirectory(extractPath);

        await using (var remoteStream = await _httpClient.GetStreamAsync(status.PackageUrl, cancellationToken))
        await using (var fileStream = File.Create(zipPath))
        {
            await remoteStream.CopyToAsync(fileStream, cancellationToken);
        }

        ZipFile.ExtractToDirectory(zipPath, extractPath);
        var packageRoot = ResolvePackageRoot(extractPath);

        var currentProcess = Process.GetCurrentProcess();
        var arguments = string.Join(' ',
            Quote(currentProcess.Id.ToString()),
            Quote(packageRoot),
            Quote(baseDirectory),
            Quote(_options.MainExecutableName));

        Process.Start(new ProcessStartInfo
        {
            FileName = bootstrapPath,
            Arguments = arguments,
            UseShellExecute = true,
            WorkingDirectory = baseDirectory
        });
    }

    private static string ResolvePackageRoot(string extractPath)
    {
        var entries = Directory.GetDirectories(extractPath);
        if (entries.Length == 1 && Directory.GetFiles(extractPath).Length == 0)
        {
            return entries[0];
        }

        return extractPath;
    }

    private static Version? ReadLocalVersion()
    {
        var version = Assembly.GetExecutingAssembly().GetName().Version;
        if (version is null)
        {
            return null;
        }

        return new Version(version.Major, version.Minor, Math.Max(0, version.Build));
    }

    private static Version? ParseVersion(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return Version.TryParse(value, out var version) ? version : null;
    }

    private static string Quote(string value)
    {
        return "\"" + value.Replace("\"", "\\\"") + "\"";
    }
}
