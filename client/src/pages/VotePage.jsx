import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pollAPI, responseAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { PageSkeleton, Spinner } from "../components/ui/index";

import toast from "react-hot-toast";
import DotsBackground from "../components/ui/DotsBackground.jsx";
import { SearchAlert } from 'lucide-react';


export default function VotePage() {
  const { code } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [poll, setPoll]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [answers, setAnswers]   = useState({}); // { questionId: selectedOption string }
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [answeredLive, setAnsweredLive] = useState(0);

  // Note: full-page skeleton used only for `loading` state above.


  useEffect(() => {
    pollAPI.getByCode(code)
      .then((r) => {
        // GET /poll/:code → { success, data: { ...poll } }
        const p = r.data.data;
        setPoll(p);
        const init = {};
        p.questions?.forEach((q) => { init[q._id] = null; });
        setAnswers(init);
      })
      .catch(async (err) => {

        const msg = err.response?.data?.message;
        const normalized =
          msg && msg.toLowerCase().includes("expired")
            ? "Poll expired"
            : msg || "Poll not found or has expired";
        setError(normalized);
      })
      .finally(() => setLoading(false));
  }, [code]);

  const select = (qId, opt) => {
    setAnswers((a) => {
      const next = { ...a, [qId]: opt };
      const nextAnswered = Object.values(next).filter(Boolean).length;
      setAnsweredLive(nextAnswered);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!user && poll?.isAnonymous === false) {
      toast.error("This poll does not allow anonymous voting");
      return;
    }
    // Validate mandatory
    for (const q of poll.questions) {
      if (q.isMandatory && !answers[q._id]) {
        toast.error(`"${q.text}" is required`);
        return;
      }
    }
    // Guest must provide name if not logged in
    if (!user && !guestName.trim()) {
      toast.error("Please enter your name to vote");
      return;
    }

    // Body shape: { guestName, answers: [{ questionId, selectedOptions: string[] }] }
    const payload = {
      guestName: user ? null : guestName.trim(),
      answers: Object.entries(answers)
        .filter(([, opt]) => opt !== null)
        .map(([questionId, opt]) => ({
          questionId,
          selectedOptions: [opt], // backend expects array even for single choice
        })),
    };

    setSubmitting(true);
    try {
      // POST /response/:pollId → { success, data: { pollId, guestName, answers, ... } }
      await responseAPI.submit(poll._id, payload);
      setSubmitted(true);
      toast.success("Vote submitted!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit vote";
      if (msg.toLowerCase().includes("already")) {
        toast.error("You've already voted on this poll");
      } else {
        toast.error(msg);
      }
    } finally { setSubmitting(false); }
  };

  // ── States ──────────────────────────────────────────────────────
  if (loading) return <PageSkeleton variant="vote" />;

  if (error) return (
      <div className="min-h-screen flex items-center justify-center px-4" >
        <DotsBackground />
        <div className="card glass mb-4 text-center py-16 animate-fade-up d2 items-center flex flex-col items-center justify-center p-10 max-w-sm">

          <div className="text-4xl mb-4"><SearchAlert size={110} strokeWidth={1.25} /></div>
          <h2 className="font-display font-bold text-xl mb-2" style={{ color: "var(--tx)" }}>Poll Unavailable</h2>
          <p className="font-body text-sm" style={{ color: "var(--tx-muted)" }}>{error}</p>

{/* <button
  onClick={async () => {
    try {
      console.log("Fetching poll:", code);

      const { data } = await pollAPI.getByCode(code);

      console.log("API response:", data);

      if (data?.success && data?.data?._id) {
        nav(`/analytics/${data.data._id}`);
      } else {
        toast.error("Poll not found");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
        "Analysis unavailable for this poll"
      );
    }
  }}
  className="btn-primary w-full mt-4"
>
  View Analytics →
</button> */}
        </div>
      </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="card glass text-center p-10 max-w-sm animate-fade-up">

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.3)" }}
        >
          ✓
        </div>
        <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--tx)" }}>Vote Recorded!</h2>
        <p className="font-body text-sm mb-6" style={{ color: "var(--tx-muted)" }}>
          Thanks for participating. Results update live.
        </p>
        <button onClick={() => nav(`/analytics/${poll._id}`)} className="btn-primary w-full">
          View Live Results →
        </button>
      </div>
    </div>
  );

  const answered = answeredLive ?? Object.values(answers).filter(Boolean).length;
  const total    = poll.questions?.length ?? 0;

  return (
    <div className="min-h-screen" >
       <DotsBackground />
      <div className="absolute inset-0 -z-10" style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        opacity: 0.3,
      }} />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        {poll && poll.isAnonymous === false && !user && (
          <div className="card glass p-6 mb-6">
            <p className="font-display font-bold" style={{ color: "var(--tx)" }}>
              Sign in to vote
            </p>
            <p className="font-body text-sm" style={{ color: "var(--tx-muted)" }}>
              This poll does not allow anonymous voting.
            </p>
          </div>
        )}

        {/* Poll header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge font-mono tracking-widest">{code}</span>
            {poll.isAnonymous && <span className="badge badge-anon">anonymous</span>}
            {poll.expiresAt && (
              <span className="badge">
                Expires {new Date(poll.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h1 className="font-display font-bold text-3xl mb-2" style={{ color: "var(--tx)" }}>{poll.title}</h1>
          {poll.description && <p className="font-body" style={{ color: "var(--tx-2)" }}>{poll.description}</p>}

          {/* Progress */}
<div className="mt-4 w-full">
  <div className="flex justify-between text-xs font-mono mb-1.5 text-gray-400">
    <span>{answered} of {total} answered</span>
    <span>{Math.round((answered / Math.max(total, 1)) * 100)}%</span>
  </div>

  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
      style={{
        width: `${(answered / Math.max(total, 1)) * 100}%`,
      }}
    />
  </div>
</div>
        </div>

        {/* Guest name */}
        {!user && poll?.isAnonymous !== false && (
          <div className="card glass p-5 mb-6 animate-fade-up d2">
            <label
              className="block text-sm font-body mb-1.5"
              style={{ color: "var(--tx-2)" }}
            >
              Your name <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="How should we call you?"
              className="input-field"
            />
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {poll.questions?.map((q, qi) => (
            <div
              key={q._id}
              className="card glass p-6 animate-fade-up"
              style={{ animationDelay: `${(qi + 1) * 0.06}s` }}
            >
              <p className="font-display font-semibold mb-4" style={{ color: "var(--tx)" }}>
                {qi + 1}. {q.text}
                {q.isMandatory && <span style={{ color: "var(--danger)" }}> *</span>}
              </p>

              <div className="space-y-2">
                {q.options?.map((opt) => {
                  const selected = answers[q._id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => select(q._id, opt)}
                      className="w-full text-left px-4 py-3 rounded-xl font-body text-sm transition-all duration-150"
                      style={{
                        background: selected ? "var(--accent-dim)" : "var(--bg-surface)",
                        border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                        color: selected ? "var(--accent)" : "var(--tx-2)",
                        boxShadow: selected ? `0 0 0 3px var(--accent-ring)` : "none",
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all"
                          style={{
                            border: `2px solid ${selected ? "var(--accent)" : "var(--border-h)"}`,
                          }}
                        >
                          {selected && (
                            <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                          )}
                        </span>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full py-3.5 text-base mt-8 animate-fade-up"
          style={{ animationDelay: `${(total + 1) * 0.06}s` }}
        >
          {submitting ? <Spinner size="sm" /> : "Submit Vote →"}
        </button>
      </div>
    </div>
  );
}
