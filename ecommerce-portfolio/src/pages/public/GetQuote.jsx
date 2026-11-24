// FIX #3: Was copy-pasted from Packages — now correctly implements GetQuote page
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Clock, ShieldCheck, HeadphonesIcon } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Tell Us About Your Project",
    description:
      "Fill in our short inquiry form with your project goals, timeline and budget. No lengthy documents needed.",
  },
  {
    number: "02",
    title: "We Review & Respond",
    description:
      "Our team reviews your requirements within 24 hours and sends a tailored proposal with pricing options.",
  },
  {
    number: "03",
    title: "Agree & Kick Off",
    description:
      "Once you're happy with the quote, we sign a simple agreement and begin building your digital solution.",
  },
];

const perks = [
  { icon: Clock, label: "24-Hour Response" },
  { icon: ShieldCheck, label: "No Hidden Costs" },
  { icon: HeadphonesIcon, label: "Dedicated Support" },
  { icon: FileText, label: "Clear Contracts" },
];

function GetQuote() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="page-tag">GET A QUOTE</span>
          <h1>
            Let&apos;s talk about your <span>next project.</span>
          </h1>
          <p>
            Whether you need a complete ecommerce store, a professional website
            or a custom digital tool — we&apos;ll build a solution that fits your
            goals and your budget.
          </p>

          <div className="quote-perks">
            {perks.map(({ icon: Icon, label }) => (
              <div key={label} className="quote-perk">
                <Icon size={18} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <Link to="/contact" className="btn btn-primary">
            Start Your Inquiry
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="quote-steps-section">
        <div className="container">
          <div className="section-heading">
            <span>THE PROCESS</span>
            <h2>How getting a quote works.</h2>
            <p>Simple, transparent and fast — from first contact to proposal.</p>
          </div>

          <div className="quote-steps">
            {steps.map((step) => (
              <div key={step.number} className="quote-step">
                <div className="quote-step-number">{step.number}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="quote-cta-section">
        <div className="container quote-cta-inner">
          <h2>Ready to get started?</h2>
          <p>
            Send us your project details and we&apos;ll come back to you with a
            personalised quote — no commitment required.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Send Inquiry
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

export default GetQuote;