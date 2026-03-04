using System.Diagnostics;

namespace ASSentinela.Updater;

internal sealed class TrayApplicationContext : ApplicationContext
{
    private readonly UpdaterConfig _config;
    private readonly UpdateMonitorService _service;
    private readonly SelfUpdateService _selfUpdateService;
    private readonly NotifyIcon _notifyIcon;
    private readonly System.Windows.Forms.Timer _timer;
    private readonly ToolStripMenuItem _selfUpdateMenuItem;
    private bool _isChecking;

    public TrayApplicationContext(UpdaterConfig config)
    {
        _config = config;
        _service = new UpdateMonitorService(config);
        _selfUpdateService = new SelfUpdateService(config.SelfUpdate);
        _service.EnsureInstallDirectories();

        var menu = new ContextMenuStrip();
        menu.Items.Add("Verificar agora", null, async (_, _) => await CheckNowAsync(true));
        menu.Items.Add("Atualizar tudo", null, async (_, _) => await UpdateAllAsync());
        _selfUpdateMenuItem = new ToolStripMenuItem("Atualizar este programa", null, async (_, _) => await CheckSelfUpdateAndPromptAsync(true))
        {
            Enabled = _config.SelfUpdate.Enabled
        };
        menu.Items.Add(_selfUpdateMenuItem);
        menu.Items.Add("Abrir pasta", null, (_, _) => OpenInstallRoot());
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("Sair", null, (_, _) => ExitThread());

        _notifyIcon = new NotifyIcon
        {
            Icon = SystemIcons.Shield,
            Visible = true,
            Text = "AS Sentinela Updater",
            ContextMenuStrip = menu
        };
        _notifyIcon.DoubleClick += async (_, _) => await CheckNowAsync(true);

        _timer = new System.Windows.Forms.Timer
        {
            Interval = Math.Max(1, _config.CheckIntervalMinutes) * 60 * 1000
        };
        _timer.Tick += async (_, _) => await CheckNowAsync(false);
        _timer.Start();

        _ = CheckNowAsync(false);
    }

    protected override void ExitThreadCore()
    {
        _timer.Stop();
        _notifyIcon.Visible = false;
        _notifyIcon.Dispose();
        _timer.Dispose();
        base.ExitThreadCore();
    }

    private async Task CheckNowAsync(bool showIfNoUpdates)
    {
        if (_isChecking)
        {
            return;
        }

        _isChecking = true;
        try
        {
            var statuses = await _service.CheckAsync();
            var updates = statuses.Where(s => s.UpdateAvailable).ToList();
            var selfStatus = await CheckSelfUpdateSilentlyAsync();

            if (updates.Count > 0)
            {
                _notifyIcon.ShowBalloonTip(
                    4000,
                    "Atualização disponível",
                    $"{updates.Count} repositório(s) têm nova versão.",
                    ToolTipIcon.Info);
                ShowUpdateDialog(statuses);
            }
            else if (selfStatus?.UpdateAvailable == true)
            {
                _notifyIcon.ShowBalloonTip(
                    4000,
                    "Nova versão do updater",
                    $"Existe uma nova versão do AS Sentinela Updater ({selfStatus.RemoteVersion}).",
                    ToolTipIcon.Info);

                if (showIfNoUpdates)
                {
                    await PromptSelfUpdateAsync(selfStatus);
                }
            }
            else if (showIfNoUpdates)
            {
                MessageBox.Show(
                    "Nenhuma atualização encontrada.",
                    "AS Sentinela Updater",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            }
        }
        catch (Exception ex)
        {
            if (showIfNoUpdates)
            {
                MessageBox.Show(ex.Message, "Falha ao verificar atualizações", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        finally
        {
            _isChecking = false;
        }
    }

    private async Task UpdateAllAsync()
    {
        var statuses = await _service.CheckAsync();
        var updates = statuses.Where(s => s.UpdateAvailable).ToList();
        if (updates.Count == 0)
        {
            MessageBox.Show("Nada para atualizar.", "AS Sentinela Updater", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }

        foreach (var repo in updates)
        {
            await _service.InstallOrUpdateAsync(repo.Repo);
        }

        _notifyIcon.ShowBalloonTip(4000, "Atualização concluída", "Os repositórios foram atualizados.", ToolTipIcon.Info);
    }

    private void ShowUpdateDialog(List<RepoStatus> statuses)
    {
        using var form = new UpdatePromptForm(_config, _service, statuses);
        form.StartPosition = FormStartPosition.CenterScreen;
        form.ShowDialog();
    }

    private void OpenInstallRoot()
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = _config.InstallRoot,
            UseShellExecute = true
        });
    }

    private async Task<SelfUpdateStatus?> CheckSelfUpdateSilentlyAsync()
    {
        if (!_config.SelfUpdate.Enabled)
        {
            _selfUpdateMenuItem.Enabled = false;
            return null;
        }

        try
        {
            var status = await _selfUpdateService.CheckAsync();
            _selfUpdateMenuItem.Enabled = status.Enabled;
            _selfUpdateMenuItem.Text = status.UpdateAvailable
                ? $"Atualizar este programa ({status.RemoteVersion})"
                : "Atualizar este programa";
            return status;
        }
        catch
        {
            return null;
        }
    }

    private async Task CheckSelfUpdateAndPromptAsync(bool showIfNoUpdates)
    {
        try
        {
            var status = await _selfUpdateService.CheckAsync();
            _selfUpdateMenuItem.Enabled = status.Enabled;
            _selfUpdateMenuItem.Text = status.UpdateAvailable
                ? $"Atualizar este programa ({status.RemoteVersion})"
                : "Atualizar este programa";

            if (status.UpdateAvailable)
            {
                await PromptSelfUpdateAsync(status);
                return;
            }

            if (showIfNoUpdates)
            {
                MessageBox.Show(
                    "O updater já está na versão mais recente.",
                    "AS Sentinela Updater",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            }
        }
        catch (Exception ex)
        {
            if (showIfNoUpdates)
            {
                MessageBox.Show(ex.Message, "Falha na autoatualização", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }

    private async Task PromptSelfUpdateAsync(SelfUpdateStatus status)
    {
        var local = status.LocalVersion?.ToString() ?? "desconhecida";
        var remote = status.RemoteVersion?.ToString() ?? "desconhecida";
        var notes = string.IsNullOrWhiteSpace(status.Notes) ? "" : $"{Environment.NewLine}{Environment.NewLine}{status.Notes}";
        var result = MessageBox.Show(
            $"Há uma nova versão do updater.{Environment.NewLine}{Environment.NewLine}Versão atual: {local}{Environment.NewLine}Nova versão: {remote}{notes}{Environment.NewLine}{Environment.NewLine}Deseja atualizar agora?",
            "Atualização do updater",
            MessageBoxButtons.YesNo,
            MessageBoxIcon.Information);

        if (result != DialogResult.Yes)
        {
            return;
        }

        await _selfUpdateService.StartSelfUpdateAsync(status);
        ExitThread();
    }
}
