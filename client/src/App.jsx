import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useLenis } from "./lib/lenis";
import { PageLoader } from "./components/ui/index";
import Navbar from "./components/layout/Navbar";

import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import DashboardPage  from "./pages/DashboardPage";
import CreatePollPage from "./pages/CreatePollPage";
import VotePage       from "./pages/VotePage";
import AnalyticsPage  from "./pages/AnalyticsPage";
import EditPollPage from "./pages/EditPollPage";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  useLenis();
  const { loading } = useAuth();
  if (loading) return <PageLoader />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"              element={<LandingPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/register"      element={<RegisterPage />} />
        <Route path="/poll/:code"    element={<VotePage />} />
        <Route path="/poll/edit/:id" element={<Protected> <EditPollPage /></Protected>} />
        {/* Analytics uses poll _id (not code) */}
        <Route path="/analytics/:pollId" element={<AnalyticsPage />} />
        <Route path="/dashboard"     element={<Protected><DashboardPage /></Protected>} />
        <Route path="/create"        element={<Protected><CreatePollPage /></Protected>} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
