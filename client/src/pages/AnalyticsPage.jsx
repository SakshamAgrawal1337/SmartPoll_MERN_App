import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pollAPI, analyticsAPI } from "../lib/api";
import { joinPollRoom, leaveSocket } from "../lib/socket.js";
import { Spinner } from "../components/ui/index";
import toast from "react-hot-toast";
import DotsBackground from "../components/ui/DotsBackground";
import {ChartBarStacked} from "lucide-react";

const COLORS = [
  "linear-gradient(90deg,#6366F1,#818CF8)",
  "linear-gradient(90deg,#8B5CF6,#A78BFA)",
  "linear-gradient(90deg,#10B981,#34D399)",
  "linear-gradient(90deg,#F59E0B,#FCD34D)",
  "linear-gradient(90deg,#F43F5E,#FB7185)",
];

export default function AnalyticsPage() {
  const { pollId } = useParams(); // route: /analytics/:pollId  (uses _id)
  const nav = useNavigate();

  const [poll, setPoll]           = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [liveCount, setLiveCount] = useState(null);
  const [lastPing, setLastPing]   = useState(null);
  const [socketOk, setSocketOk]   = useState(false);

  const fetchAnalytics = useCallback(async (pid) => {
    try {
      // GET /analytics/:pollId → { success, data: { pollId, totalResponses, questionStats } }
      const r = await analyticsAPI.get(pid);
      const d = r.data.data;
      setAnalytics(d);
      setLiveCount(d.totalResponses);
    } catch (_) {}
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // First get poll data for title etc using _id directly via analytics
        // We receive _id as pollId param from dashboard
        await fetchAnalytics(pollId);

        // Socket setup — join room with pollId
        const sock = joinPollRoom(pollId);
        setSocketOk(sock.connected);

        sock.on("connect", () => setSocketOk(true));
        sock.on("disconnect", () => setSocketOk(false));

        // analytics-update event: { pollId, totalResponses }
        sock.on("analytics-update", (payload) => {
          setLiveCount(payload.totalResponses);
          setLastPing(new Date());
          // re-fetch full breakdown so question/option charts update too
          fetchAnalytics(pollId);
        });
      } catch (err) {
        toast.error("Could not load analytics");
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => leaveSocket();
  }, [pollId]);

  // ── NOTE to developer ─────────────────────────────────────────
  // Your analytics response showed all option votes as 0 despite 1 totalResponse.
  // This is likely because analytics.service.js matches answer.selectedOption (singular)
  // but your response model stores selectedOptions (plural array).
  // Fix in analytics.service.js: check answer.selectedOptions?.[0] || answer.selectedOption
  // ─────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <Spinner size="lg" />
    </div>
  );

  const total = liveCount ?? analytics?.totalResponses ?? 0;
  const qStats = analytics?.questionStats ?? {};
  

  return (
    <div className="min-h-screen relative" >
      <DotsBackground />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20"
      style={{ background: "radial-gradient(circle , rgba(31, 31, 138, 0.12), transparent 40%), radial-gradient(circle at bottom, rgba(111, 23, 33, 0.08), transparent 50%)", }}

      >

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
                  style={{ background: socketOk ? "rgba(16,185,129,0.1)" : "var(--bg-surface)", color: socketOk ? "var(--success)" : "var(--tx-muted)", border: `1px solid ${socketOk ? "rgba(16,185,129,0.3)" : "var(--border)"}` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: socketOk ? "var(--success)" : "var(--tx-muted)" }} />
                  {socketOk ? "LIVE" : "Connecting…"}
                </span>
                {lastPing && (
                  <span className="font-mono text-xs" style={{ color: "var(--tx-muted)" }}>
                    Updated {lastPing.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-2xl truncate" style={{ color: "var(--tx)" }}>
                {analytics ? "Poll Analytics" : "Analytics"}
              </h1>
              <p className="font-mono text-xs mt-1" style={{ color: "var(--tx-muted)" }}>ID: {pollId}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {/* <button onClick={() => nav(-1)} className="btn-ghost py-2 px-3 text-xs">← Back</button> */}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Total Votes", value: total },
              { label: "Questions", value: Object.keys(qStats).length },
              { label: "Status", value: total > 0 ? "Active" : "No votes" },
            ].map((s) => (
              <div key={s.label} className="card glass text-center p-4">
                <div className="font-display font-bold text-2xl" style={{ color: "var(--tx)" }}>{s.value}</div>
                <div className="font-mono text-xs mt-0.5" style={{ color: "var(--tx-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* No responses yet */}
        {total === 0 && (
          <div className="card glass mb-4 text-center py-16 animate-fade-up d2 items-center flex flex-col items-center justify-center">
            <div className="text-4xl mb-3 "><ChartBarStacked size={52} /></div>

            <p className="font-display font-semibold" style={{ color: "var(--tx)" }}>No votes yet</p>
            <p className="font-body text-sm mt-1" style={{ color: "var(--tx-muted)" }}>
              Results will appear here as people vote.
            </p>

            {/* Backend bug warning */}
            {/* <div
              className="mt-6 mx-4 p-3 rounded-xl text-left font-mono text-xs"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}
            >
              ⚠️ If you submitted votes but see 0 here, check your analytics.service.js —
              it may read <code>selectedOption</code> but backend stores <code>selectedOptions[]</code>.
            </div> */}
          </div>
        )}

        {/* Question stats */}
        {Object.keys(qStats).length > 0 && (
          <div className="space-y-5">
            {Object.entries(qStats).map(([qId, stat], qi) => {
              const sorted = Object.entries(stat.options).sort(([, a], [, b]) => b - a);
              const max    = sorted[0]?.[1] ?? 0;

              return (
                <div
                  key={qId}
                  className="card glass p-6 animate-fade-up"
                  style={{ animationDelay: `${qi * 0.07}s` }}
                >
                  <h3 className="font-display font-semibold mb-1" style={{ color: "var(--tx)" }}>
                    {qi + 1}. {stat.text}
                  </h3>
                  <p className="font-mono text-xs mb-5" style={{ color: "var(--tx-muted)" }}>
                    {stat.totalVotes} vote{stat.totalVotes !== 1 ? "s" : ""}
                  </p>

                  <div className="space-y-4">
                    {sorted.map(([option, votes], oi) => {
                      const pct    = stat.totalVotes > 0 ? Math.round((votes / stat.totalVotes) * 100) : 0;
                      const isTop  = oi === 0 && votes > 0;

                      return (
                        <div key={option}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="flex items-center gap-2 font-body text-sm" style={{ color: "var(--tx-2)" }}>
                              {isTop && <span className="text-xs">🏆</span>}
                              {option}
                            </span>
                            <div className="flex items-center gap-3 font-mono text-xs" style={{ color: "var(--tx-muted)" }}>
                              <span>{votes} vote{votes !== 1 ? "s" : ""}</span>
                              <span
                                className="font-semibold text-sm"
                                style={{ color: isTop ? "var(--accent)" : "var(--tx-muted)" }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </div>
                          <div className="prog-track">
                            <div
                              className="prog-fill" style={{ width: `${pct}%`, background: COLORS[oi % COLORS.length],}}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
