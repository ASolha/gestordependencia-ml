[Setup]
AppId={{6A4BA395-4D6D-4F50-9348-25CF2D8E62E2}
AppName=AS Sentinela Updater
AppVersion=1.0.0
DefaultDirName=C:\AS-Sentinela\updater
DefaultGroupName=AS Sentinela
DisableProgramGroupPage=yes
OutputDir=.
OutputBaseFilename=AS-Sentinela-Updater-Setup
Compression=lzma
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin

[Files]
Source: "..\bin\Release\net8.0-windows\win-x64\publish\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion
Source: "..\..\as-sentinela-updater-bootstrap\bin\Release\net8.0-windows\win-x64\publish\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion

[Dirs]
Name: "C:\AS-Sentinela"
Name: "C:\AS-Sentinela\gestordependencia-ml"
Name: "C:\AS-Sentinela\sentinela-pro"

[Icons]
Name: "{group}\AS Sentinela Updater"; Filename: "{app}\ASSentinela.Updater.exe"

[Run]
Filename: "{app}\ASSentinela.Updater.exe"; Description: "Iniciar AS Sentinela Updater"; Flags: nowait postinstall skipifsilent

[Registry]
Root: HKLM; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "ASSentinelaUpdater"; ValueData: """{app}\ASSentinela.Updater.exe"""; Flags: uninsdeletevalue
