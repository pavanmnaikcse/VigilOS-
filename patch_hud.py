import re

with open(r'C:\Users\pn466\OneDrive\Documents\VigilOS\frontend\src\components\hud\VigilosHud.tsx', 'r') as f:
    content = f.read()

# Add useNavigate import
content = content.replace(
    'import { useCallback, useEffect, useMemo, useRef, useState } from "react";',
    'import { useCallback, useEffect, useMemo, useRef, useState } from "react";\nimport { useNavigate } from "react-router-dom";'
)

# Insert WebSocket logic inside VigilosHud
ws_logic = '''  const navigate = useNavigate();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let wsTimeout: any;
    const connectWebSocket = () => {
      socketRef.current = new WebSocket("ws://localhost:8000/api/commando/ws");
      
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "status") {
          runState("EXECUTING", 2000, "PROCESSING");
          setStatus(data.message.toUpperCase());
        }
        else if (data.type === "action") {
          if (data.action === "navigate") {
            navigate(data.path);
          }
        }
        else if (data.type === "speech_text") {
          runState("SUCCESS", 2000, "LISTENING");
          setStatus("RESPONDING");
          
          const utterance = new SpeechSynthesisUtterance(data.text);
          utterance.onend = () => {
            setStatus("STANDBY");
            setState("IDLE");
          };
          window.speechSynthesis.speak(utterance);
        }
      };
      
      socketRef.current.onclose = () => {
        wsTimeout = setTimeout(connectWebSocket, 3000);
      };
    };
    
    connectWebSocket();
    
    return () => {
      clearTimeout(wsTimeout);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
      window.speechSynthesis.cancel();
    };
  }, [navigate]);
'''

content = content.replace(
    '  const [coreNum, setCoreNum] = useState(13);\n\n  const rootRef',
    '  const [coreNum, setCoreNum] = useState(13);\n\n' + ws_logic + '\n  const rootRef'
)

# Update useVoiceEngine callback
old_voice = '''  const voice = useVoiceEngine((text) => {
    const cmd = matchCommand(text);
    if (!cmd) return;
    runState("COMMAND RECEIVED", 700, "PROCESSING");
    setStatus(cmd.status);
    setScanKey((k) => k + 1);
    setTimeout(() => runState("EXECUTING", 1100, "SUCCESS"), 750);
    setTimeout(() => {
      if (cmd.label === "STANDBY") {
        voiceRef.current?.stop();
        setStatus("STANDBY");
        setState("IDLE");
      } else if (cmd.label === "RESET") {
        setActive({});
        setStatus("SYSTEM RESET");
      }
    }, 2000);
    setTimeout(() => setState(voiceRef.current?.listening ? "LISTENING" : "IDLE"), 2600);
  });'''

new_voice = '''  const voice = useVoiceEngine((text) => {
    if (!text.trim()) return;
    runState("COMMAND RECEIVED", 700, "PROCESSING");
    setStatus("TRANSMITTING");
    setScanKey((k) => k + 1);
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "command", text: text }));
    }
  });'''

content = content.replace(old_voice, new_voice)

with open(r'C:\Users\pn466\OneDrive\Documents\VigilOS\frontend\src\components\hud\VigilosHud.tsx', 'w') as f:
    f.write(content)

print("Patched VigilosHud.tsx")
