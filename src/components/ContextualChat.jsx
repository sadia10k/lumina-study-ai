import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { chatWithContext } from '../lib/gemini';
import './ContextualChat.css';
import './Markdown.css';

const ContextualChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! I am Lumina, grounded in your study material. What would you like to know?' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    if (e.key && e.key !== 'Enter') return;
    if (e.type === 'click' || e.key === 'Enter') {
      if (!input.trim()) return;

      const userMsg = input.trim();
      setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
      setInput('');
      setIsTyping(true);

      const rawText = localStorage.getItem('lumina_raw_text') || 'No document loaded. Please upload a document first.';

      try {
        const reply = await chatWithContext(rawText, userMsg);
        setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      } catch (err) {
        let msg = 'Error connecting to Gemini Chat API.';
        if (err.message) msg += ` (${err.message})`;
        setMessages(prev => [...prev, { sender: 'bot', text: msg }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <>
      <button 
        className="chat-fab" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <span style={{ fontSize: '1.5rem' }}>💬</span>
      </button>

      {isOpen && (
        <aside className="chat-widget glass-panel fade-in">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: '600' }}>Lumina Assistant</h3>
            </div>
            <button className="small-btn close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div ref={scrollRef} className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>
                {msg.sender === 'bot' ? (
                   <div className="markdown-body" style={{ color: 'inherit', fontSize: 'inherit' }} dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                ) : (
                   msg.text
                )}
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble bot typing">
                Thinking...
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Ask about your material..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleSend}
              disabled={isTyping}
            />
            <button className="chat-send-btn" onClick={handleSend} disabled={isTyping}>
              <span style={{ transform: 'rotate(45deg)', display: 'inline-block' }}>➤</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};

export default ContextualChat;
