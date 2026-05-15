import { useTheme } from "../../context/ThemeContext.jsx";

export default function DotsBackground() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div
        className="w-full h-full transition-all duration-300"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(circle, rgba(255,255,255,0.12) 1.1px, transparent 1.1px)"
            : "radial-gradient(circle, rgba(0,0,0,0.10) 1.1px, transparent 1.1px)",

          backgroundSize: "18px 18px",
          opacity: isDark ? 0.35 : 0.5,
        }}
      />
    </div>
  );
}