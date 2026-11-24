// FIX #3: Was copy-pasted from Packages — now correctly implements Process page
import {
  Search,
  PenTool,
  Code2,
  Rocket,
  LifeBuoy,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const phases = [
  {
    icon: Search,
    phase: "Phase 1",
    title: "Discovery",
    description:
      "We start with a deep-dive into your business, goals and audience. We research your competitors and map out opportunities before writing a single line of code.",
    deliverables: ["Requirements document", "Competitor analysis", "Project scope"],
  },
  {
    icon: PenTool,
    phase: "Phase 2",
    title: "Design",
    description:
      "Our designers create wireframes and high-fidelity mockups that reflect your brand. You review and approve every screen before development begins.",
    deliverables: ["Wireframes", "UI mockups", "Brand alignment"],
  },
  {
    icon: Code2,
    phase: "Phase 3",
    title: "Development",
    description:
      "Our developers build your solution using modern technologies. We work in short sprints and share progress updates so you&apos;re always in the loop.",
    deliverables: ["Clean codebase", "Weekly updates", "Testing & QA"],
  },
  {
    icon: Rocket,
    phase: "Phase 4",
    title: "Launch",
    description:
      "Once you sign off, we deploy to your hosting environment, configure your domain and run final checks to make sure everything works perfectly.",
    deliverables: ["Live deployment", "Domain setup", "Performance check"],
  },
  {
    icon: LifeBuoy,
    phase: "Phase 5",
    title: "Support",
    description:
      "After launch we&apos;re still here. We offer maintenance packages, content updates and ongoing feature development to keep your site growing.",
    deliverables: ["Bug fixes", "Content updates", "Feature additions"],
  },
];

function Process() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="page-tag">OUR PROCESS</span>
          <h1>
            How we turn your idea into a <span>digital reality.</span>
          </h1>
          <p>
            We follow a structured, transparent process from first conversation to
            post-launch support — so you always know what&apos;s happening and why.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="process-phases-section">
        <div className="container">
          <div className="process-phases">
            {phases.map(({ icon: Icon, phase, title, description, deliverables }) => (
              <div key={phase} className="process-phase">
                <div className="process-phase-icon">
                  <Icon size={24} />
                </div>
                <div className="process-phase-content">
                  <span className="process-phase-label">{phase}</span>
                  <h2>{title}</h2>
                  <p>{description}</p>
                  <ul className="process-deliverables">
                    {deliverables.map((d) => (
                      <li key={d}>✓ {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="quote-cta-section">
        <div className="container quote-cta-inner">
          <h2>Ready to start your project?</h2>
          <p>Let&apos;s kick off the process — tell us about your vision today.</p>
          <Link to="/get-quote" className="btn btn-primary">
            Get a Quote
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

export default Process;