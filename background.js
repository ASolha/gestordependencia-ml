/* =======================================================
   GESTOR DE PENDÊNCIAS ML — Service Worker (MV3)
   =======================================================
   chrome.identity só funciona no background (service worker).
   O content.js envia uma mensagem pedindo o token OAuth,
   e este worker devolve o token do Gmail do usuário logado.
   ======================================================= */

const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // ── Pedido de token Gmail ─────────────────────────────────
  if (message.type === 'GET_GMAIL_TOKEN') {
    // Tenta primeiro sem interação (cache)
    chrome.identity.getAuthToken({ interactive: false, scopes: GMAIL_SCOPES }, (cachedToken) => {
      if (!chrome.runtime.lastError && cachedToken) {
        sendResponse({ token: cachedToken });
        return;
      }
      // Se não há cache ou houve erro, pede interativamente
      chrome.identity.getAuthToken({ interactive: true, scopes: GMAIL_SCOPES }, (token) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else if (!token) {
          sendResponse({ error: 'Token não obtido. Verifique as permissões OAuth2.' });
        } else {
          sendResponse({ token });
        }
      });
    });
    return true; // mantém o canal aberto para resposta assíncrona
  }

  // ── Revogar token (logout) ────────────────────────────────
  if (message.type === 'REVOKE_GMAIL_TOKEN') {
    chrome.identity.getAuthToken({ interactive: false, scopes: GMAIL_SCOPES }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`).catch(() => {});
        });
      }
    });
    return false;
  }

});

// Ao instalar a extensão
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('[Pendências ML] Extensão instalada.');
  }
});
