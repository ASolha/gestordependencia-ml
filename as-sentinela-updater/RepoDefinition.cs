namespace ASSentinela.Updater;

internal sealed class RepoDefinition
{
    public string Name { get; set; } = "";
    public string Owner { get; set; } = "";
    public string Repository { get; set; } = "";
    public string Branch { get; set; } = "main";
    public string InstallDirectoryName { get; set; } = "";
    public List<string> ManifestPaths { get; set; } = [];

    public string InstallPath(string root) => Path.Combine(root, InstallDirectoryName);
}
