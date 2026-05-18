import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pollAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui/index";
import toast from "react-hot-toast";
import { Activity, ShieldCheck, BarChart3, ArrowRight, Zap, Users, Globe } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Create your poll",
    desc: "Add a title, questions, and answer options. Set expiry, toggle anonymous voting — done in under a minute.",
  },
  {
    num: "02",
    title: "Share the code",
    desc: "Every poll gets a unique access code. Share it anywhere — no link shortener needed.",
  },
  {
    num: "03",
    title: "Watch results live",
    desc: "Results update in real-time via WebSocket. No refresh. No delay. Just live data flowing in.",
  },
];

const FEATURES = [
  {
    icon: <Activity size={22} />,
    title: "Real-time Results",
    desc: "Powered by Socket.io — every vote appears instantly on the analytics page without a single refresh.",
    accent: "#6366F1",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Anonymous Voting",
    desc: "Guests don't need an account. Logged-in users are protected from double-voting automatically.",
    accent: "#10B981",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Detailed Analytics",
    desc: "Per-question breakdowns, vote percentages, and live totals — all in one clean dashboard.",
    accent: "#F59E0B",
  },
  {
    icon: <Zap size={22} />,
    title: "Instant Setup",
    desc: "No configuration needed. Create a poll, get a code, and start collecting responses in seconds.",
    accent: "#A78BFA",
  },
  {
    icon: <Users size={22} />,
    title: "Guest Friendly",
    desc: "Voters participate as guests with just their name — zero friction, maximum participation.",
    accent: "#34D399",
  },
  {
    icon: <Globe size={22} />,
    title: "Shareable Anywhere",
    desc: "Short access codes work everywhere — chat, email, or on screen during a live presentation.",
    accent: "#60A5FA",
  },
];

// ── Validation helpers ─────────────────────────────────────────
const CODE_REGEX = /^[A-Z0-9]+$/;

const validateCode = (raw) => {
  const c = raw.trim().toUpperCase();
  if (!c)              return { ok: false, msg: "Please enter a poll code" };
  if (c.length < 4)   return { ok: false, msg: "Code is too short (min 4 characters)" };
  if (c.length > 12)  return { ok: false, msg: "Code is too long (max 12 characters)" };
  if (!CODE_REGEX.test(c)) return { ok: false, msg: "Code can only contain letters and numbers" };
  return { ok: true, val: c };
};

export default function LandingPage() {
  const [code, setCode]       = useState("");
  const [codeErr, setCodeErr] = useState("");   // inline error under input
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); // strip invalid chars live
    setCode(val);
    if (codeErr) setCodeErr(""); // clear error on type
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const { ok, msg, val } = validateCode(code);
    if (!ok) {
      setCodeErr(msg);
      toast.error(msg);
      return;
    }
    setCodeErr("");
    setLoading(true);
    try {
      await pollAPI.getByCode(val);
      nav(`/poll/${val}`);
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      let userMsg;
      if (status === 404)      userMsg = `Poll "${val}" not found. Check the code and try again.`;
      else if (status === 410) userMsg = `This poll has expired and is no longer accepting votes.`;
      else if (status === 403) userMsg = `This poll is not currently active.`;
      else if (!err.response)  userMsg = "Cannot reach server. Check your connection.";
      else                     userMsg = serverMsg || "Something went wrong. Please try again.";
      setCodeErr(userMsg);
      toast.error(userMsg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* ── Atmosphere ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[700px] h-[700px] -top-48 -left-48 opacity-[0.18]" style={{ background: "var(--accent)" }} />
        <div className="orb w-[450px] h-[450px] top-1/2 -right-24 opacity-[0.10]" style={{ background: "#A78BFA" }} />
        <div className="orb w-[350px] h-[350px] -bottom-20 left-1/3 opacity-[0.08]" style={{ background: "#34D399" }} />
        <div className="absolute inset-0 dot-grid opacity-30" />
      </div>

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-36 pb-32">
        <div className="text-center">

          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-4 py-1.5 rounded-full mb-10 animate-fade-in"
            style={{
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-ring)",
              color: "var(--accent)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
            Real-time polling platform — free to use
          </div>

          {/* Headline */}
          <h1
            className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[0.92] tracking-tight mb-8 animate-fade-up"
            style={{ color: "var(--tx)" }}
          >
            Polls that move
            <br />
            <span className="shimmer-text">at the speed of now</span>
          </h1>

          <p
            className="font-body text-lg sm:text-xl max-w-xl mx-auto mb-14 animate-fade-up d2 leading-relaxed"
            style={{ color: "var(--tx-2)" }}
          >
            Create a poll in seconds. Share a short code.
            Watch responses arrive live — no refresh, no lag.
          </p>

          {/* Code entry */}
          <div className="max-w-lg mx-auto animate-fade-up d3 mb-6">
            <div
              className="card glass p-6 mb-5"
              style={{ boxShadow: "0 0 0 1px var(--accent-ring), 0 24px 64px rgba(0,0,0,0.2)" }}
            >
              <p className="font-body text-sm text-left mb-3" style={{ color: "var(--tx-2)" }}>
                Have a poll code? Jump right in →
              </p>
              <form onSubmit={handleJoin} className="flex gap-3">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="967629"
                  maxLength={10}
                  className="input-field font-inter text-center tracking-[1.5rem] uppercase text-base"
                />
                <button type="submit" disabled={loading} className="btn-primary px-6 shrink-0">
                  {loading ? <Spinner size="sm" /> : <><span>Join</span> <ArrowRight size={15} /></>}
                </button>
              </form>
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3">
              {user ? (
                <Link to="/dashboard" className="btn-primary gap-2 py-3 px-8 text-base">
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary gap-2 py-3 px-8 text-base">
                    Start for free <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="btn-ghost py-3 px-8 text-base">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>

          <p className="font-mono text-xs animate-fade-up d4" style={{ color: "var(--tx-muted)" }}>
            No credit card required · No signup needed to vote
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          DIVIDER
      ════════════════════════════════════════════ */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--border), transparent)" }} />

      {/* ════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════ */}
      <section className="relative z-10 py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span
              className="badge inline-block mb-4 font-mono text-xs"
            >
              How it works
            </span>
            <h2
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl"
              style={{ color: "var(--tx)" }}
            >
              Three steps to live results
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 relative">
            {/* Desktop connector line */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--border-h), var(--border-h), transparent)" }}
            />

            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="card glass glass-hover p-8 relative animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm mb-6"
                  style={{
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-ring)",
                    color: "var(--accent)",
                  }}
                >
                  {step.num}
                </div>
                <h3 className="font-display font-semibold text-lg mb-3" style={{ color: "var(--tx)" }}>
                  {step.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "var(--tx-muted)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════ */}
      <section
        className="relative z-10 py-28"
        style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge inline-block mb-4 font-mono text-xs">Features</span>
            <h2
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-4"
              style={{ color: "var(--tx)" }}
            >
              Everything you need,
              <br />
              <span style={{ color: "var(--tx-2)" }}>nothing you don't</span>
            </h2>
            <p className="font-body text-base max-w-md mx-auto" style={{ color: "var(--tx-2)" }}>
              SmartPoll is built to be fast, simple, and useful for collecting real opinions in real time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="card glass-hover p-6 animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s`, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}28`, color: f.accent }}
                >
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-base mb-2" style={{ color: "var(--tx)" }}>
                  {f.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "var(--tx-muted)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 overflow-hidden">
        <div className="orb w-96 h-96 opacity-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "var(--accent)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight"
            style={{ color: "var(--tx)" }}
          >
            Ready to run your
            <br />
            <span className="shimmer-text">first poll?</span>
          </h2>
          <p className="font-body text-lg mb-10" style={{ color: "var(--tx-2)" }}>
            Create your account, build a poll, and have live results flowing in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/create" className="btn-primary gap-2 py-3.5 px-9 text-base">
                Create a Poll Now <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary gap-2 py-3.5 px-9 text-base">
                  Create free account <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn-ghost py-3.5 px-9 text-base">
                  Already have an account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer
        className="relative z-10 py-10"
        style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* Top row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8" style={{ borderBottom: "1px solid var(--border)" }}>
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold font-display"
                style={{ background: "var(--accent)" }}
              >
                S
              </div>
              <div>
                <span className="font-display font-bold text-base block" style={{ color: "var(--tx)" }}>SmartPoll</span>
                <span className="font-mono text-xs" style={{ color: "var(--tx-muted)" }}>Real-time polling platform</span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex flex-wrap items-center gap-1">
              {[
                { label: "Home", to: "/" },
                { label: "Sign in", to: "/login" },
                { label: "Register", to: "/register" },
                ...(user
                  ? [{ label: "Dashboard", to: "/dashboard" }, { label: "Create Poll", to: "/create" }]
                  : []
                ),
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="px-3 py-1.5 rounded-lg font-body text-sm transition-colors duration-150"
                  style={{ color: "var(--tx-muted)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--tx)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--tx-muted)")}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
            <p className="font-mono text-xs" style={{ color: "var(--tx-muted)" }}>
              © {new Date().getFullYear()} SmartPoll. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--success)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
                All systems live
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}