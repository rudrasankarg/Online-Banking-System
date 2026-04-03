import { MessageCircle, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm Luxie, your virtual assistant. How can I help you with your banking today?" }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!mounted) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "I'm sorry, I didn't understand that. Please contact support at 1-800-123-4567.";
      const lower = userMsg.toLowerCase();
      
      if (lower.includes('loan')) botResponse = "We offer Personal, Home, and Car loans. Check the /loans page to apply instantly!";
      else if (lower.includes('account')) botResponse = "You can open an account via the /register page or visit the /accounts portal.";
      else if (lower.includes('card')) botResponse = "Looking for cards? We have premium credit and debit cards. Navigate to /cards to explore.";
      else if (lower.includes('nri') || lower.includes('international')) botResponse = "For NRI and international banking, please visit our dedicated /nri portal for multi-currency accounts.";
      else if (lower.includes('hello') || lower.includes('hi')) botResponse = "Hello there! How can I assist you with your banking needs today?";
      else if (lower.includes('balance')) botResponse = "Please login to your NetBanking dashboard to check your balance securely.";

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {isOpen && (
        <div style={{ background: 'var(--card-bg)', width: '320px', borderRadius: '12px 12px 0 12px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid var(--card-border)', overflow: 'hidden', marginBottom: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>L</div>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>Ask Luxie</p>
                <p style={{ fontSize: '10px', opacity: 0.8, margin: 0 }}>Virtual Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>
          
          <div style={{ height: '260px', padding: '16px', overflowY: 'auto', background: '#020617', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={
                msg.sender === 'user' 
                ? { background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '12px 12px 4px 12px', alignSelf: 'flex-end', maxWidth: '85%' }
                : { background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px 12px 12px 4px', alignSelf: 'flex-start', maxWidth: '85%', color: 'white', lineHeight: '1.4' }
              }>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid var(--card-border)', background: 'var(--card-bg)', display: 'flex' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." 
              style={{ width: '100%', fontSize: '14px', border: 'none', outline: 'none', background: 'transparent', color: 'white' }} 
            />
            <button onClick={handleSend} style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '14px', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 8px' }}>Send</button>
          </div>
        </div>
      )}

      <button 
        id="luxie-chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '64px', height: '64px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', cursor: 'pointer', marginLeft: 'auto', border: '2px solid rgba(255,255,255,0.2)' }}
        aria-label="Toggle Support Chat"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
