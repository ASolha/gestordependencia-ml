/* =======================================================
   GESTOR DE PENDÊNCIAS ML — Vercel Serverless Function
   POST /api/send-email
   =======================================================
   Dependências: npm install resend
   Variáveis de ambiente necessárias no Vercel:
     RESEND_API_KEY     — chave da API do Resend
     FROM_EMAIL         — remetente (ex: pendencias@seudominio.com)
     API_SECRET_KEY     — chave secreta para autenticar a extensão
   ======================================================= */

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ── CORS helper ──────────────────────────────────────────────
function setCors(res) {
  // Permite apenas origem de extensões Chrome (chrome-extension://)
  // e localhost para testes. Ajuste conforme necessário.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
}

// ── Handler principal ────────────────────────────────────────
module.exports = async function handler(req, res) {
  setCors(res);

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Autenticação por chave secreta ──────────────────────────
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── Validação do body ───────────────────────────────────────
  const { to, subject, html } = req.body || {};

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Campos obrigatórios: to, subject, html' });
  }

  // E-mail válido simples
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: 'E-mail inválido' });
  }

  // ── Envio via Resend ────────────────────────────────────────
  try {
    const fromEmail = process.env.FROM_EMAIL || 'Pendências ML <noreply@resend.dev>';

    const { data, error } = await resend.emails.send({
      from:    fromEmail,
      to:      [to],
      subject: subject,
      html:    html,
    });

    if (error) {
      console.error('[send-email] Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[send-email] Enviado: ${subject} → ${to} (id: ${data?.id})`);
    return res.status(200).json({ success: true, id: data?.id });

  } catch (err) {
    console.error('[send-email] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
};
