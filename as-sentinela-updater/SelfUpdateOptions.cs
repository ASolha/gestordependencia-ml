namespace ASSentinela.Updater;

internal sealed class SelfUpdateOptions
{
    public bool Enabled { get; set; } = true;
    public string ReleaseMetadataUrl { get; set; } = "";
    public string BootstrapExecutableName { get; set; } = "ASSentinela.Updater.Bootstrap.exe";
    public string MainExecutableName { get; set; } = "ASSentinela.Updater.exe";
}
