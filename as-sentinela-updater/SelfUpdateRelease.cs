namespace ASSentinela.Updater;

internal sealed class SelfUpdateRelease
{
    public string Version { get; set; } = "";
    public string PackageUrl { get; set; } = "";
    public string Notes { get; set; } = "";
}
