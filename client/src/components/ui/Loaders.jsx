export const Spinner = ({ size = "md" }) => {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" }[size];
  return (
    <div className={`${s} border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-night flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-slate-500 font-body text-sm">Loading...</p>
    </div>
  </div>
);

export const EmptyState = ({ icon, title, desc, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-display font-semibold text-white text-lg mb-1">{title}</h3>
    <p className="text-slate-500 font-body text-sm mb-6 max-w-xs">{desc}</p>
    {action}
  </div>
);
