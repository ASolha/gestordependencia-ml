namespace ASSentinela.Updater;

internal sealed class SelfUpdateStatus
{
    public bool Enabled { get; init; }
    public bool UpdateAvailable { get; init; }
    public Version? LocalVersion { get; init; }
    public Version? RemoteVersion { get; init; }
    public string? Notes { get; init; }
    public string? PackageUrl { get; init; }
}
