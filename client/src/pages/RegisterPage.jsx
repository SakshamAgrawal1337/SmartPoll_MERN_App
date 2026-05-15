import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui/index";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm]   = useState({ name: "", email: "", password: "", role: "customer" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      // POST /auth/register → { success, data: { name, email, ... } } ← NO token returned
      const res = await register(form.name, form.email, form.password);
      toast.success(res.message || "Account created! Please log in.");
      nav("/login"); // Must login separately since no token returned
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
        style={{
          backgroundColor: "var(--bg)",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
  }}
    >
      <div className="orb w-72 h-72 top-0 right-0 opacity-20" style={{ background: "#283e95" }} />
      <div className="orb w-56 h-56 bottom-0 left-0 opacity-15" style={{ background: "var(--accent)" }} />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold font-display" style={{ background: "var(--accent)" }}>S</div>
            <span className="font-display font-bold text-xl" style={{ color: "var(--tx)" }}>SmartPoll</span>
          </Link>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--tx)" }}>Create account</h1>
          <p className="font-body text-sm" style={{ color: "var(--tx-muted)" }}>Start building polls in seconds</p>
        </div>

        <div className="card glass p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body mb-1.5" style={{ color: "var(--tx-2)" }}>Full name</label>
              <input type="text" value={form.name} onChange={set("name")} placeholder="Saksham Sharma" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-body mb-1.5" style={{ color: "var(--tx-2)" }}>Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-body mb-1.5" style={{ color: "var(--tx-2)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                  style={{ color: "var(--tx-muted)" }}
                >
                  {showPwd ?  <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Password strength */}
            {form.password.length > 0 && (
              <div>
                <div className="prog-track">
                  <div
                    className="prog-fill"
                    style={{
                      width: `${Math.min(100, (form.password.length / 12) * 100)}%`,
                      background: form.password.length < 6 ? "var(--danger)" : form.password.length < 10 ? "#F59E0B" : "var(--success)",
                    }}
                  />
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: "var(--tx-muted)" }}>
                  {form.password.length < 6 ? "Too short" : form.password.length < 10 ? "Good" : "Strong"}
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <Spinner size="sm" /> : "Create Account →"}
            </button>
          </form>

          {/* Info note */}
          {/* <div className="mt-4 p-3 rounded-xl font-body text-xs" style={{ background: "var(--accent-dim)", color: "var(--tx-2)", border: "1px solid var(--accent-ring)" }}>
            💡 After registering you'll be redirected to login.
          </div> */}

          <p className="text-center font-body text-sm mt-4" style={{ color: "var(--tx-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-medium hover:underline" style={{ color: "var(--accent)" }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
