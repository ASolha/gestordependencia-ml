using System.Diagnostics;

if (args.Length < 4)
{
    return;
}

var processId = int.TryParse(args[0], out var parsedPid) ? parsedPid : 0;
var sourceDirectory = args[1];
var targetDirectory = args[2];
var mainExecutableName = args[3];

WaitForProcessToExit(processId);
Thread.Sleep(1200);
CopyDirectory(sourceDirectory, targetDirectory);

var targetExecutable = Path.Combine(targetDirectory, mainExecutableName);
if (File.Exists(targetExecutable))
{
    Process.Start(new ProcessStartInfo
    {
        FileName = targetExecutable,
        WorkingDirectory = targetDirectory,
        UseShellExecute = true
    });
}

static void WaitForProcessToExit(int processId)
{
    if (processId <= 0)
    {
        return;
    }

    try
    {
        using var process = Process.GetProcessById(processId);
        process.WaitForExit(30000);
    }
    catch
    {
        // If the process is already gone, proceed.
    }
}

static void CopyDirectory(string source, string destination)
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
