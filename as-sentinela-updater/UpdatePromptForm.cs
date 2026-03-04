namespace ASSentinela.Updater;

internal sealed class UpdatePromptForm : Form
{
    private readonly UpdaterConfig _config;
    private readonly UpdateMonitorService _service;
    private readonly FlowLayoutPanel _list;
    private List<RepoStatus> _statuses;

    public UpdatePromptForm(UpdaterConfig config, UpdateMonitorService service, List<RepoStatus> statuses)
    {
        _config = config;
        _service = service;
        _statuses = statuses;

        Text = "Atualizações disponíveis";
        Width = 720;
        Height = 420;
        MinimizeBox = false;
        MaximizeBox = false;

        var header = new Label
        {
            Dock = DockStyle.Top,
            Height = 56,
            Text = "Os manifests dos repositórios monitorados foram verificados. Atualize os arquivos instalados em C:\\AS-Sentinela.",
            Padding = new Padding(16, 16, 16, 0)
        };

        _list = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
            AutoScroll = true,
            Padding = new Padding(12)
        };

        var footer = new FlowLayoutPanel
        {
            Dock = DockStyle.Bottom,
            Height = 56,
            FlowDirection = FlowDirection.RightToLeft,
            Padding = new Padding(12)
        };

        var closeButton = new Button { Text = "Fechar", Width = 100, Height = 30 };
        closeButton.Click += (_, _) => Close();

        var updateAllButton = new Button { Text = "Atualizar tudo", Width = 120, Height = 30 };
        updateAllButton.Click += async (_, _) => await UpdateAllAsync();

        footer.Controls.Add(closeButton);
        footer.Controls.Add(updateAllButton);

        Controls.Add(_list);
        Controls.Add(footer);
        Controls.Add(header);

        RenderStatuses();
    }

    private void RenderStatuses()
    {
        _list.Controls.Clear();
        foreach (var status in _statuses)
        {
            _list.Controls.Add(CreateRepoPanel(status));
        }
    }

    private Control CreateRepoPanel(RepoStatus status)
    {
        var panel = new Panel
        {
            Width = 660,
            Height = 110,
            BorderStyle = BorderStyle.FixedSingle,
            Margin = new Padding(0, 0, 0, 10)
        };

        var title = new Label
        {
            Left = 12,
            Top = 12,
            Width = 420,
            Text = $"{status.Repo.Name} ({status.Repo.Repository})",
            Font = new Font(Font, FontStyle.Bold)
        };

        var info = new Label
        {
            Left = 12,
            Top = 38,
            Width = 500,
            Height = 44,
            Text = $"Local: {status.LocalVersion ?? "não instalado"}\r\nRemoto: {status.RemoteVersion ?? "não encontrado"}\r\nManifest: {status.ManifestPath ?? "-"}"
        };

        var path = new Label
        {
            Left = 12,
            Top = 84,
            Width = 430,
            Text = status.InstallPath
        };

        var action = new Button
        {
            Left = 520,
            Top = 24,
            Width = 120,
            Height = 32,
            Text = status.UpdateAvailable ? (status.Installed ? "Atualizar" : "Instalar") : "Reinstalar"
        };

        action.Click += async (_, _) =>
        {
            action.Enabled = false;
            action.Text = "Baixando...";
            try
            {
                await _service.InstallOrUpdateAsync(status.Repo);
                _statuses = await _service.CheckAsync();
                RenderStatuses();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Falha na atualização", MessageBoxButtons.OK, MessageBoxIcon.Error);
                action.Enabled = true;
                action.Text = "Atualizar";
            }
        };

        panel.Controls.Add(title);
        panel.Controls.Add(info);
        panel.Controls.Add(path);
        panel.Controls.Add(action);
        return panel;
    }

    private async Task UpdateAllAsync()
    {
        foreach (var status in _statuses.Where(s => s.UpdateAvailable))
        {
            await _service.InstallOrUpdateAsync(status.Repo);
        }

        _statuses = await _service.CheckAsync();
        RenderStatuses();
        MessageBox.Show("Atualização concluída.", "AS Sentinela Updater", MessageBoxButtons.OK, MessageBoxIcon.Information);
    }
}
