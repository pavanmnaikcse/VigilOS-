// On-device evaluation of simple fraud rules
// Evaluates locally before any network or BLE transmission

export function evaluateEdgeRules(transaction, accountHistory) {
  const flags = [];
  const now = new Date(transaction.timestamp);
  
  // 1. New payee (not in saved payee list or history)
  const isKnownPayee = accountHistory.some(tx => 
    (tx.type === 'TRANSFER' && tx.oldbalanceDest === undefined /* just approximate from history */) || 
    (tx.recipient_account_id === transaction.receiver_account_id)
  );
  if (!isKnownPayee) {
    flags.push("new_payee");
  }

  // 2. Amount far outside typical range
  const pastAmounts = accountHistory.map(tx => tx.amount);
  if (pastAmounts.length > 0) {
    const avg = pastAmounts.reduce((a,b) => a+b, 0) / pastAmounts.length;
    // Simple stddev approx
    if (transaction.amount > avg * 3) {
      flags.push("high_amount");
    }
  }

  // 3. Velocity (2+ transfers within last 1 hour)
  const oneHourAgo = now.getTime() - (60 * 60 * 1000);
  const recentTx = accountHistory.filter(tx => tx.timestamp && tx.timestamp > oneHourAgo);
  if (recentTx.length >= 2) {
    flags.push("high_velocity");
  }

  // 4. Odd-hour transaction (e.g. 1 AM to 5 AM)
  const hour = now.getHours();
  if (hour >= 1 && hour <= 5) {
    flags.push("odd_hour");
  }

  return flags;
}

// Web Crypto HMAC signing
export async function signPayload(payloadObject, secretKeyString) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKeyString),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  // Sort keys to ensure consistent signature
  const sortedPayload = JSON.stringify(payloadObject, Object.keys(payloadObject).sort());
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    keyMaterial,
    enc.encode(sortedPayload)
  );
  
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
