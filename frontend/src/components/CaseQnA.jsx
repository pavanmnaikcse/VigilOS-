import React, { useState, useRef, useEffect } from 'react';
import api from '../api';

export default function CaseQnA({ caseId }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`qna_${caseId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [{ role: 'ai', content: 'Hi, I am your AI assistant for this case. Ask me anything about the transactions, involved accounts, or compliance risks.' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(`qna_${caseId}`, JSON.stringify(messages));
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, caseId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ask', { case_id: caseId, question: userMsg });
      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
      
      // Auto-speak the AI response
      try {
        const ttsResponse = await api.post('/tts/generate', { text: data.answer }, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([ttsResponse.data], { type: 'audio/wav' }));
        const audio = new Audio(url);
        audio.play().catch(e => console.error("Audio auto-play blocked", e));
      } catch (ttsErr) {
        console.error("TTS failed", ttsErr);
      }
      
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Error: Could not fetch answer. ' + (err.response?.data?.message || err.message) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 border border-slate-700 rounded-lg overflow-hidden min-h-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 text-sm bg-slate-700 text-slate-400 rounded-bl-none italic">
              Analyzing...
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question about this case..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
        <button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
