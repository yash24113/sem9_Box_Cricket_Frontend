// src/components/Footer.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Footer = () => {
  /* ================= Chat widget state ================= */
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! How can I help you with Box Cricket today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);

  /* ================= Scroll-to-top state ================= */
  const [showUp, setShowUp] = useState(false);

  useEffect(() => {
    if (showChat && inputRef.current) inputRef.current.focus();
  }, [showChat]);

  useEffect(() => {
    const onScroll = () => setShowUp(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (editIndex !== null) {
      const updatedMessages = [...messages];
      updatedMessages[editIndex] = { from: "user", text: input };
      setMessages(updatedMessages);
      setEditIndex(null);
    } else {
      setMessages((prev) => [...prev, { from: "user", text: input }]);
    }

    const lower = input.toLowerCase();
    setInput("");
    setLoading(true);

    let bot = "Sorry, I didn’t quite get that.";
    if (lower.includes("hello") || lower.includes("hi")) {
      bot = "Hey there! How can I assist you with Box Cricket today?";
    } else if (lower.includes("book") || lower.includes("slot")) {
      bot = "To book a slot, select an area and choose an available time slot from our booking screen.";
    } else if (lower.includes("recommanded") || lower.includes("rec")) {
      bot = "🕒 Slot in Vasna: 22:00 - 23:30 for ₹200";
    } else if (lower.includes("isanpur")) {
      bot = `We have 3 slots in Isanpur:\n• 08:00 - 09:00 (₹200)\n• 22:59 - 23:02 (₹850)\n• 13:36 - 13:38 (₹300)`;
    } else if (lower.includes("team") || lower.includes("developer")) {
      bot = `Our Team:\n👨‍💻 Yash Khalas – Backend + Frontend\n👩‍💻 Mita Kanzariya – Frontend + Guide\n👨‍💻 Nayan Pitroda – Frontend + Guide`;
    } else if (lower.includes("features") || lower.includes("services")) {
      bot = `🏏 Features:\n• Easy Online Booking\n• Real-Time Availability\n• Secure Payments\n• Premium Turf Locations`;
    } else if (lower.includes("help")) {
      bot = `Sure! You can ask me about:\n- Slot availability in an area\n- Our services & features\n- Booking instructions\n- Our team`;
    } else if (lower.includes("area list") || lower.includes("area")) {
      bot = `The areas we offer are:\n• Vasna\n• Isanpur\n• Maninagar\n• Satellite\n• Nikol`;
    } else if (lower.includes("area wise slot price")) {
      bot = `Here are some area-wise slot prices:\n• Vasna: ₹200\n• Isanpur: ₹200 - ₹850\n• Maninagar: ₹300\n• Satellite: ₹250\n• Nikol: ₹300`;
    } else if (
      lower.includes("area list for low price") ||
      lower.includes("best for user")
    ) {
      bot = `The areas with the lowest price are:\n• Vasna (₹200)\n• Isanpur (₹200)\n• Satellite (₹250)`;
    } else if (lower.includes("best area name") || lower.includes("best area")) {
      bot = `The best area with the lowest price and more time duration is Vasna. We have a 1.5-hour slot (22:00 - 23:30) for ₹200.`;
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: bot }]);
      setLoading(false);
    }, 500);
  };

  const handleEditMessage = (i) => {
    setEditIndex(i);
    setInput(messages[i].text);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    setMessages([{ from: "bot", text: "Hi there! How can I help you with Box Cricket today?" }]);
  };

  const userHistory = messages.filter((m) => m.from === "user");

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Scoped styles */}
      <style>{css}</style>

      {/* ====== Professional Footer ====== */}
      <footer className="pro-footer">
        <div className="pf-container">
          {/* Brand / About */}
          <div className="pf-col">
            <div className="pf-brand">
              <img src={logo} alt="Box Cricket" className="pf-logo" />
              <div className="pf-name">Box Cricket</div>
            </div>
            <p className="pf-about">
              Premium turf bookings across the city. Real-time availability,
              secure payments, and smooth match-day experience.
            </p>
            <div className="pf-social">
              <a href="#" aria-label="Instagram" className="pf-social-btn" title="Instagram">
                {/* Instagram icon */}
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3a6 6 0 110 12 6 6 0 010-12zm0 2.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM18 6.5a1 1 0 110 2 1 1 0 010-2z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="pf-social-btn" title="Twitter / X">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.53 3H20l-5.09 5.82L21 21h-6.54l-4.08-5.31L5 21H3l5.52-6.3L3 3h6.63l3.7 4.99L17.53 3zm-2.31 16h2.08L9.41 5H7.2l8.02 14z"/>
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="pf-social-btn" title="YouTube">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M23.5 6.2s-.2-1.7-.8-2.4c-.8-.8-1.7-.8-2.1-.9C17.2 2.5 12 2.5 12 2.5h0s-5.2 0-8.6.4c-.5 0-1.4.1-2.1.9C.7 4.5.5 6.2.5 6.2S0 8.2 0 10.3v1.3c0 2.1.5 4.1.5 4.1s.2 1.7.8 2.4c.8.8 1.9.8 2.4.9 1.7.2 7.3.4 8.3.4 0 0 5.2 0 8.6-.4.5-.1 1.4-.1 2.1-.9.6-.7.8-2.4.8-2.4s.5-2 .5-4.1v-1.3c0-2.1-.5-4.1-.5-4.1zM9.5 14.8V7.9l6.2 3.5-6.2 3.4z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="pf-col">
            <div className="pf-head">Quick Links</div>
            <ul className="pf-list">
              <li><Link to="/" className="pf-link">Home</Link></li>
              <li><Link to="/about" className="pf-link">About</Link></li>
              <li><Link to="/arealist" className="pf-link">Area</Link></li>
              <li><Link to="/gallery" className="pf-link">Gallery</Link></li>
              <li><Link to="/contact" className="pf-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="pf-col">
            <div className="pf-head">Support</div>
            <ul className="pf-list">
              <li><a href="#" className="pf-link">FAQ</a></li>
              <li><a href="#" className="pf-link">Payments & Refunds</a></li>
              <li><a href="#" className="pf-link">Terms & Conditions</a></li>
              <li><a href="#" className="pf-link">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="pf-col">
            <div className="pf-head">Contact</div>
            <ul className="pf-list pf-contact">
              <li>📍 Ahmedabad, Gujarat</li>
              <li>📞 +91-98765 43210</li>
              <li>✉️ support@boxcricket.example</li>
            </ul>
            <Link to="/arealist" className="pf-cta">Book a Slot</Link>
          </div>
        </div>

        <div className="pf-bottom">
          <div>© {new Date().getFullYear()} Box Cricket. All rights reserved.</div>
          <div className="pf-mini-links">
            <a href="#" className="pf-mini">Cookies</a>
            <a href="#" className="pf-mini">Legal</a>
            <a href="#" className="pf-mini">Sitemap</a>
          </div>
        </div>
      </footer>

      {/* ====== Floating Up Button & Chat ====== */}
      <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999, display: "grid", gap: 10 }}>
        {/* Scroll-to-top */}
        {showUp && (
          <button
            className="up-btn"
            aria-label="Scroll to top"
            onClick={scrollToTop}
            title="Back to top"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor" />
            </svg>
          </button>
        )}

        {/* Chat toggle / box */}
        {!showChat ? (
          <div className="chat-icon-wrapper">
            <button onClick={() => setShowChat(true)} className="chatbot-button" title="Ask me">
              🤖
            </button>
            <div className="ask-me-text">Ask Me</div>
          </div>
        ) : (
          <div className="chatbox">
            <div className="chatbox-header">
              <div className="chatbox-header-left">
                <img src={logo} alt="Box Cricket Logo" className="chatbox-logo" />
                <strong>YMN GPT • v2.0</strong>
              </div>
              <div>
                <button onClick={handleClearHistory} title="Clear chat history" className="chat-icon">🗑️</button>
                <button onClick={() => setShowChat(false)} className="chat-icon" aria-label="Close">×</button>
              </div>
            </div>

            <div className="chat-tools">
              <button onClick={() => setShowHistory((p) => !p)} className="history-toggle">
                {showHistory ? "Hide History" : "View History"}
              </button>
            </div>

            {showHistory && (
              <div className="chat-history">
                <strong style={{ fontSize: 13 }}>Your Questions:</strong>
                <ul style={{ paddingLeft: 15, fontSize: 13 }}>
                  {userHistory.map((msg, i) => (
                    <li key={i} style={{ margin: "4px 0" }}>{msg.text}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    margin: "6px 0",
                    textAlign: "left",
                    color: msg.from === "user" ? "#0b7a10" : "#333",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: msg.from === "user" ? "#e9f8ee" : "#f6f7f9",
                      padding: "10px 14px",
                      borderRadius: 14,
                      display: "inline-block",
                      maxWidth: "82%",
                      cursor: msg.from === "user" ? "pointer" : "default",
                      wordWrap: "break-word",
                    }}
                    onClick={() => msg.from === "user" && handleEditMessage(idx)}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              {loading && <div className="typing">YMN is typing...</div>}
            </div>

            <div className="chat-input-box">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask anything"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="chat-input"
              />
              <button onClick={handleSend} disabled={loading} className="chat-send-button">
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Footer;

/* ===================== Scoped CSS ===================== */
const css = `
:root{
  --brand:#0b7a10; --brand-2:#09640d; --surface:#ffffff; --ink:#0f172a;
  --muted:#6b7280; --line:#e5e7eb; --bg:#0a0f14;
}

/* ===== Footer ===== */
.pro-footer{
  background: linear-gradient(180deg, #0f172a 0%, #0b1224 100%);
  color:#e8f4ea;
  margin-top: 40px;
  border-top: 1px solid rgba(255,255,255,.06);
}
.pf-container{
  max-width: 1180px; margin: 0 auto; padding: 28px 16px 10px;
  display:grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
}
@media (max-width: 960px){ .pf-container{ grid-template-columns: repeat(2, 1fr);} }
@media (max-width: 560px){ .pf-container{ grid-template-columns: 1fr; } }

.pf-col{min-width:0}
.pf-brand{display:flex; align-items:center; gap:10px; margin-bottom:8px}
.pf-logo{width:38px; height:38px; object-fit:contain; border-radius:8px; background:#fff;}
.pf-name{font-weight:900; font-size:20px; letter-spacing:.3px}
.pf-about{color:#c5d1d7; margin: 8px 0 14px}

.pf-social{display:flex; gap:10px}
.pf-social-btn{
  display:inline-grid; place-items:center; width:34px; height:34px; border-radius:10px;
  background:#11371b; color:#bff3c7; border:1px solid rgba(255,255,255,.12); transition: transform .15s, background .2s;
}
.pf-social-btn:hover{ transform: translateY(-2px); background:#145020; }

.pf-head{font-weight:800; margin-bottom:10px; color:#dfffea; letter-spacing:.2px}
.pf-list{list-style:none; padding:0; margin:0; display:grid; gap:8px}
.pf-link{color:#cfead5; text-decoration:none}
.pf-link:hover{color:#ffffff; text-decoration:underline}
.pf-contact li{color:#cfead5}
.pf-cta{
  display:inline-flex; align-items:center; justify-content:center;
  margin-top:12px; padding:10px 14px; border-radius:999px; background:var(--brand);
  color:#fff; font-weight:800; text-decoration:none; box-shadow:0 8px 20px rgba(11,122,16,.35);
}
.pf-cta:hover{ background: var(--brand-2); }

.pf-bottom{
  border-top:1px solid rgba(255,255,255,.08);
  display:flex; align-items:center; justify-content:space-between;
  gap:12px; padding: 12px 16px; max-width:1180px; margin:0 auto; color:#cfead5;
}
.pf-mini-links{display:flex; gap:12px; flex-wrap:wrap}
.pf-mini{color:#bfead0; text-decoration:none; font-size:13px}
.pf-mini:hover{color:#fff; text-decoration:underline}

/* ===== Floating Up button ===== */
.up-btn{
  width:44px; height:44px; border-radius:999px; border:0; cursor:pointer;
  background:#ffffff; color:var(--brand);
  box-shadow:0 10px 28px rgba(0,0,0,.25), inset 0 0 0 2px #e6f6ea;
  transition: transform .16s ease, box-shadow .2s ease;
}
.up-btn:hover{ transform: translateY(-2px); box-shadow:0 14px 34px rgba(0,0,0,.28), inset 0 0 0 2px #d7f2e2 }

/* ===== Chat widget ===== */
.chat-icon-wrapper{position:relative; display:grid; place-items:center}
.chatbot-button{
  width:56px; height:56px; border-radius:50%; border:0; cursor:pointer;
  font-size:26px; background:var(--brand); color:#fff; box-shadow:0 10px 26px rgba(11,122,16,.35);
  transition: transform .16s ease, background .2s ease;
}
.chatbot-button:hover{ transform: translateY(-1px); background:var(--brand-2); }
.ask-me-text{
  background:#fff; color:var(--ink); padding:4px 8px; border-radius:10px; font-weight:700; font-size:12px; margin-top:8px;
  box-shadow:0 8px 20px rgba(0,0,0,.15);
}

.chatbox{
  width:min(360px, 86vw);
  background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e7e7e7;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  display:flex; flex-direction:column;
}
.chatbox-header{
  display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:linear-gradient(180deg,#ffffff,#f6fff6);
  border-bottom:1px solid #edf2ee;
}
.chatbox-header-left{display:flex; align-items:center; gap:8px}
.chatbox-logo{width:26px; height:26px; object-fit:contain; border-radius:6px}
.chat-icon{border:0; background:#fff; cursor:pointer; font-size:18px; margin-left:8px}
.chat-tools{ text-align:right; padding:6px 10px }
.history-toggle{
  border:1px solid #e5e7eb; background:#fff; padding:6px 10px; border-radius:999px; font-weight:700; cursor:pointer;
}
.chat-history{ padding: 0 12px 8px; border-bottom:1px dashed #e9ecef; color:#475569; background:#fafafa }

.chat-messages{ padding:12px; max-height:44vh; overflow:auto }
.typing{ color:#666; font-style:italic; padding:0 12px 8px }

.chat-input-box{ display:flex; gap:8px; padding:10px; border-top:1px solid #edf2ee; background:#fafafa }
.chat-input{
  flex:1; border:1px solid #e5e7eb; border-radius:12px; padding:10px 12px; outline:none; font-size:14px;
}
.chat-input:focus{ border-color:#cfead5; box-shadow:0 0 0 3px #e9f7ef }
.chat-send-button{
  border:0; background:var(--brand); color:#fff; padding:10px 14px; border-radius:12px; font-weight:800; cursor:pointer;
}
.chat-send-button:disabled{opacity:.7; cursor:not-allowed}
`;
