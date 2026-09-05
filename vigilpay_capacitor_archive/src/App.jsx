import React, { useState, useEffect } from 'react';
import seedData from './seed_data.json';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { evaluateEdgeRules, signPayload } from './edgeRules';
import './App.css';

const GATEWAY_SERVICE = "0000FF00-0000-1000-8000-00805F9B34FB";
const GATEWAY_CHARACTERISTIC = "0000FF01-0000-1000-8000-00805F9B34FB";
const DEMO_SECRET_KEY = "vigilos_offline_demo_secret";

function App() {
  const [account, setAccount] = useState(null);
  const [deviceId, setDeviceId] = useState('');
  const [view, setView] = useState('home'); // home, send, settings
  const [recipient, setRecipient] = useState('');
  const [newAccountId, setNewAccountId] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Heartbeat to check laptop connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch('https://particular-victor-coating-rise.trycloudflare.com/ping', { signal: AbortSignal.timeout(2000) });
        if (res.ok) setIsConnected(true);
        else setIsConnected(false);
      } catch (err) {
        setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate a permanent device ID for this install
    let storedDeviceId = localStorage.getItem('vigilpay_device_id');
    if (!storedDeviceId) {
      storedDeviceId = `DEV-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('vigilpay_device_id', storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    const saved = localStorage.getItem('vigilpay_account');
    let currentAccount;
    if (saved) {
      currentAccount = JSON.parse(saved);
      setAccount(currentAccount);
    } else {
      currentAccount = seedData[Math.floor(Math.random() * seedData.length)];
      localStorage.setItem('vigilpay_account', JSON.stringify(currentAccount));
      setAccount(currentAccount);
    }

    // Attempt to sync local balance to the gateway in case the gateway was restarted
    fetch(`https://particular-victor-coating-rise.trycloudflare.com/balance/${currentAccount.account_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: currentAccount.starting_balance })
    }).catch(() => {});
  }, []);

  const handlePay = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus('Invalid amount.');
      return;
    }
    
    // Ordering constraint to enforce in the UI (Phase 15)
    if (parsedAmount > account.starting_balance) {
      setStatus('Insufficient funds. Cannot send money.');
      return;
    }

    setStatus('Evaluating Edge Rules...');
    const txData = {
      receiver_account_id: recipient,
      amount: parsedAmount,
      timestamp: Date.now()
    };
    
    const localFlags = evaluateEdgeRules(txData, account.history);
    console.log("Edge Rule Flags:", localFlags);
    
    let activeDevice = null;
    try {
      setStatus('Initializing Bluetooth...');
      await BleClient.initialize();
      setStatus('Scanning for Gateway...');
      
      try {
        // Phase 14/15 mock: Bypass native dialog
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("Phase 14/15 mock: Gateway not built yet");
        
        // --- REAL BLE CODE (Phase 16) ---
        // const device = await BleClient.requestDevice({ services: [GATEWAY_SERVICE] });
        // activeDevice = device.deviceId;
        // await BleClient.connect(device.deviceId);
        // ...
      } catch (scanErr) {
        // Build the full payload for Phase 15
        const payloadBase = {
          txn_id: `TXN-${Date.now()}`,
          sender_account_id: account.account_id,
          receiver_account_id: recipient,
          amount: parsedAmount,
          timestamp: txData.timestamp,
          device_id: deviceId,
          local_flags: localFlags
        };
        
        // Sign the payload
        const signature = await signPayload(payloadBase, DEMO_SECRET_KEY);
        const signedPayload = { ...payloadBase, signature };
        
        console.log("Final Signed BLE Payload:", signedPayload);
        
        // POST to our local WebSocket/HTTP Relay (running on PC via adb reverse)
        const relayResponse = await fetch('https://particular-victor-coating-rise.trycloudflare.com/ble/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signedPayload)
        });
        
        if (!relayResponse.ok) {
          const errData = await relayResponse.json().catch(() => ({}));
          throw new Error(errData.error || `Relay rejected payload: ${relayResponse.status}`);
        }
        
        setStatus(`Success! (Relayed to Gateway)\nFlags: ${localFlags.join(', ') || 'None'}`);
        setTimeout(() => {
          // Deduct from balance locally for the sender
          const updatedAccount = { ...account };
          updatedAccount.starting_balance -= parsedAmount;
          updatedAccount.history = [{
            type: 'TRANSFER',
            amount: parsedAmount,
            recipient_account_id: recipient,
            timestamp: Date.now()
          }, ...updatedAccount.history];
          
          setAccount(updatedAccount);
          localStorage.setItem('vigilpay_account', JSON.stringify(updatedAccount));
          
          setView('home');
          setStatus('');
        }, 4000);
      }
      
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
      if (activeDevice) {
        try { await BleClient.disconnect(activeDevice); } catch(e) {}
      }
    }
  };

  // Fetch live balance from the Gateway mock ledger when returning home
  useEffect(() => {
    if (view === 'home' && account) {
      fetch(`https://particular-victor-coating-rise.trycloudflare.com/balance/${account.account_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.balance !== null && data.balance !== account.starting_balance) {
            const updated = { ...account, starting_balance: data.balance };
            setAccount(updated);
            localStorage.setItem('vigilpay_account', JSON.stringify(updated));
          }
        })
        .catch(err => console.log("Offline or no ledger data"));
    }
  }, [view, account?.account_id]);

  if (!account) return <div>Loading...</div>;

  return (
    <div className="container">
      <header style={{ position: 'relative' }}>
        <h1>VigilPay</h1>
        <p className="identity">Welcome, {account.name}</p>
        <div style={{
          position: 'absolute', top: '20px', right: '20px',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', fontWeight: 'bold', color: isConnected ? '#4ade80' : '#f87171'
        }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: isConnected ? '#4ade80' : '#f87171',
            boxShadow: `0 0 8px ${isConnected ? '#4ade80' : '#f87171'}`
          }}></div>
          {isConnected ? 'Connected to Gateway' : 'Disconnected'}
        </div>
      </header>

      {view === 'home' && (
        <main>
          <div className="balance-card">
            <h2>Current Balance</h2>
            <div className="balance">${account.starting_balance.toFixed(2)}</div>
            <div className="acc-id">ID: {account.account_id}</div>
          </div>

          <button className="primary-btn" onClick={() => setView('send')}>
            Send Money
          </button>
          
          <button className="secondary-btn" onClick={() => {
            setNewAccountId(account.account_id);
            setNewBalance(account.starting_balance);
            setView('settings');
          }} style={{marginTop: '10px'}}>
            Developer Settings
          </button>

          <div className="history">
            <h3>Recent Transactions</h3>
            {account.history.map((tx, i) => (
              <div key={i} className="tx-row">
                <span className="tx-type">{tx.type}</span>
                <span className="tx-amount">${tx.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </main>
      )}

      {view === 'send' && (
        <main>
          <h2>Send Money</h2>
          <div className="form-group">
            <label>Recipient Account ID</label>
            <input 
              type="text" 
              value={recipient} 
              onChange={e => setRecipient(e.target.value)} 
              placeholder="e.g. ACC_1_12345"
            />
          </div>
          <div className="form-group">
            <label>Amount ($)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="0.00"
            />
          </div>
          
          <button className="primary-btn scan-btn" onClick={handlePay}>
            Scan to Pay (BLE)
          </button>
          <button className="secondary-btn" onClick={() => { setView('home'); setStatus(''); }}>
            Cancel
          </button>

          {status && <div className="status-message">{status}</div>}
        </main>
      )}

      {view === 'settings' && (
        <main>
          <h2>Developer Settings</h2>
          <p style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>
            Change your local account identity to simulate multiple phones.
          </p>
          <div className="form-group">
            <label>Account ID (e.g., ACC_999)</label>
            <input 
              type="text" 
              value={newAccountId} 
              onChange={e => setNewAccountId(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Balance ($)</label>
            <input 
              type="number" 
              value={newBalance} 
              onChange={e => setNewBalance(e.target.value)} 
            />
          </div>
          
          <button className="primary-btn" onClick={() => {
            const parsedBalance = parseFloat(newBalance) || 0;
            const updatedAccount = {
              ...account,
              account_id: newAccountId,
              starting_balance: parsedBalance,
              history: []
            };
            setAccount(updatedAccount);
            localStorage.setItem('vigilpay_account', JSON.stringify(updatedAccount));
            
            // Sync with Gateway ledger
            fetch(`https://particular-victor-coating-rise.trycloudflare.com/balance/${newAccountId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ balance: parsedBalance })
            }).catch(e => console.log("Failed to sync balance with Gateway"));
            
            setView('home');
          }}>
            Save & Apply
          </button>
          <button className="secondary-btn" onClick={() => setView('home')}>
            Cancel
          </button>
        </main>
      )}
    </div>
  );
}

export default App;
