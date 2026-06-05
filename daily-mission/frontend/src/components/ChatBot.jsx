import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, Image as ImageIcon } from 'lucide-react';
import { chatApi } from '../lib/api';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m BioNEET AI Assistant. Ask me about NEET, EAPCET BiPC, study plans, or upload an image for analysis.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const sessionId = useRef(`session-${Date.now()}`);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      chatApi.getHistory(sessionId.current)
        .then((res) => {
          if (res.data.length > 0) setMessages(res.data);
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMsg = input.trim();
    setInput('');
    const imageUrl = selectedImage;
    setSelectedImage(null);

    setMessages((prev) => [...prev, { role: 'user', content: userMsg, imageUrl }]);
    setLoading(true);

    try {
      const res = await chatApi.send({
        message: userMsg,
        imageUrl: imageUrl?.startsWith('data:') ? null : imageUrl,
        imageData: imageUrl?.startsWith('data:') ? imageUrl : null,
        sessionId: sessionId.current,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t respond. Please check your connection and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 bg-primary-500 hover:bg-primary-400 text-white rounded-full shadow-lg flex items-center justify-center glow-effect"
        title="BioNEET AI Assistant"
      >
        <MessageCircle size={24} />
      </button>

      {open && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md h-[500px] glass-panel rounded-2xl flex flex-col border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <div className="text-white font-semibold">BioNEET AI Assistant</div>
              <div className="text-xs text-slate-500">NEET · EAPCET · BiPC</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.imageUrl && (
                  <img src={m.imageUrl} alt="uploaded" className="max-w-[200px] rounded-lg mb-1" />
                )}
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-primary-500/30 text-white' : 'bg-white/5 text-slate-300'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 size={16} className="animate-spin" /> Thinking...</div>}
            <div ref={bottomRef} />
          </div>

          {selectedImage && (
            <div className="p-2 border-t border-white/10">
              <div className="relative inline-block">
                <img src={selectedImage} alt="preview" className="max-w-[100px] rounded-lg" />
                <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button>
              </div>
            </div>
          )}

          <form onSubmit={send} className="p-3 border-t border-white/10 flex gap-2">
            <label className="p-2 bg-white/5 rounded-xl cursor-pointer text-slate-300 hover:bg-white/10">
              <ImageIcon size={18} />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about NEET, EAPCET, biology..."
              className="flex-1 bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500/50"
            />
            <button type="submit" disabled={loading} className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-400 disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
