// FIX #3: Was copy-pasted from Packages — now correctly implements NotFound (404) page
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

function NotFound() {
  return (
    <section className="notfound-section">
      <div className="container notfound-inner">
        <div className="notfound-code">404</div>
        <h1>Page not found</h1>
        <p>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            Back to Home
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </section>
  );
}

export default NotFound;