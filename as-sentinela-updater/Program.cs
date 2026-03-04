namespace ASSentinela.Updater;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();

        var configPath = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
        var config = UpdaterConfig.Load(configPath);

        Application.Run(new TrayApplicationContext(config));
    }
}
