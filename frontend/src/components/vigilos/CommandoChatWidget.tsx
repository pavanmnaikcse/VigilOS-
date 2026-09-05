import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, Send, X, Bot, User, Command } from 'lucide-react';
import api from '@/api';

export function CommandoChatWidget({ onClose }) {
  const [messages, setMessages] = useState([{ role: 'ai', content: 'VigilOS Commander Online. How can I assist you, sir?' }]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const scrollRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let wsTimeout;
    const connectWS = () => {
      wsRef.current = new WebSocket("ws://localhost:8000/api/commando/ws");
      
      wsRef.current.onopen = () => {
        wsRef.current?.send(JSON.stringify({ type: "set_context", path: location.pathname }));
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setProcessing(false);
        
        if (data.type === "speech_text") {
          setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
          try {
            const utter = new SpeechSynthesisUtterance(data.text);
            window.speechSynthesis.speak(utter);
          } catch (e) {}
        } else if (data.type === "action" && data.action === "navigate") {
          navigate(data.path);
        } else if (data.type === "status") {
          setProcessing(true);
        }
      };
      
      wsRef.current.onclose = () => {
        wsTimeout = setTimeout(connectWS, 3000);
      };
    };
    
    connectWS();
    
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      recRef.current = new SR();
      recRef.current.continuous = false;
      recRef.current.interimResults = false;
      recRef.current.lang = "en-US";
      
      recRef.current.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        handleSend(transcript);
        setListening(false);
      };
      
      recRef.current.onerror = () => setListening(false);
      recRef.current.onend = () => setListening(false);
    }
    
    return () => {
      clearTimeout(wsTimeout);
      if (wsRef.current) wsRef.current.close();
      window.speechSynthesis.cancel();
    };
  }, [navigate]);

  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "set_context", path: location.pathname }));
    }
  }, [location.pathname]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setProcessing(true);
    setInput('');
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "command", text: text }));
    }
  };

  const toggleMic = () => {
    if (!recRef.current) return;
    if (listening) {
      recRef.current.stop();
      setListening(false);
    } else {
      recRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="flex flex-col w-[380px] h-[550px] bg-slate-900 border border-cyan/30 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,229,255,0.15)] text-sm">
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-cyan/20">
        <div className="flex items-center gap-2 text-cyan font-bold tracking-wider text-xs">
          <Command size={16} /> VIGILOS COMMANDER
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={"flex gap-2 " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'ai' && <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center shrink-0"><Bot size={14} className="text-cyan" /></div>}
            <div className={"max-w-[85%] rounded-lg p-3 whitespace-pre-wrap leading-relaxed " + (msg.role === 'user' ? 'bg-cyan/20 text-cyan-50 rounded-br-none border border-cyan/30' : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700')}>
              {msg.content}
            </div>
          </div>
        ))}
        {processing && (
          <div className="flex gap-2 justify-start items-center text-slate-400 italic text-xs">
            <Bot size={14} /> Processing command...
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-3 bg-slate-800 border-t border-cyan/20 flex items-center gap-2">
        <button type="button" onClick={toggleMic} className={"p-2 rounded-full transition-colors " + (listening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-700 text-slate-400 hover:text-cyan')}>
          <Mic size={18} />
        </button>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question or issue a command..." 
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan/50"
        />
        <button type="submit" disabled={!input.trim() && !processing} className="p-2 bg-cyan/20 text-cyan rounded-lg hover:bg-cyan/30 disabled:opacity-50 transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
