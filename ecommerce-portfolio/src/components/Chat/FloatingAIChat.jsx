import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bot, X, Sparkles, MessageCircle } from "lucide-react";

import StoreAIAssistant from "../Contact/StoreAIAssistant";
import "./FloatingAIChat.css";

export default function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const location = useLocation();

  // Listen for custom trigger events from anywhere in the app (e.g. Homepage AI prompt pills)
  useEffect(() => {
    const handleOpenChat = (event) => {
      const prompt = event.detail?.prompt;
      if (prompt) {
        setInitialPrompt(prompt);
      }
      setOpen(true);
    };

    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => {
      window.removeEventListener("open-ai-chat", handleOpenChat);
    };
  }, []);

  // Prevent background body scroll on mobile phones when modal is active
  useEffect(() => {
    if (open && window.innerWidth <= 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // On /contact, the full AI Concierge is already displayed prominently on the page
  if (location.pathname === "/contact") {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop overlay - tap outside to close */}
      {open && (
        <div
          className="floating-ai-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`floating-ai-root ${open ? "is-expanded" : ""}`}>
        {open && (
          <div
            className="floating-ai-panel"
            role="dialog"
            aria-modal="true"
            aria-label="EcoStore AI Live Chat"
          >
            {/* Mobile Sheet Drag Pill */}
            <div className="floating-mobile-handle" aria-hidden="true">
              <span />
            </div>

            <div className="floating-ai-topbar">
              <div className="floating-ai-title">
                <span className="floating-ai-icon">
                  <Bot size={18} />
                </span>
                <div>
                  <strong>EcoStore AI Concierge</strong>
                  <span>100+ Q&amp;A • Budget Matcher • Online</span>
                </div>
              </div>

              <div className="floating-ai-top-actions">
                <a
                  href="https://wa.me/923213633473?text=Assalam-o-Alaikum%20EcoStore!%20I%20need%20help%20with%20an%20order."
                  target="_blank"
                  rel="noreferrer"
                  className="floating-wa-link"
                  title="Direct WhatsApp Support (+92 321 3633473)"
                >
                  <MessageCircle size={15} />
                </a>

                <button
                  type="button"
                  className="floating-close-btn"
                  onClick={() => setOpen(false)}
                  aria-label="Close AI Chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="floating-ai-body">
              <StoreAIAssistant
                storeName="EcoStore"
                compact
                initialPrompt={initialPrompt}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          className={`floating-ai-launcher ${open ? "is-open" : ""}`}
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close AI Chat" : "Open EcoStore AI Chat"}
        >
          {open ? (
            <X size={22} />
          ) : (
            <>
              <span className="launcher-sparkle">
                <Sparkles size={18} />
              </span>
              <span className="launcher-label">AI Chat</span>
              <span className="launcher-pulse-dot" />
            </>
          )}
        </button>
      </div>
    </>
  );
}
