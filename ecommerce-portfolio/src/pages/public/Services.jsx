// FIX #8: Was a 2-line placeholder — now a full public Services page
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    emoji: "🛍️",
    title: "Ecommerce Development",
    description:
      "We build conversion-focused online stores that are fast, secure and easy to manage. From product catalogues to checkout flows, we handle it all.",
    features: [
      "Custom product pages",
      "Payment gateway integration",
      "Inventory management",
      "Mobile-first design",
    ],
  },
  {
    emoji: "💻",
    title: "Web Development",
    description:
      "Modern, responsive websites built with clean code and scalable architecture. Whether it&apos;s a landing page or a complex web app, we deliver quality.",
    features: [
      "React & Next.js",
      "Performance optimised",
      "SEO-ready structure",
      "API integrations",
    ],
  },
  {
    emoji: "🎨",
    title: "UI/UX Design",
    description:
      "Beautiful, intuitive interfaces designed around your users. We create wireframes, mockups and design systems that make products people love to use.",
    features: [
      "User research",
      "Wireframing & prototyping",
      "Design systems",
      "Brand alignment",
    ],
  },
  {
    emoji: "📈",
    title: "Digital Strategy",
    description:
      "We help you identify the right opportunities and build a roadmap. From market positioning to technology choice, we give you a clear direction.",
    features: [
      "Market analysis",
      "Technology consulting",
      "Growth planning",
      "Competitor research",
    ],
  },
  {
    emoji: "🔧",
    title: "Maintenance & Support",
    description:
      "We don&apos;t disappear after launch. Our support packages keep your site updated, secure and performing at its best month after month.",
    features: [
      "Security updates",
      "Performance monitoring",
      "Content updates",
      "Bug fixes",
    ],
  },
  {
    emoji: "🔗",
    title: "API & Integrations",
    description:
      "Connect your website or app to the tools and services your business already uses — CRMs, ERPs, payment gateways, third-party APIs and more.",
    features: [
      "REST & GraphQL APIs",
      "Third-party integrations",
      "Webhook setup",
      "Data migration",
    ],
  },
];

function Services() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="page-tag">OUR SERVICES</span>
          <h1>
            Everything your digital business <span>needs to grow.</span>
          </h1>
          <p>
            From strategy to deployment, we provide end-to-end digital services
            designed to help your business thrive online.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="services-list-section">
        <div className="container">
          <div className="services-list-grid">
            {services.map(({ emoji, title, description, features }) => (
              <article key={title} className="service-item-card">
                <div className="service-item-emoji">{emoji}</div>
                <h2>{title}</h2>
                <p dangerouslySetInnerHTML={{ __html: description }} />
                <ul className="service-item-features">
                  {features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="quote-cta-section">
        <div className="container quote-cta-inner">
          <h2>Need something custom?</h2>
          <p>
            Every business is different. Tell us what you need and we&apos;ll
            build a solution tailored specifically for you.
          </p>
          <Link to="/get-quote" className="btn btn-primary">
            Get a Quote
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

export default Services;