import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pollAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Spinner, EmptyState, ConfirmModal } from "../components/ui/index";
import toast from "react-hot-toast";
import DotsBackground from "../components/ui/DotsBackground";
import { Vote, ClipboardCopy, BadgeX, EllipsisVertical } from "lucide-react";


const statusClass = {
  active:    "badge-active",
  expired:   "badge-expired",
  draft:     "",
  published: "badge-active",
};

export default function DashboardPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // pollId being deleted
  const [closing, setClosing] = useState(null); // pollId being closed/re-opened
  const [confirm, setConfirm] = useState(null); // { action, id, title }

  // Small-screen actions menu
  const [openMenuFor, setOpenMenuFor] = useState(null); // pollId
  const menuWrapRef = useRef(null);


  const { user } = useAuth();
  const nav = useNavigate();

  const fetchPolls = () => {
    setLoading(true);
    pollAPI.getMyPolls()
      .then((r) => {
        // GET /poll/my → { success, data: { polls: [] } }
        setPolls(r.data.data?.polls ?? []);
      })
      .catch(() => toast.error("Could not load your polls"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  useEffect(() => {
    if (!openMenuFor) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenMenuFor(null);
    };

    const onPointerDown = (e) => {
      const wrap = menuWrapRef.current;
      if (!wrap) return;
      if (!wrap.contains(e.target)) setOpenMenuFor(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openMenuFor]);


  const copyLink = (code) => {
    const url = `${window.location.origin}/poll/${code}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Voting link copied!"));
  };

  const handleConfirm = async () => {
    if (!confirm) return;

    if (confirm.action === "delete") {
      setDeleting(confirm.id);
      try {
        await pollAPI.delete(confirm.id);
        setPolls((p) => p.filter((x) => x._id !== confirm.id));
        toast.success("Poll deleted");
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("Delete route not found on backend — add DELETE /poll/:id");
        } else {
          toast.error(err.response?.data?.message || "Failed to delete poll");
        }
      } finally {
        setDeleting(null);
        setConfirm(null);
      }
      return;
    }

    if (confirm.action === "close") {
      setClosing(confirm.id);
      try {
        await pollAPI.close(confirm.id);
        await fetchPolls();
        toast.success("Poll closed");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update poll");
      } finally {
        setClosing(null);
        setConfirm(null);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" >
      <DotsBackground />

      {/* Soft gradient base (gives depth) */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at top, rgba(80, 82, 227, 0.12), transparent 40%), radial-gradient(circle at bottom, rgba(102, 42, 25, 0.08), transparent 50%)",
        }}
      />

      {/* Grid layer (subtle) */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34, 24, 24, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(128, 108, 108, 0.04) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          opacity: 0.25,
        }}
      />
      
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 animate-fade-up">
          <div className="min-w-0">
            <h1 className="font-display font-bold text-3xl" style={{ color: "var(--tx)" }}>My Polls</h1>
            <p className="font-body text-sm mt-1" style={{ color: "var(--tx-muted)" }}>
              Welcome back, <span style={{ color: "var(--tx-2)" }}>{user?.name}</span>
            </p>
          </div>
          <Link to="/create" className="btn-primary whitespace-nowrap">+ New Poll</Link>
        </div>

        {/* Stats bar */}
        {!loading && polls.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up d2">
            {[
              { label: "Total", value: polls.length },
              { label: "Active", value: polls.filter((p) => p.status === "active").length },
              { label: "Questions", value: polls.reduce((a, p) => a + (p.questions?.length ?? 0), 0) },
            ].map((s) => (
              <div key={s.label} className="card glass text-center p-4">
                <div className="font-display font-bold text-2xl" style={{ color: "var(--tx)" }}>{s.value}</div>
                <div className="font-mono text-xs mt-0.5" style={{ color: "var(--tx-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : polls.length === 0 ? (
          <EmptyState
            icon=<Vote size={90} />
            title="No polls yet"
            desc="Create your first poll and share it in seconds."
            action={<Link to="/create" className="btn-primary">Create Poll →</Link>}
          />
        ) : (
          <div className="grid gap-3">
            {polls.map((poll, i) => (
              <div
                key={poll._id}
                className="card glass glass-hover p-5 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`badge ${statusClass[poll.status] ?? ""}`}>
                        {poll.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                        {poll.status}
                      </span>
                      {poll.isAnonymous && <span className="badge badge-anon">anonymous</span>}
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ color: "var(--tx-muted)", background: "var(--bg-surface)" }}>
                        Code: <span style={{ color: "var(--tx-2)", letterSpacing: "0.12em" }}>{poll.accessCode}</span>
                      </span>
                    </div>

                    <h2 className="font-body text-sm mt-0.5 line-clamp-1 sm:line-clamp-2" style={{ color: "var(--tx)" }}>
                      {poll.title}
                    </h2>

                    {poll.description && (
                      <p className="font-body text-sm mt-0.5 line-clamp-1" style={{ color: "var(--tx-muted)" }}>
                        {poll.description}
                      </p>
                    )}

                    <div
                      className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-1 sm:gap-4 mt-2 font-mono text-xs"
                      style={{ color: "var(--tx-muted)" }}
                    >
                      <span className="truncate max-w-[120px]">
                        {poll.questions?.length ?? 0} question{poll.questions?.length !== 1 ? "s" : ""}
                      </span>
                      {poll.expiresAt && (
                        <span className="sm:inline truncate max-w-[140px]">
                          Expires: {new Date(poll.expiresAt).toLocaleString()}
                        </span>
                      )}
                      <span className="sm:inline truncate max-w-[140px]">
                        Created: {new Date(poll.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {/* Copy (small + desktop) */}
                    <button
                      onClick={() => copyLink(poll.accessCode)}
                      className="btn-ghost py-2 px-3 text-xs" >
                      <ClipboardCopy size={19}  />
                    </button>
                    

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-2">
                      <button
                        onClick={() => nav(`/poll/edit/${poll._id}`)}
                        className="btn-ghost py-2 px-3 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => nav(`/analytics/${poll._id}`)}
                        className="btn-primary py-2 px-3 text-xs"
                      >
                        Analytics
                      </button>

                      {poll.status !== "expired" && (
                        <button
                          onClick={() =>
                            setConfirm({
                              action: "close",
                              id: poll._id,
                              title: poll.title,
                            })
                          }
                          className="btn-ghost py-2 px-3 text-xs"
                        >
                          Close
                        </button>
                      )}
                    </div>

                    {/* Small-screen: 3 dots dropdown */}
                    <div className="md:hidden relative" ref={openMenuFor === poll._id ? menuWrapRef : null}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuFor((cur) => (cur === poll._id ? null : poll._id))
                        }
                        className="btn-ghost py-2 px-3 text-xs"
                        aria-label="More actions"
                      >
                        <EllipsisVertical size={19} />
                      </button>

                      {openMenuFor === poll._id && (
                        <div
                          className="absolute right-0 mt-2 w-44 card glass p-2 flex flex-col gap-1"
                          style={{ borderRadius: 14, zIndex: 60 }}
                        >
                          <button
                            className="btn-ghost py-2 px-3 text-xs justify-start"
                            onClick={() => {
                              setOpenMenuFor(null);
                              nav(`/poll/edit/${poll._id}`);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-ghost py-2 px-3 text-xs justify-start"
                            onClick={() => {
                              setOpenMenuFor(null);
                              nav(`/analytics/${poll._id}`);
                            }}
                          >
                            Analytics
                          </button>

                          {poll.status !== "expired" && (
                            <button
                              className="btn-ghost py-2 px-3 text-xs justify-start"
                              onClick={() => {
                                setOpenMenuFor(null);
                                setConfirm({
                                  action: "close",
                                  id: poll._id,
                                  title: poll.title,
                                });
                              }}
                            >
                              Close
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete (small + desktop) */}
                    <button
                      onClick={() => setConfirm({ action: "delete", id: poll._id, title: poll.title })}
                      className="py-2 px-3 text-xs"
                      aria-label="Delete poll"
                    >
                      <BadgeX size={19} color="#a63636" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.action === "delete" ? "Delete Poll?" : "Close Poll?"}
        desc={
          confirm?.action === "delete"
            ? `"${confirm?.title}" will be permanently deleted along with all its responses.`
            : `Close poll "${confirm?.title}" (voting will be disabled).`
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
        loading={!!deleting || !!closing}
      />
    </div>
  );
}
