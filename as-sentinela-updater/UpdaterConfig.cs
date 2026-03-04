using System.Text.Json;

namespace ASSentinela.Updater;

internal sealed class UpdaterConfig
{
    public string InstallRoot { get; set; } = @"C:\AS-Sentinela";
    public int CheckIntervalMinutes { get; set; } = 15;
    public string GitHubToken { get; set; } = "";
    public List<RepoDefinition> Repositories { get; set; } = [];
    public SelfUpdateOptions SelfUpdate { get; set; } = new();

    public static UpdaterConfig Load(string path)
    {
        if (!File.Exists(path))
        {
            return CreateDefault();
        }

        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<UpdaterConfig>(json, JsonOptions()) ?? CreateDefault();
    }

    public void Save(string path)
    {
        var json = JsonSerializer.Serialize(this, JsonOptions());
        File.WriteAllText(path, json);
    }

    private static JsonSerializerOptions JsonOptions()
    {
        return new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };
    }

    private static UpdaterConfig CreateDefault()
    {
        return new UpdaterConfig
        {
            SelfUpdate = new SelfUpdateOptions
            {
                Enabled = true,
                ReleaseMetadataUrl = "https://raw.githubusercontent.com/ASolha/as-sentinela-updater/main/release.json"
            },
            Repositories =
            [
                new RepoDefinition
                {
                    Name = "Gestor de Pendencia ML",
                    Owner = "ASolha",
                    Repository = "gestordependencia-ml",
                    Branch = "main",
                    InstallDirectoryName = "gestordependencia-ml",
                    ManifestPaths = ["chrome-extension/manifest.json", "manifest.json"]
                },
                new RepoDefinition
                {
                    Name = "Sentinela Pro",
                    Owner = "ASolha",
                    Repository = "sentinela-pro",
                    Branch = "main",
                    InstallDirectoryName = "sentinela-pro",
                    ManifestPaths = ["manifest.json", "chrome-extension/manifest.json"]
                }
            ]
        };
    }
}
