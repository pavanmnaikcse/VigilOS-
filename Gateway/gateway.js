const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const DEMO_SECRET_KEY = "vigilos_offline_demo_secret";

// In-memory mock ledger for the demo to sync balances across the single phone
const ledger = {};

// Polyfill for signature verification that mimics Web Crypto HMAC SHA-256
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', DEMO_SECRET_KEY);
  const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort());
  hmac.update(sortedPayload);
  const expectedSignature = hmac.digest('hex');
  return expectedSignature === signature;
}

app.get('/ping', (req, res) => res.send('ok'));

app.post('/ble/write', async (req, res) => {
  const data = req.body;
  console.log(`\n[GATEWAY] Received BLE payload from ${data.device_id}`);
  
  // Extract signature and payload
  const { signature, ...payloadBase } = data;
  
  // Verify signature
  const isValid = verifySignature(payloadBase, signature);
  if (!isValid) {
    console.error("[GATEWAY] ❌ Signature verification failed! Tampering detected.");
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  console.log("[GATEWAY] ✅ Signature verified successfully.");
  console.log("[GATEWAY] 🚀 Forwarding to Track A Backend...");
  
  try {
    // Update the mock ledger so the UI can reflect the transfer
    const sender = payloadBase.sender_account_id;
    const receiver = payloadBase.receiver_account_id;
    const amt = payloadBase.amount;
    
    if (ledger[sender] === undefined) ledger[sender] = 50000; // Default starting balance
    if (ledger[receiver] === undefined) ledger[receiver] = 0;
    
    if (ledger[sender] < amt) {
      console.error("[GATEWAY] ❌ Insufficient funds.");
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    ledger[sender] -= amt;
    ledger[receiver] += amt;

    // Phase 16: Forward to Backend
    // The backend investigate endpoint expects a 'transaction' wrapper
    const backendReq = {
      transaction: {
        step: 1,
        type: 'TRANSFER',
        amount: payloadBase.amount,
        nameOrig: payloadBase.sender_account_id,
        oldbalanceOrg: 0, // Mocked for now, real system would use a ledger
        newbalanceOrig: 0,
        nameDest: payloadBase.receiver_account_id,
        oldbalanceDest: 0,
        newbalanceDest: 0,
        isFraud: 0,
        isFlaggedFraud: 0,
        ...payloadBase // merge in txn_id, local_flags, device_id
      },
      messages: [],
      urls: []
    };
    
    // We send to 127.0.0.1:8000 which is the mapped port for Docker backend
    const response = await fetch('http://127.0.0.1:8000/api/investigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendReq)
    });
    
    if (response.ok) {
      console.log("[GATEWAY] ✅ Successfully forwarded to Backend.");
      res.json({ success: true, forwarded: true });
    } else {
      console.error(`[GATEWAY] ❌ Backend returned error: ${response.status}`);
      res.status(500).json({ error: 'Backend error' });
    }
  } catch (err) {
    console.error(`[GATEWAY] ❌ Failed to reach backend: ${err.message}`);
    res.status(500).json({ error: 'Backend unreachable' });
  }
});

app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/balance/:id', (req, res) => {
  const accountId = req.params.id;
  const balance = ledger[accountId] !== undefined ? ledger[accountId] : null;
  res.json({ balance });
});

app.post('/balance/:id', (req, res) => {
  const accountId = req.params.id;
  const newBalance = req.body.balance;
  if (newBalance !== undefined) {
    ledger[accountId] = parseFloat(newBalance);
  }
  res.json({ success: true, balance: ledger[accountId] });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[GATEWAY] WebSocket/HTTP Relay listening on port ${PORT}`);
  console.log(`[GATEWAY] Ready to receive mock BLE requests...`);
});
