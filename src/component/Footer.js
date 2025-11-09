import React, { useState, useEffect, useRef } from "react";
import "../Footer.css";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Footer = () => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! How can I help you with Box Cricket today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (showChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showChat]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (editIndex !== null) {
      const updatedMessages = [...messages];
      updatedMessages[editIndex] = { from: "user", text: input };
      setMessages(updatedMessages);
      setEditIndex(null);
    } else {
      const userMessage = { from: "user", text: input };
      setMessages(prev => [...prev, userMessage]);
    }

    setInput("");
    setLoading(true);

    const lowerInput = input.toLowerCase();
    let botReply = "Sorry, I didn’t quite get that.";

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      botReply = "Hey there! How can I assist you with Box Cricket today?";
    } else if (lowerInput.includes("book") || lowerInput.includes("slot")) {
      botReply = "To book a slot, select an area and choose an available time slot from our booking screen.";
    } else if (lowerInput.includes("recommanded") || lowerInput.includes("rec")) {
      botReply = "🕒 Slot in Vasna: 22:00 - 23:30 for ₹200";
    } else if (lowerInput.includes("isanpur")) {
      botReply = `We have 3 slots in Isanpur:\n• 08:00 - 09:00 (₹200)\n• 22:59 - 23:02 (₹850)\n• 13:36 - 13:38 (₹300)`;
    } else if (lowerInput.includes("team") || lowerInput.includes("developer")) {
      botReply = `Our Team:\n👨‍💻 Yash Khalas – Backend + Frontend\n👩‍💻 Mita Kanzariya – Frontend + Guide\n👨‍💻 Nayan Pitroda – Frontend + Guide`;
    } else if (lowerInput.includes("features") || lowerInput.includes("services")) {
      botReply = `🏏 Features:\n• Easy Online Booking\n• Real-Time Availability\n• Secure Payments\n• Premium Turf Locations`;
    } else if (lowerInput.includes("help")) {
      botReply = `Sure! You can ask me about:\n- Slot availability in an area\n- Our services & features\n- Booking instructions\n- Our team`;
    } else if (lowerInput.includes("area list") || lowerInput.includes("area")) {
      botReply = `The areas we offer are:\n• Vasna\n• Isanpur\n• Maninagar\n• Satellite\n• Nikol`;
    } else if (lowerInput.includes("area wise slot price")) {
      botReply = `Here are some area-wise slot prices:\n• Vasna: ₹200\n• Isanpur: ₹200 - ₹850\n• Maninagar: ₹300\n• Satellite: ₹250\n• Nikol: ₹300`;
    } else if (lowerInput.includes("area list for low price") || lowerInput.includes("best for user")) {
      botReply = `The areas with the lowest price are:\n• Vasna (₹200)\n• Isanpur (₹200)\n• Satellite (₹250)`;
    } else if (lowerInput.includes("features of cricket box")) {
      botReply = `The features of Box Cricket include:\n• Easy Online Booking\n• Real-Time Availability\n• Secure Payments\n• Premium Turf Locations\n• Multiple Time Slots to Choose From`;
    } else if (lowerInput.includes("best area name and slot time which is low price and more time duration") || lowerInput.includes("best area")) {
      botReply = `The best area with the lowest price and more time duration is Vasna. We have a 1.5-hour slot (22:00 - 23:30) for ₹200.`;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { from: "bot", text: botReply }]);
      setLoading(false);
    }, 500);
  };

  const handleEditMessage = (index) => {
    setEditIndex(index);
    setInput(messages[index].text);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    setMessages([{ from: "bot", text: "Hi there! How can I help you with Box Cricket today?" }]);
  };

  const userHistory = messages.filter(msg => msg.from === "user");

  return (
    <>
      <hr />
      <div className="footer">
        <p className="footer-text">
          Yash Khalas &copy; 2025 Box Cricket. All rights reserved.
        </p>
      </div>

      <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}>
        {!showChat ? (
          <div className="chat-icon-wrapper">
            <button
              onClick={() => setShowChat(true)}
              className="chatbot-button"
            >
              🤖
            </button>
            <div className="ask-me-text">Ask Me</div>
          </div>
        ) : (
          <div className="chatbox">
            <div className="chatbox-header">
              <div className="chatbox-header-left">
                <img src={logo} alt="Box Cricket Logo" className="chatbox-logo" />
                <strong>YMN GPT Version 2.0</strong>
              </div>
              <div>
                <button onClick={handleClearHistory} title="Clear chat history" className="chat-icon">
                  🗑️
                </button>
                <button onClick={() => setShowChat(false)} className="chat-icon">×</button>
              </div>
            </div>

            <div style={{ textAlign: "right", marginBottom: "6px" }}>
              <button
                onClick={() => setShowHistory(prev => !prev)}
                className="history-toggle"
              >
                {showHistory ? "Hide History" : "View History"}
              </button>
            </div>

            {showHistory && (
              <div className="chat-history">
                <strong style={{ fontSize: "13px" }}>Your Questions:</strong>
                <ul style={{ paddingLeft: "15px", fontSize: "13px" }}>
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
                    color: msg.from === "user" ? "#007bff" : "#333"
                  }}
                >
                  <span
                    style={{
                      backgroundColor: msg.from === "user" ? "#e1f0ff" : "#f1f1f1",
                      padding: "10px 15px",
                      borderRadius: "15px",
                      display: "inline-block",
                      maxWidth: "80%",
                      cursor: msg.from === "user" ? "pointer" : "default",
                      wordWrap: "break-word"
                    }}
                    onClick={() => msg.from === "user" && handleEditMessage(idx)}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              {loading && <div style={{ color: "#666", fontStyle: "italic" }}>YMN is typing...</div>}
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
              <button onClick={handleSend} disabled={loading} className="chat-send-button">Send</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Footer;
