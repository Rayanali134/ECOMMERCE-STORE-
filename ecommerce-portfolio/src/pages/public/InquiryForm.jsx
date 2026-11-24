
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  LoaderCircle,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserRound,
  AlertCircle,
} from "lucide-react";

// FIX #1: Corrected import path — file is at pages/public/ so needs to go up 2 levels
import api from "../../services/api";
import "./css/InquiryForm.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  service: "",
  projectType: "",
  budget: "",
  subject: "",
  message: "",
};

export default function InquiryForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFeedback({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFeedback({ type: "", text: "" });

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        service: form.service,
        projectType: form.projectType,
        budget: form.budget,
        subject: form.subject.trim(),
        message: form.message.trim(),
        source: "website",
        priority: "normal",
      };

      const response = await api.post("/inquiries", payload);

      setForm(initialForm);
      setFeedback({
        type: "success",
        text:
          response.data?.message ||
          "Your inquiry has been submitted successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error.response?.data?.message ||
          "Inquiry submit nahi ho saki. Please dobara try karein.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="inquiry-public">
      <div className="inquiry-public__intro">
        <span className="inquiry-public__eyebrow">
          <span />
          START A PROJECT
        </span>

        <h2>
          Let's build something <span>remarkable.</span>
        </h2>

        <p>
          Apne business ka idea, project requirements aur estimated budget
          share karein. Hum aapki requirements review karke response denge.
        </p>

        <div className="inquiry-public__benefits">
          <div>
            <span className="inquiry-public__benefit-icon">
              <BriefcaseBusiness size={20} />
            </span>
            <div>
              <strong>Project-focused planning</strong>
              <p>Requirements aur project scope ko samajhna.</p>
            </div>
          </div>

          <div>
            <span className="inquiry-public__benefit-icon">
              <ShieldCheck size={20} />
            </span>
            <div>
              <strong>Clear communication</strong>
              <p>Budget aur delivery expectations par discussion.</p>
            </div>
          </div>
        </div>
      </div>

      <form className="inquiry-public__form" onSubmit={handleSubmit}>
        <div className="inquiry-public__form-heading">
          <div className="inquiry-public__heading-icon">
            <MessageSquare size={22} />
          </div>
          <div>
            <h3>Project inquiry</h3>
            <p>Share a few details to get started.</p>
          </div>
        </div>

        {feedback.text && (
          <div
            className={`inquiry-public__feedback inquiry-public__feedback--${feedback.type}`}
            role="status"
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="inquiry-public__grid">
          <label className="inquiry-public__field">
            <span>Full name *</span>
            <div className="inquiry-public__input-wrap">
              <UserRound size={17} />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                maxLength={150}
                required
                disabled={loading}
              />
            </div>
          </label>

          <label className="inquiry-public__field">
            <span>Email address *</span>
            <div className="inquiry-public__input-wrap">
              <Mail size={17} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={255}
                required
                disabled={loading}
              />
            </div>
          </label>

          <label className="inquiry-public__field">
            <span>Phone number</span>
            <div className="inquiry-public__input-wrap">
              <Phone size={17} />
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+92 3XX XXXXXXX"
                autoComplete="tel"
                maxLength={50}
                disabled={loading}
              />
            </div>
          </label>

          <label className="inquiry-public__field">
            <span>Service required *</span>
            <select
              name="service"
              value={form.service}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select a service</option>
              <option value="Web Development">Web Development</option>
              <option value="Ecommerce Development">Ecommerce Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="SEO">SEO</option>
              <option value="Website Redesign">Website Redesign</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="inquiry-public__field">
            <span>Project type *</span>
            <select
              name="projectType"
              value={form.projectType}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Choose project type</option>
              <option value="New Website">New Website</option>
              <option value="Ecommerce Store">Ecommerce Store</option>
              <option value="Web Application">Web Application</option>
              <option value="Redesign">Redesign</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="inquiry-public__field">
            <span>Estimated budget *</span>
            <select
              name="budget"
              value={form.budget}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select your budget</option>
              <option value="Under PKR 25,000">Under PKR 25,000</option>
              <option value="PKR 25,000 - 50,000">PKR 25,000–50,000</option>
              <option value="PKR 50,000 - 100,000">PKR 50,000–100,000</option>
              <option value="PKR 100,000 - 250,000">PKR 100,000–250,000</option>
              <option value="PKR 250,000+">PKR 250,000+</option>
              <option value="Not sure yet">Not sure yet</option>
            </select>
          </label>

          <label className="inquiry-public__field inquiry-public__field--full">
            <span>Inquiry subject *</span>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Ecommerce website for my business"
              maxLength={255}
              required
              disabled={loading}
            />
          </label>

          <label className="inquiry-public__field inquiry-public__field--full">
            <span>Project details *</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your goals, features and requirements..."
              rows={5}
              maxLength={10000}
              required
              disabled={loading}
            />
            <small>{form.message.length}/10000 characters</small>
          </label>
        </div>

        <button
          type="submit"
          className="inquiry-public__submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="inquiry-public__spin" size={18} />
              Submitting inquiry...
            </>
          ) : (
            <>
              Submit project inquiry
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="inquiry-public__note">
          <ShieldCheck size={15} />
          Your details will be used to respond to this inquiry.
        </p>
      </form>
    </section>
  );
}
