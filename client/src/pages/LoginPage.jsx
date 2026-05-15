import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui/index";
import { Eye, EyeOff } from "lucide-react";

import toast from "react-hot-toast";

export default function LoginPage() {
  const [form, setForm]   = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // POST /auth/login → { success, data: { accessToken, user } }
      await login(form.email, form.password);
      toast.success("Welcome back!");
      nav("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
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
      <div className="orb w-72 h-72 top-0 left-0 opacity-20" style={{ background: "var(--accent)" }} />
      <div className="orb w-56 h-56 bottom-0 right-0 opacity-15" style={{ background: "#A78BFA" }} />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold font-display" style={{ background: "var(--accent)" }}>S</div>
            <span className="font-display font-bold text-xl" style={{ color: "var(--tx)" }}>SmartPoll</span>
          </Link>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--tx)" }}>Welcome back</h1>
          <p className="font-body text-sm" style={{ color: "var(--tx-muted)" }}>Sign in to manage your polls</p>
        </div>

        <div className="card glass p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                  required
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                  style={{ color: "var(--tx-muted)" }}
                >
                  {showPwd ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <Spinner size="sm" /> : "Log in"}
            </button>
          </form>

          <p className="text-center font-body text-sm mt-6" style={{ color: "var(--tx-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
