import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { api, useSessionGuard } from "@/lib/api";
import Markdown from "@/components/Markdown";
import "./Chat.css";

// keep conversations around while switching tabs (cleared on reload)
const histories = new Map();

const SUGGESTIONS = [
  "What problem is this paper trying to solve?",
  "Explain the methodology in simple terms.",
  "What are the main limitations?",
  "What datasets or experiments were used?",
];

export default function Chat() {
  const { id } = useOutletContext();
  const guard = useSessionGuard();
  const [messages, setMessages] = useState(() => histories.get(id) || []);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    histories.set(id, messages);
    if (messages.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [id, messages]);

  const ask = async (text) => {
    const q = text.trim();
    if (!q || loading) return;

    setQuestion("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const data = await api(`/api/insights/${id}`, {
        method: "POST",
        body: q,
        headers: { "Content-Type": "text/plain" },
      });
      setMessages((m) => [...m, { role: "assistant", text: data.answer }]);
    } catch (err) {
      if (guard(err)) return;
      setMessages((m) => [...m, { role: "error", text: err.message }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(question);
    }
  };

  return (
    <div className="chat">
      <div className="chat-log">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p className="chat-empty-title">Ask anything about this paper.</p>
            <p className="muted">
              Answers are drawn from the passages most relevant to your question, so specific
              questions work better than broad ones.
            </p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`msg msg-${m.role}`}>
            {m.role === "assistant" ? (
              <Markdown>{m.text}</Markdown>
            ) : m.role === "error" ? (
              <p>Couldn't get an answer: {m.text}</p>
            ) : (
              <p>{m.text}</p>
            )}
          </div>
        ))}

        {loading && (
          <div className="msg msg-assistant msg-pending" aria-label="Waiting for answer">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question about the paper"
          aria-label="Your question"
        />
        <button type="submit" disabled={!question.trim() || loading} aria-label="Send">
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}
