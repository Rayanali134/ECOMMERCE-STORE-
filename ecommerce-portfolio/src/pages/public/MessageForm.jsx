
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  MessageSquare,
  ShieldCheck,
  UserRound,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";
import "./css/MessageForm.css";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function MessageForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    type: "",
    text: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (result.text) {
      setResult({ type: "", text: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setResult({ type: "", text: "" });

    try {
      const response = await api.post("/messages", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setForm(initialForm);

      setResult({
        type: "success",
        text:
          response.data?.message ||
          "Your message has been sent successfully.",
      });
    } catch (error) {
      setResult({
        type: "error",
        text:
          error.response?.data?.message ||
          "Message send nahi ho saka. Please dobara try karein.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="public-message">
      <div className="public-message__intro">
        <span className="public-message__eyebrow">
          <span />
          LET'S CONNECT
        </span>

        <h2>
          Have a project in <span>mind?</span>
        </h2>

        <p>
          Apna idea share karein. Apne project ya business ke baare mein
          batayein aur hum aapke message ka jawab denge.
        </p>

        <div className="public-message__trust">
          <span className="public-message__trust-icon">
            <ShieldCheck size={20} />
          </span>
          <div>
            <strong>Your message matters</strong>
            <span>Your details are used to respond to your inquiry.</span>
          </div>
        </div>
      </div>

      <form
        className="public-message__form"
        onSubmit={handleSubmit}
      >
        <div className="public-message__form-heading">
          <div className="public-message__heading-icon">
            <MessageSquare size={22} />
          </div>
          <div>
            <h3>Send a message</h3>
            <p>Fields marked with * are required.</p>
          </div>
        </div>

        {result.text && (
          <div
            className={`public-message__feedback public-message__feedback--${result.type}`}
            role="status"
          >
            {result.type === "success" ? (
              <CheckCircle2 size={19} />
            ) : (
              <AlertCircle size={19} />
            )}
            <span>{result.text}</span>
          </div>
        )}

        <div className="public-message__fields">
          <label className="public-message__field">
            <span>Full name *</span>
            <div className="public-message__input-wrap">
              <UserRound size={17} />
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                maxLength={150}
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>
          </label>

          <label className="public-message__field">
            <span>Email address *</span>
            <div className="public-message__input-wrap">
              <Mail size={17} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                maxLength={255}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </label>

          <label className="public-message__field public-message__field--full">
            <span>Subject *</span>
            <input
              type="text"
              name="subject"
              placeholder="What would you like to discuss?"
              value={form.subject}
              onChange={handleChange}
              maxLength={255}
              required
              disabled={loading}
            />
          </label>

          <label className="public-message__field public-message__field--full">
            <span>Your message *</span>
            <textarea
              name="message"
              placeholder="Tell us about your idea, requirements or questions..."
              value={form.message}
              onChange={handleChange}
              rows={5}
              maxLength={10000}
              required
              disabled={loading}
            />
            <small className="public-message__counter">
              {form.message.length}/10000 characters
            </small>
          </label>
        </div>

        <button
          className="public-message__submit"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle
                size={18}
                className="public-message__spin"
              />
              Sending message...
            </>
          ) : (
            <>
              Send your message
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="public-message__note">
          <ShieldCheck size={15} />
          Please provide a valid email so we can contact you.
        </p>
      </form>
    </section>
  );
}
