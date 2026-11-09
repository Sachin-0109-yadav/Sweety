
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Eye, EyeOff, HeartPulse } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand">
          <HeartPulse size={28} />
          <span>Sweety</span>
        </div>

        <div className="auth-visual-content">
          <span className="auth-tag">
            <Activity size={15} /> YOUR HEALTH, YOUR CONTROL
          </span>

          <h1>
            Take control of
            <br />
            your <span>health journey.</span>
          </h1>

          <p>
            Track glucose levels, understand your health patterns,
            and make more informed decisions with Sweety.
          </p>

          <div className="visual-stat">
            <div className="stat-icon">
              <Activity size={22} />
            </div>
            <div>
              <strong>Smarter health tracking</strong>
              <span>Your health information in one place</span>
            </div>
          </div>
        </div>

        <p className="visual-footer">
          Your personal health companion.
        </p>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-container">
          <div className="mobile-brand">
            <HeartPulse size={27} />
            <span>Sweety</span>
          </div>

          <span className="form-eyebrow">WELCOME BACK</span>
          <h2>Sign in to Sweety</h2>
          <p className="form-description">
            Enter your account details to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>

          <p className="auth-privacy">
            Your health data deserves privacy and protection.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
