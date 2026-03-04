// Execute: node get-key.js
// Gera a chave pública para colocar no manifest.json
const crypto = require('crypto');
const fs     = require('fs');

const pem        = fs.readFileSync('chrome-extension.pem');
const privateKey = crypto.createPrivateKey(pem);
const publicKey  = crypto.createPublicKey(privateKey);
const der        = publicKey.export({ type: 'spki', format: 'der' });
const key        = der.toString('base64');

console.log('\n✅ Cole este valor no campo "key" do manifest.json:\n');
console.log(key);
console.log('');
