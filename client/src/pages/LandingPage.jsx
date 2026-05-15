import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pollAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui/index";
import toast from "react-hot-toast";

export default function LandingPage() {
  const [code, setCode]     = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();

  const handleJoin = async (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) { toast.error("Enter a poll code"); return; }
    setLoading(true);
    try {
      // GET /poll/:code → { success, data: { ...poll } }
      await pollAPI.getByCode(c);
      nav(`/poll/${c}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Poll not found or expired";
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen dot-grid relative overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Orbs */}
      <div className="orb w-96 h-96 top-0 -left-20 opacity-30" style={{ background: "var(--accent)" }} />
      <div className="orb w-72 h-72 bottom-10 right-0 opacity-20" style={{ background: "#A78BFA" }} />
      <div className="orb w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 opacity-10" style={{ background: "#34D399" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-20">
        {/* Hero */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-4 py-1.5 rounded-full mb-8 animate-fade-in"
            style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-ring)", color: "var(--accent)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ background: "var(--success)" }} />
            Real-time polling platform
          </div>

          <h1
            className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-none mb-6 animate-fade-up"
            style={{ color: "var(--tx)" }}
          >
            Polls that move
            <br />
            <span className="shimmer-text">at the speed of now</span>
          </h1>

          <p className="font-body text-lg max-w-md mx-auto mb-12 animate-fade-up d2" style={{ color: "var(--tx-2)" }}>
            Create a poll in seconds. Share a code. Watch live results pour in.
          </p>

          {/* Code entry */}
          <div className="max-w-sm mx-auto animate-fade-up d3">
            <div className="card glass p-5">
              <p className="font-body text-sm text-left mb-3" style={{ color: "var(--tx-2)" }}>
                Have a poll code? Jump right in →
              </p>
              <form onSubmit={handleJoin} className="flex gap-3">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={10}
                  className="input-field font-mono text-center tracking-[0.25em] uppercase text-base"
                />
                <button type="submit" disabled={loading} className="btn-primary px-5 shrink-0">
                  {loading ? <Spinner size="sm" /> : "Join"}
                </button>
              </form>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-3 mt-8 animate-fade-up d4">
            {user ? (
              <Link to="/dashboard" className="btn-primary">Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">Create Free Poll</Link>
                <Link to="/login" className="btn-ghost">Login</Link>
              </>
            )}
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4 animate-fade-up d5">
          {[
            { icon: "⚡", title: "Live Results", desc: "WebSocket powered — votes appear instantly, no refresh needed." },
            { icon: "🔒", title: "Anonymous Voting", desc: "Guests can vote without an account. Logged-in users get one vote." },
            { icon: "📊", title: "Rich Analytics", desc: "Per-question breakdowns with percentages and total counts." },
          ].map((f) => (
            <div key={f.title} className="card glass glass-hover p-6">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-base mb-1" style={{ color: "var(--tx)" }}>{f.title}</h3>
              <p className="font-body text-sm" style={{ color: "var(--tx-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
