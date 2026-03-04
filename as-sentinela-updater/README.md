# AS Sentinela Updater

Este programa fica ao lado do relógio do Windows e faz 3 trabalhos:

- instala os arquivos em `C:\AS-Sentinela`
- verifica atualizações dos repositórios `gestordependencia-ml` e `sentinela-pro`
- verifica se existe uma versão nova do próprio updater

## Estrutura esperada

Depois de instalado, a máquina do usuário terá estas pastas:

- `C:\AS-Sentinela\gestordependencia-ml`
- `C:\AS-Sentinela\sentinela-pro`
- `C:\AS-Sentinela\updater`

## Como a autoatualização funciona

O updater principal não troca o próprio `.exe` enquanto está aberto. Por isso o projeto usa 2 executáveis:

- `ASSentinela.Updater.exe`: programa principal que fica no tray
- `ASSentinela.Updater.Bootstrap.exe`: auxiliar pequeno que espera o programa principal fechar, substitui os arquivos e abre o updater de novo

Também existe um arquivo remoto `release.json`, que informa:

- a versão nova
- o link do ZIP da nova versão do updater
- uma observação opcional

## Pré-requisitos

Antes de compilar, instale no seu computador:

1. `Git for Windows`
2. `.NET 8 SDK`
3. `Inno Setup`

## Passo a passo para preparar tudo

### 1. Organize os repositórios

Você vai precisar de:

1. um repositório para `gestordependencia-ml`
2. um repositório para `sentinela-pro`
3. um repositório para o updater

No código atual, o updater está apontado para:

- `https://github.com/ASolha/gestordependencia-ml`
- `https://github.com/ASolha/sentinela-pro`
- `https://github.com/ASolha/as-sentinela-updater`

Se o repositório do updater tiver outro nome, altere `selfUpdate.releaseMetadataUrl` em `appsettings.json`.

### 2. Ajuste o arquivo de configuração

Abra `appsettings.json` e revise:

- `installRoot`
- `checkIntervalMinutes`
- `githubToken`
- `repositories`
- `selfUpdate.releaseMetadataUrl`

O arquivo já está preparado para usar `C:\AS-Sentinela`.

Se algum repositório for privado, preencha `githubToken` com um token pessoal do GitHub com acesso de leitura ao repositório.

### 3. Compile o updater principal

Abra o PowerShell dentro da pasta `as-sentinela-updater` e rode:

```powershell
dotnet restore
dotnet publish .\ASSentinela.Updater.csproj -c Release -r win-x64 --self-contained false
```

Quando terminar, os arquivos publicados ficarão em algo parecido com:

`as-sentinela-updater\bin\Release\net8.0-windows\win-x64\publish`

### 4. Compile o bootstrap

Agora abra o PowerShell dentro da pasta `as-sentinela-updater-bootstrap` e rode:

```powershell
dotnet restore
dotnet publish .\ASSentinela.Updater.Bootstrap.csproj -c Release -r win-x64 --self-contained false
```

Quando terminar, os arquivos publicados ficarão em:

`as-sentinela-updater-bootstrap\bin\Release\net8.0-windows\win-x64\publish`

### 5. Monte o ZIP da nova versão do updater

Esse ZIP é o pacote que o programa vai baixar quando ele mesmo precisar se atualizar.

Faça assim:

1. abra a pasta `publish` do updater principal
2. copie para dentro dela os arquivos da pasta `publish` do bootstrap
3. selecione todos os arquivos dessa pasta final
4. compacte em um ZIP chamado, por exemplo, `as-sentinela-updater.zip`

Esse ZIP precisa conter os executáveis e DLLs diretamente dentro dele.

Não coloque uma pasta extra por cima se puder evitar.

### 6. Publique o ZIP no GitHub

No repositório do updater:

1. crie uma `Release`
2. use uma tag como `v1.0.0`
3. anexe o arquivo `as-sentinela-updater.zip`

Depois copie o link direto desse arquivo.

Exemplo de formato:

`https://github.com/ASolha/as-sentinela-updater/releases/download/v1.0.0/as-sentinela-updater.zip`

### 7. Crie o arquivo `release.json`

Use o arquivo `release.example.json` como modelo.

Crie um arquivo chamado `release.json` no repositório do updater com conteúdo parecido com este:

```json
{
  "version": "1.0.0",
  "packageUrl": "https://github.com/ASolha/as-sentinela-updater/releases/download/v1.0.0/as-sentinela-updater.zip",
  "notes": "Primeira release do updater com autoatualização."
}
```

Esse arquivo precisa ficar acessível pela URL bruta do GitHub.

Exemplo:

`https://raw.githubusercontent.com/ASolha/as-sentinela-updater/main/release.json`

### 8. Gere o instalador

Depois de publicar os arquivos, gere o instalador:

1. abra o `Inno Setup`
2. abra o arquivo `installer\ASSentinelaUpdater.iss`
3. clique em `Compile`

O instalador final será gerado pela própria pasta do script.

### 9. Instale na máquina do usuário

Na máquina final:

1. execute o instalador
2. conclua a instalação
3. o programa será iniciado
4. ele ficará ao lado do relógio do Windows
5. ele criará `C:\AS-Sentinela` se não existir

## Como atualizar no futuro

Toda vez que você lançar uma nova versão do updater, faça sempre nesta ordem:

1. aumente a versão em `ASSentinela.Updater.csproj`
2. compile o updater principal
3. compile o bootstrap
4. monte um novo ZIP com os dois publicados juntos
5. publique uma nova Release no GitHub
6. atualize o `release.json` com a nova versão e o novo link do ZIP

Depois disso, os usuários receberão o aviso no tray e poderão atualizar o próprio updater.

## Como atualizar os 2 repositórios monitorados

Para `gestordependencia-ml` e `sentinela-pro`, o updater olha o `manifest.json`.

Então o fluxo é:

1. subir alteração no repositório
2. atualizar o `version` do `manifest.json`
3. o updater detecta a mudança
4. ele avisa o usuário
5. o usuário clica para atualizar os arquivos

## Primeira validação recomendada

Faça este teste simples:

1. instale o updater em uma máquina de teste
2. confirme se ele criou `C:\AS-Sentinela`
3. clique em `Verificar agora`
4. confirme se ele baixa os repositórios
5. altere a versão de um `manifest.json` no GitHub
6. confirme se o updater avisa
7. publique uma nova versão do próprio updater
8. confirme se aparece o aviso de autoatualização

## Observações importantes

- Eu não consegui compilar daqui porque este ambiente não tem `dotnet` instalado.
- O caminho do `manifest.json` do `sentinela-pro` talvez precise ser ajustado se ele estiver em outra pasta.
- Se a extensão do Chrome estiver carregada como `unpacked`, pode ser necessário recarregar a extensão depois da atualização dos arquivos.
