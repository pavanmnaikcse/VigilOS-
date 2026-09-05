import re

with open('src/components/vigilos/TopHeader.tsx', 'r') as f:
    content = f.read()

# 1. Add state for connecting
state_import = "const [apiModalOpen, setApiModalOpen] = useState(false);"
new_state = state_import + "\n  const [gatewayStatus, setGatewayStatus] = useState<'idle'|'connecting'|'connected'>('idle');"
content = content.replace(state_import, new_state)

# 2. Add connection function
func = '''
  const connectGateway = async () => {
    setGatewayStatus('connecting');
    try {
      const res = await fetch("http://localhost:8000/api/gateway/connect", { method: "POST" });
      const data = await res.json();
      if(data.status === "success") {
        setGatewayStatus('connected');
        setTimeout(() => setGatewayStatus('idle'), 3000);
      } else {
        setGatewayStatus('idle');
        alert("Failed to connect: " + data.message);
      }
    } catch (err) {
      setGatewayStatus('idle');
      alert("Error connecting to gateway");
    }
  };
'''

content = content.replace("export function TopHeader() {", "export function TopHeader() {\n" + func)

# 3. Add onClick to button and change text based on status
old_button = '''        <button
          className="flex items-center gap-2 rounded-lg px-3.5 py-[8px] text-[12px] font-semibold text-white transition-transform hover:scale-[1.02]"
          style={{
            background: "linear-gradient(95deg, #6d3ff3, #0ea5e9 55%, #00e5ff)",
            boxShadow: "0 0 26px -10px rgba(0,229,255,0.9)",
          }}
        >
          <Smartphone size={14} className="shrink-0" />
          <span className="hidden sm:inline">Connect Mobile Gateway</span>
          <span className="sm:hidden">Gateway</span>
        </button>'''

new_button = '''        <button
          onClick={connectGateway}
          disabled={gatewayStatus === 'connecting'}
          className="flex items-center gap-2 rounded-lg px-3.5 py-[8px] text-[12px] font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
          style={{
            background: gatewayStatus === 'connected' ? "linear-gradient(95deg, #10b981, #34d399)" : "linear-gradient(95deg, #6d3ff3, #0ea5e9 55%, #00e5ff)",
            boxShadow: gatewayStatus === 'connected' ? "0 0 26px -10px rgba(16,185,129,0.9)" : "0 0 26px -10px rgba(0,229,255,0.9)",
          }}
        >
          <Smartphone size={14} className={gatewayStatus === 'connecting' ? 'animate-pulse' : ''} />
          <span className="hidden sm:inline">
            {gatewayStatus === 'connecting' ? 'Connecting...' : gatewayStatus === 'connected' ? 'Connected!' : 'Connect Mobile Gateway'}
          </span>
          <span className="sm:hidden">
            {gatewayStatus === 'connecting' ? '...' : gatewayStatus === 'connected' ? 'OK' : 'Gateway'}
          </span>
        </button>'''

content = content.replace(old_button, new_button)

with open('src/components/vigilos/TopHeader.tsx', 'w') as f:
    f.write(content)
