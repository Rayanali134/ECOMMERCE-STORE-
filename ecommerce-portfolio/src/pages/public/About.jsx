// FIX #8: Was a 2-line placeholder — now a full About page
import { ArrowRight, Zap, Users, Award, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Zap,
    title: "Performance First",
    description:
      "Every project is built for speed. Fast load times, clean code and optimised assets are non-negotiable.",
  },
  {
    icon: Users,
    title: "Client-Centric",
    description:
      "We treat every client as a long-term partner. Clear communication, honest pricing and real results.",
  },
  {
    icon: Award,
    title: "Quality Over Quantity",
    description:
      "We take on projects we can do exceptionally well — not just adequately. Craft and attention to detail matter.",
  },
  {
    icon: Globe,
    title: "Global Standards",
    description:
      "We build to international best practices — WCAG accessibility, SEO-ready structure and secure by default.",
  },
];

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "5+", label: "Years Experience" },
  { value: "24h", label: "Average Response Time" },
];

function About() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="page-tag">ABOUT US</span>
          <h1>
            We build digital experiences <span>that sell.</span>
          </h1>
          <p>
            EcoPortfolio is a digital studio specialising in ecommerce, web
            development and custom digital solutions. We help ambitious businesses
            build a strong, profitable online presence.
          </p>
          <Link to="/get-quote" className="btn btn-primary">
            Work With Us
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats-section">
        <div className="container">
          <div className="about-stats-grid">
            {stats.map(({ value, label }) => (
              <div key={label} className="about-stat">
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission-section">
        <div className="container about-mission-inner">
          <div className="about-mission-text">
            <span className="page-tag">OUR MISSION</span>
            <h2>Turning ambitious ideas into profitable realities.</h2>
            <p>
              We started EcoPortfolio because we saw too many businesses
              held back by outdated websites and poor digital strategy. Our
              mission is simple: give every client a digital product they&apos;re
              proud of and one that genuinely grows their business.
            </p>
            <p>
              We work with startups, growing SMEs and established brands — all
              united by a desire to do more online. Every project we take on
              gets the same level of care, creativity and technical excellence.
            </p>
          </div>

          <div className="about-mission-highlight">
            <blockquote>
              &ldquo;We don&apos;t just build websites — we build business
              tools that work while you sleep.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values-section">
        <div className="container">
          <div className="section-heading">
            <span>WHAT WE STAND FOR</span>
            <h2>Our core values.</h2>
            <p>The principles that guide every decision we make.</p>
          </div>

          <div className="about-values-grid">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="about-value-card">
                <div className="about-value-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="quote-cta-section">
        <div className="container quote-cta-inner">
          <h2>Ready to build something great?</h2>
          <p>Tell us about your project and we&apos;ll get back to you within 24 hours.</p>
          <Link to="/get-quote" className="btn btn-primary">
            Get a Free Quote
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

export default About;