import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";


// ── Spinner ────────────────────────────────────────────────────────
export const Spinner = ({ size = "md" }) => {
  const cls = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-10 h-10 border-[3px]" }[size];
  return (
    <div
      className={`${cls} rounded-full animate-spin`}
      style={{ borderColor: "var(--border-h)", borderTopColor: "var(--accent)" }}
    />
  );
};

// ── Skeletons ──────────────────────────────────────────────────────
const SkeletonBase = ({ className = "", style = {} }) => (
  <div
    className={`bg-[rgba(255,255,255,0.06)] ${className}`}
    style={{
      border: "1px solid var(--border)",
      borderRadius: 12,
      ...style,
    }}
  />
);

export const SkeletonLine = ({ w = "100%", h = 12, className = "" }) => (
  <div
    className={`h-[${h}px] bg-[rgba(255,255,255,0.06)] animate-pulse ${className}`}
    style={{ width: w, borderRadius: 999, border: "1px solid var(--border)" }}
  />
);

export const PageSkeleton = ({ variant = "default" }) => {
  const isVote = variant === "vote";
  const isAnalytics = variant === "analytics";
  const isDashboard = variant === "dashboard";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {isDashboard && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <SkeletonBase className="w-52 h-10" style={{ borderRadius: 14 }} />
                <SkeletonBase className="w-44 h-6" style={{ borderRadius: 10 }} />
              </div>
              <SkeletonBase className="w-32 h-10" style={{ borderRadius: 14 }} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBase key={i} className="h-28" style={{ borderRadius: 16 }} />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBase key={i} className="h-44" style={{ borderRadius: 18 }} />
              ))}
            </div>
          </div>
        )}

        {isAnalytics && (
          <div className="space-y-6">
            <SkeletonBase className="w-64 h-10" style={{ borderRadius: 14 }} />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBase key={i} className="h-24" style={{ borderRadius: 16 }} />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBase key={i} className="h-72" style={{ borderRadius: 18 }} />
              ))}
            </div>
          </div>
        )}

        {isVote && (
          <div className="space-y-6">
            <SkeletonBase className="w-32 h-8" style={{ borderRadius: 999 }} />
            <SkeletonBase className="w-80 h-10" style={{ borderRadius: 14 }} />
            <SkeletonBase className="w-full h-4" style={{ borderRadius: 999 }} />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <SkeletonBase className="w-full h-14" style={{ borderRadius: 18 }} />
                  <SkeletonBase className="w-full h-56" style={{ borderRadius: 18 }} />
                </div>
              ))}
            </div>
            <SkeletonBase className="w-full h-12" style={{ borderRadius: 16 }} />
          </div>
        )}

        {!isVote && !isAnalytics && !isDashboard && (
          <div className="space-y-6">
            <SkeletonBase className="w-64 h-10" style={{ borderRadius: 14 }} />
            <SkeletonBase className="w-full h-14" style={{ borderRadius: 18 }} />
            <SkeletonBase className="w-full h-96" style={{ borderRadius: 18 }} />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page loader (fallback) ─────────────────────────────────────────
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="font-mono text-xs" style={{ color: "var(--tx-muted)" }}>Loading…</p>
    </div>
  </div>
);

// ── Empty state ────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, desc, action }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-display font-semibold text-lg mb-1" style={{ color: "var(--tx)" }}>{title}</h3>
    <p className="font-body text-sm mb-6 max-w-xs" style={{ color: "var(--tx-muted)" }}>{desc}</p>
    {action}
  </div>
);

// ── Theme toggle ───────────────────────────────────────────────────
export const ThemeToggle = () => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
      style={{
        background: "var(--accent-dim)",
        border: "1px solid var(--border)",
      }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <span className="text-lg leading-none">
        {isDark ? <Sun color="#595e77" absoluteStrokeWidth="enable" /> : <Moon color="#66686e" StrokeWidth={1}/>}
      </span>
    </button>
  );
};

// ── Confirm modal ──────────────────────────────────────────────────
export const ConfirmModal = ({ open, title, desc, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onCancel} />
      <div className="relative card glass p-6 w-full max-w-sm animate-fade-up">
        <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--tx)" }}>{title}</h3>
        <p className="font-body text-sm mb-6" style={{ color: "var(--tx-2)" }}>{desc}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-ghost py-2 px-4 text-sm" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn-danger py-2 px-4 text-sm" onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner size="sm" /> : (title?.toLowerCase().includes("close") ? "Close" : "Delete")}
          </button>
        </div>
      </div>
    </div>
  );
};
