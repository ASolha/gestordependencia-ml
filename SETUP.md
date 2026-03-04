# Gestor de Pendências ML — Guia de Configuração Completo

## Visão Geral da Arquitetura

```
Chrome Extension (content.js)
       │
       ├── Supabase (auth + banco de dados)
       │       └── Tabela: pendencias
       │
       └── Vercel API (send-email.js)
               └── Resend (envio de e-mail)
```

---

## ETAPA 1 — Supabase

### 1.1 Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **New Project**, escolha um nome (ex: `ml-pendencias`), defina uma senha forte para o banco e selecione a região **South America (São Paulo)**.
3. Aguarde o projeto ser criado (~2 min).

### 1.2 Criar a tabela `pendencias`

1. No painel do Supabase, vá em **SQL Editor** → **New Query**.
2. Cole e execute o SQL abaixo:

```sql
-- Tabela principal
CREATE TABLE pendencias (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  login_cliente TEXT        DEFAULT '',
  numero_venda  TEXT        DEFAULT '',
  url           TEXT        DEFAULT '',
  modelo        TEXT        DEFAULT '',
  aro           TEXT        DEFAULT '',
  observacoes   TEXT        DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE pendencias ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuário só acessa seus próprios dados
CREATE POLICY "select_own" ON pendencias
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON pendencias
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON pendencias
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own" ON pendencias
  FOR DELETE USING (auth.uid() = user_id);
```

### 1.3 Criar usuário(s) no Supabase

1. Vá em **Authentication** → **Users** → **Add User**.
2. Informe e-mail e senha. Esses são os dados que serão usados no login da extensão.
3. Repita para quantos usuários precisar.

### 1.4 Pegar as credenciais

1. Vá em **Project Settings** → **API**.
2. Copie:
   - **Project URL** → será o `SUPABASE_URL`
   - **anon / public** (em Project API keys) → será o `SUPABASE_ANON_KEY`

---

## ETAPA 2 — Resend (serviço de e-mail)

1. Acesse [resend.com](https://resend.com) e crie uma conta gratuita.
2. Vá em **API Keys** → **Create API Key** → copie a chave gerada (`re_...`).
3. **Domínio (opcional no plano gratuito):**
   - No plano gratuito você pode enviar **apenas** de `onboarding@resend.dev`.
   - Para usar seu próprio domínio (ex: `noreply@seudominio.com`), vá em **Domains**, adicione o domínio e configure os registros DNS indicados.

---

## ETAPA 3 — Vercel (API de envio de e-mail)

### 3.1 Deploy do projeto

**Opção A — Via GitHub (recomendado):**

1. Crie um repositório no GitHub e suba a pasta `vercel-api/`:
   ```bash
   cd vercel-api
   git init
   git add .
   git commit -m "feat: api send-email"
   git remote add origin https://github.com/SEU_USER/ml-pendencias-api.git
   git push -u origin main
   ```
2. Acesse [vercel.com](https://vercel.com), clique em **Add New Project** e importe o repositório.
3. Na tela de configuração, **não** altere nada — o Vercel detecta automaticamente.
4. Clique em **Deploy**.

**Opção B — Via CLI:**

```bash
npm i -g vercel
cd vercel-api
vercel --prod
```

### 3.2 Configurar variáveis de ambiente no Vercel

Após o deploy, vá em **Settings** → **Environment Variables** e adicione:

| Nome             | Valor                                      |
|------------------|--------------------------------------------|
| `RESEND_API_KEY` | `re_xxxxxxxxxx` (copiado do Resend)       |
| `FROM_EMAIL`     | `onboarding@resend.dev` (ou seu domínio)  |
| `API_SECRET_KEY` | Uma string aleatória forte (veja abaixo)  |

Para gerar `API_SECRET_KEY`:
```bash
# No terminal (Mac/Linux)
openssl rand -hex 32

# Ou simplesmente invente uma senha longa, ex:
# minhachavesecreta2024MLpendencias!
```

### 3.3 Obter a URL do projeto

Após o deploy, copie a URL do projeto Vercel, ex:
`https://ml-pendencias-api.vercel.app`

---

## ETAPA 4 — Configurar a Extensão Chrome

### 4.1 Editar `chrome-extension/content.js`

Abra o arquivo e substitua os valores no objeto `CFG` (linhas do início):

```javascript
const CFG = {
  supabaseUrl:  'https://XXXXXXXXXXXX.supabase.co',  // ← cole aqui
  supabaseKey:  'eyJhbGciOiJIUzI1Ni...',             // ← cole aqui
  apiBaseUrl:   'https://ml-pendencias-api.vercel.app', // ← cole aqui
  apiSecretKey: 'sua_chave_secreta_aqui',            // ← mesma que no Vercel
  emailTo:      'brunosims@gmail.com',               // ← pode alterar se quiser
};
```

### 4.2 Editar `chrome-extension/manifest.json`

Substitua o placeholder `SEU_PROJETO` pela URL real do Vercel em `host_permissions`:

```json
"host_permissions": [
  "https://*.mercadolivre.com.br/*",
  "https://*.mercadopago.com.br/*",
  "https://*.supabase.co/*",
  "https://ml-pendencias-api.vercel.app/*"   ← URL real aqui
]
```

### 4.3 Adicionar ícones

Coloque imagens PNG nas dimensões abaixo dentro de `chrome-extension/icons/`:

| Arquivo       | Tamanho |
|---------------|---------|
| `icon16.png`  | 16×16   |
| `icon48.png`  | 48×48   |
| `icon128.png` | 128×128 |

> Dica: use qualquer ferramenta (Figma, Canva, etc.) para criar um ícone simples com as letras "ML" ou um ícone de lista.

---

## ETAPA 5 — Carregar a Extensão no Chrome

1. Abra o Chrome e acesse `chrome://extensions/`
2. Ative o **Modo do desenvolvedor** (toggle no canto superior direito).
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta `chrome-extension/`.
5. A extensão aparecerá listada. ✅

---

## ETAPA 6 — Primeiro Uso

1. Acesse qualquer página do Mercado Livre (ex: uma venda em `www.mercadolivre.com.br`).
2. Passe o mouse sobre a **aba amarela** que aparece no canto direito da tela.
3. O painel lateral abrirá — faça login com o e-mail e senha criados no Supabase (Etapa 1.3).
4. Clique em **+ Criar Pendência** para capturar os dados da página atual.
5. Revise/edite os campos e clique em **Salvar**.

---

## Adaptando os Seletores de Captura

O arquivo `content.js` possui a função `capturePageData()` com seletores CSS genéricos.
Ao receber seu código específico de captura, substitua os seletores nessa função.

Procure o bloco:
```javascript
// ── Login do comprador ──────────────────────────────────────
// ── Número da venda ─────────────────────────────────────────
// ── Modelo do produto ───────────────────────────────────────
// ── Aro ─────────────────────────────────────────────────────
```

---

## Fluxo de E-mail

| Ação               | Destinatário          | Assunto                                  |
|--------------------|-----------------------|------------------------------------------|
| Enviar Remessa     | brunosims@gmail.com   | `Pendentes // DD/MM/AAAA`               |
| Enviar Individual  | brunosims@gmail.com   | `{Login} // Pendente // DD/MM/AAAA`     |

---

## Resumo de Arquivos

```
Gestor de Pendencia/
├── chrome-extension/
│   ├── manifest.json      ← configuração da extensão Chrome (MV3)
│   ├── content.js         ← toda a lógica da extensão
│   ├── content.css        ← estilos do painel lateral
│   ├── background.js      ← service worker (obrigatório MV3)
│   └── icons/             ← adicione icon16.png, icon48.png, icon128.png
│
└── vercel-api/
    ├── api/
    │   └── send-email.js  ← serverless function de envio de e-mail
    ├── package.json
    ├── vercel.json
    └── .env.example       ← modelo de variáveis de ambiente
```

---

## Problemas Comuns

| Problema | Solução |
|---|---|
| Login falha com "Invalid credentials" | Verifique e-mail/senha no Supabase → Authentication → Users |
| E-mail não chega | Verifique `RESEND_API_KEY` no Vercel e se o domínio remetente está verificado |
| Extensão não aparece na página | Verifique se a URL do ML está listada em `host_permissions` no `manifest.json` |
| Erro 401 na API | Confirme que `API_SECRET_KEY` no Vercel é igual ao `apiSecretKey` no `content.js` |
| Dados não capturados | Adapte os seletores em `capturePageData()` para a página específica |
