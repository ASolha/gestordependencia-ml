namespace ASSentinela.Updater;

internal sealed class RepoStatus
{
    public RepoDefinition Repo { get; init; } = new();
    public string InstallPath { get; init; } = "";
    public string? LocalVersion { get; set; }
    public string? RemoteVersion { get; set; }
    public string? LocalManifestPath { get; set; }
    public string? ManifestPath { get; set; }
    public string? LocalHash { get; set; }
    public string? RemoteHash { get; set; }
    public bool Installed { get; set; }
    public bool UpdateAvailable { get; set; }
    public string Message { get; set; } = "";
}
