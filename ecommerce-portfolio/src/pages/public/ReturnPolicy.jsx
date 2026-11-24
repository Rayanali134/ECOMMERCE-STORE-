import { useState, useEffect } from "react";
import {
  RotateCcw,
  ShieldCheck,
  Truck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";
import "./css/ReturnPolicy.css";

const FALLBACK_FAQS = [
  {
    question: "How many days do I have to return an item?",
    answer: "You have a full 7 days from the date of courier delivery to request a return or exchange.",
  },
  {
    question: "Who pays for return courier shipping?",
    answer: "If the item was defective, damaged, or incorrect, EcoStore covers 100% of return shipping. For size or color exchanges, standard courier fees apply.",
  },
  {
    question: "Can I exchange an item for another size or variant?",
    answer: "Yes! Exchanges are priority-dispatched immediately once your return is handed over to our courier partner.",
  },
  {
    question: "How will I receive my refund for Cash on Delivery (COD)?",
    answer: "For COD orders, we transfer the refund directly to your Bank Account, JazzCash, or Easypaisa account within 48 hours of item verification.",
  },
];

export default function ReturnPolicy() {
  const [settings, setSettings] = useState(null);
  const [openFaq, setOpenFaq] = useState(0); // Open first FAQ by default

  useEffect(() => {
    let isMounted = true;
    api
      .get("/settings")
      .then((res) => {
        if (isMounted && (res.data?.settings || res.data?.data)) {
          setSettings(res.data.settings || res.data.data);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic settings:", err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const returnDays = settings?.returnPolicyDays || 7;
  const whatsappNumber = settings?.whatsappNumber || "+92 321 3633473";
  const cleanPhoneDigits = whatsappNumber.replace(/[^0-9]/g, "") || "923213633473";
  const faqs = Array.isArray(settings?.faqs) && settings.faqs.length > 0
    ? settings.faqs
    : FALLBACK_FAQS;

  const returnSteps = [
    {
      step: "01",
      title: "Contact Returns Team",
      desc: `Message our WhatsApp helpline (${whatsappNumber}) within ${returnDays} days of receiving your order with your Order ID and photo/video of the item.`,
    },
    {
      step: "02",
      title: "Pack the Item",
      desc: "Place the item back into its original packaging along with all warranty cards, tags, and accessories intact.",
    },
    {
      step: "03",
      title: "Courier Pickup / Dispatch",
      desc: "Our partner courier (TCS / Leopards) arranges a doorstep pickup or you dispatch to our central inspection hub.",
    },
    {
      step: "04",
      title: "Instant Refund / Exchange",
      desc: "Upon package verification, your replacement is dispatched or refund transferred via Bank, JazzCash or Easypaisa within 48 hours.",
    },
  ];

  return (
    <div className="return-policy-page">
      {/* Hero Section */}
      <section className="policy-hero">
        <div className="container policy-hero-inner">
          <span className="policy-tag">
            <Sparkles size={13} style={{ display: "inline", marginRight: 6 }} />
            OFFICIAL STORE SATISFACTION GUARANTEE
          </span>
          <h1>{returnDays}-Day Hassle-Free Return &amp; Refund Policy</h1>
          <p>
            Shop with total peace of mind across Pakistan. If you are not 100% satisfied with your order,
            our returns and exchange procedure is straightforward and hassle-free.
          </p>
        </div>
      </section>

      {/* Official Policy Text Box (Live from Settings) */}
      <div className="container">
        <div className="policy-official-box">
          <div className="icon-wrap">
            <RotateCcw size={22} />
          </div>
          <div>
            <h3>Official Return &amp; Exchange Terms</h3>
            <p>
              {settings?.returnPolicyText ||
                `We provide a ${returnDays}-day hassle-free return and exchange policy on all eligible items nationwide. Products must be in original condition with tags and packaging intact. Contact our WhatsApp helpline with your Order ID to initiate an exchange or refund.`}
            </p>
          </div>
        </div>
      </div>

      {/* Trust Highlights Grid */}
      <section className="container policy-highlights-section">
        <div className="policy-highlights-grid">
          <div className="highlight-card">
            <Clock size={32} className="highlight-icon" />
            <h3>{returnDays} Days Inspection</h3>
            <p>You have full {returnDays} days from the delivery date to inspect your items.</p>
          </div>

          <div className="highlight-card">
            <ShieldCheck size={32} className="highlight-icon" />
            <h3>100% Refund Transfer</h3>
            <p>Full refund transferred directly via Bank Account, JazzCash or Easypaisa.</p>
          </div>

          <div className="highlight-card">
            <Truck size={32} className="highlight-icon" />
            <h3>Fast Free Exchanges</h3>
            <p>Priority courier dispatch for replacement sizes, colors, or alternative models.</p>
          </div>
        </div>
      </section>

      {/* 4 Steps Roadmap */}
      <section className="container policy-steps-section">
        <div className="section-heading">
          <span>SIMPLE 4-STEP WORKFLOW</span>
          <h2>How to Request a Return or Exchange</h2>
          <p>We designed our return workflow to be completely transparent and stress-free.</p>
        </div>

        <div className="policy-steps-grid">
          {returnSteps.map((s) => (
            <div key={s.step} className="policy-step-card">
              <span className="step-num">{s.step}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Eligible vs Non-Eligible */}
      <section className="container eligibility-section">
        <div className="eligibility-grid">
          <div className="eligibility-card eligible">
            <div className="eligibility-header">
              <CheckCircle2 size={24} />
              <h3>Items Eligible for Return</h3>
            </div>
            <ul>
              <li>Defective, damaged, or malfunctioning items upon unboxing.</li>
              <li>Incorrect product, size, or color dispatched by mistake.</li>
              <li>Product significantly differing from catalog photos and description.</li>
              <li>Unused items with complete packaging, accessories, and receipt.</li>
            </ul>
          </div>

          <div className="eligibility-card not-eligible">
            <div className="eligibility-header">
              <XCircle size={24} />
              <h3>Non-Returnable Items</h3>
            </div>
            <ul>
              <li>Customized, personalized, or custom-engraved orders.</li>
              <li>Items marked as "Final Clearance / Non-Returnable".</li>
              <li>Products showing visible scratches, physical wear, or water damage.</li>
              <li>Requests initiated after the {returnDays}-day window has elapsed.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Return FAQs Accordion */}
      <section className="container policy-faqs-section">
        <div className="section-heading">
          <span>COMMON QUERIES</span>
          <h2>Frequently Asked Questions About Returns</h2>
          <p>Got a question about our policies? Click any query below for instant answers.</p>
        </div>

        <div className="policy-faqs-accordion">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            const q = faq.question || faq.q;
            const a = faq.answer || faq.a;
            return (
              <div key={idx} className={`policy-faq-row ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="policy-faq-trigger"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{q}</span>
                  <ChevronDown
                    size={18}
                    className={`policy-faq-chevron ${isOpen ? "open" : ""}`}
                  />
                </button>
                {isOpen && <div className="policy-faq-body">{a}</div>}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Helpline Banner */}
        <div className="policy-helpline-banner">
          <div>
            <h3>Need Help With a Return or Exchange?</h3>
            <p>Our dedicated customer support hotline is available nationwide on WhatsApp.</p>
          </div>
          <a
            href={`https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(
              `Assalam-o-Alaikum! I have an inquiry about returning/exchanging my order with EcoStore.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp-large"
          >
            <MessageCircle size={18} />
            Chat with Returns Team ({whatsappNumber})
          </a>
        </div>
      </section>
    </div>
  );
}
