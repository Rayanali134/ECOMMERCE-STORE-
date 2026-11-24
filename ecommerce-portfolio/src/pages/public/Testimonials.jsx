
import { useEffect, useState } from "react";
import {
  Star,
  Quote,
  MessageSquareQuote,
  ArrowRight,
  LoaderCircle,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./css/PublicTestimonials.css";

const normalizeTestimonial = (item) => ({
  id: item.id,
  name: item.name || item.clientName || item.client_name || "Client",
  designation:
    item.designation ||
    item.clientDesignation ||
    item.client_designation ||
    item.role ||
    "",
  company: item.company || "",
  project: item.project || item.projectName || item.project_name || "",
  message: item.message || "",
  rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
  image: item.image || "",
  verified: Boolean(item.verified),
  featured: Boolean(item.featured),
});

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadTestimonials = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/testimonials/public");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.testimonials ||
            response.data?.data ||
            [];

        if (active) {
          setTestimonials(
            data
              .filter(
                (item) =>
                  item.approved === true ||
                  item.approved === 1 ||
                  item.approved === "true" ||
                  item.isApproved === true ||
                  item.is_approved === true
              )
              .map(normalizeTestimonial)
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Testimonials load nahi ho sake. Backend API check karein."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTestimonials();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="public-testimonials">
      <section className="pt-hero">
        <div className="pt-hero-glow pt-hero-glow-one" />
        <div className="pt-hero-glow pt-hero-glow-two" />

        <div className="pt-container pt-hero-content">
          <span className="pt-eyebrow">
            <MessageSquareQuote size={16} />
            CLIENT EXPERIENCES
          </span>

          <h1>
            Real stories.
            <br />
            <span>Real results.</span>
          </h1>

          <p>
            Hamare clients ke experiences dekhein aur jaaniye ke hum
            businesses ko digital solutions ke zariye kaise grow karne
            mein help karte hain.
          </p>

          <div className="pt-hero-actions">
            <Link to="/contact" className="pt-primary-btn">
              Start your project <ArrowRight size={17} />
            </Link>

            <a href="#client-stories" className="pt-secondary-btn">
              Read testimonials
            </a>
          </div>
        </div>

        <div className="pt-hero-bottom">
          <div className="pt-container pt-hero-bottom-inner">
            <span>BUILT ON TRUST</span>
            <span>DESIGNED FOR RESULTS</span>
            <span>FOCUSED ON CLIENTS</span>
          </div>
        </div>
      </section>

      <section className="pt-stories-section" id="client-stories">
        <div className="pt-container">
          <div className="pt-section-heading">
            <div>
              <span className="pt-section-label">CLIENT FEEDBACK</span>
              <h2>What clients say</h2>
              <p>
                Har review ek real experience aur behtar collaboration
                ki kahani hai.
              </p>
            </div>

            <div className="pt-review-count">
              <Quote size={20} />
              <span>
                {testimonials.length}{" "}
                {testimonials.length === 1 ? "Review" : "Reviews"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="pt-state">
              <LoaderCircle className="pt-spinner" size={32} />
              <p>Client stories load ho rahi hain...</p>
            </div>
          ) : error ? (
            <div className="pt-state pt-error">
              <MessageSquareQuote size={30} />
              <p>{error}</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="pt-state">
              <MessageSquareQuote size={34} />
              <h3>Testimonials coming soon</h3>
              <p>
                Abhi approved reviews available nahi hain. Please
                baad mein dobara check karein.
              </p>
            </div>
          ) : (
            <div className="pt-grid">
              {testimonials.map((item) => (
                <article className="pt-card" key={item.id}>
                  <div className="pt-card-top">
                    <div className="pt-stars" aria-label={`${item.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          size={16}
                          fill={index < item.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>

                    <Quote className="pt-quote-icon" size={28} />
                  </div>

                  <p className="pt-message">{item.message}</p>

                  {item.project && (
                    <div className="pt-project">
                      <span>PROJECT</span>
                      <strong>{item.project}</strong>
                    </div>
                  )}

                  <div className="pt-client">
                    <div className="pt-avatar">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <UserRound size={23} />
                      )}
                    </div>

                    <div className="pt-client-info">
                      <strong>{item.name}</strong>
                      <span>
                        {[item.designation, item.company]
                          .filter(Boolean)
                          .join(" · ") || "Client"}
                      </span>
                    </div>

                    {item.verified && (
                      <span className="pt-verified" title="Verified testimonial">
                        ✓
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pt-cta-section">
        <div className="pt-container pt-cta">
          <div>
            <span className="pt-section-label">YOUR PROJECT STARTS HERE</span>
            <h2>Let’s build something meaningful.</h2>
            <p>
              Apne business idea ko professional digital solution mein
              convert karne ke liye humse contact karein.
            </p>
          </div>

          <Link to="/contact" className="pt-primary-btn">
            Discuss your project <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Testimonials;
