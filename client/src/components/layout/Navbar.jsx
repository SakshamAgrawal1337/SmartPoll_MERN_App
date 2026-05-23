import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../ui/index";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  // Mobile: hide desktop links behind a simple drawer
  const [open, setOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const onScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);


  const isActive = (p) => loc.pathname === p;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    nav("/login");
  };

  

  return (
      <header
        className="fixed z-50 transition-all duration-500 ease-out border"
        style={{
          top: scrolled ? 12 : 0,
          left: scrolled ? "50%" : 0,
          right: scrolled ? "auto" : 0,
          transform: scrolled ? "translateX(-50%)" : "translateX(0)",
          width: scrolled ? "min(92%, 1100px)" : "100%",
          borderRadius: scrolled ? "999px" : "0px",
          background: "var(--nav)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "var(--border)",
          boxShadow: scrolled
            ? "0 8px 30px rgba(0,0,0,0.12)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
      >
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold font-display transition-transform duration-200 group-hover:scale-105"
            style={{ background: "var(--accent)" }}
          >
            S
          </div>
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: "var(--tx)" }}>
            SmartPoll
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-1.5">
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create"
                  className={`nav-link ${isActive("/create") ? "active" : ""}`}
                >
                  Create Poll
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden"
                onClick={() => setOpen((v) => !v)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "var(--accent-dim)",
                  border: "1px solid var(--border)",
                }}
                aria-label="Open menu"
                title="Menu"
              >
                <span className="text-sm" style={{ color: "var(--tx)" }}>
                  {open ? "✕" : "☰"}
                </span>
              </button>

              <div
                className="flex items-center gap-2 ml-2 pl-3"
                style={{ borderLeft: "1px solid var(--border)" }}
              >
                {/* User chip */}
                <span
                  className="hidden sm:flex items-center gap-2 text-sm font-body px-3 py-1.5 rounded-lg"
                  style={{ color: "var(--tx-2)", background: "var(--accent-dim)" }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "var(--accent)" }}
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                  {user.name}
                </span>

                <ThemeToggle />

                <button onClick={handleLogout} className="btn-ghost py-2 px-3 text-sm">
                  Logout
                </button>
              </div>

              {/* Mobile dropdown */}
              {open && (
                <div
                  className="md:hidden absolute left-4 right-4 top-16 z-50 card glass p-3"
                  style={{ borderRadius: 16 }}
                >
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/create"
                      onClick={() => setOpen(false)}
                      className={`nav-link ${isActive("/create") ? "active" : ""}`}
                    >
                      Create Poll
                    </Link>
                  </div>
                </div>
              )}
            </>

          ) : (
            <>
              <ThemeToggle />
              <Link to="/login" className="btn-ghost py-2 px-4 text-sm">Login</Link>
              <Link to="/register" className="btn-primary py-2 px-2.5 sm:px-4 text-[11px] sm:text-sm whitespace-nowrap">  Get Started</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
