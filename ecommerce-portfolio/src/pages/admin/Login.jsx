import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  LockKeyhole,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(form.email, form.password);

      const destination = location.state?.from || "/admin";

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <div className="login-card">
        <Link to="/" className="login-brand">
          <span>ES</span>
          <strong>EcoStore</strong>
        </Link>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to manage your store.</p>
        </div>

        {location.state?.registered && (
          <div className="login-success">
            <CheckCircle2 size={17} />
            Account created successfully. Please sign in.
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>

            <div className="input-wrap">
              <Mail size={18} />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="input-wrap">
              <LockKeyhole size={18} />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button className="login-button" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/admin/register">Create account</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to website
        </Link>
      </div>
    </main>
  );
}

export default Login;