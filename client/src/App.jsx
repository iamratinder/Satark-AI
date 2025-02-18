import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import Layout from "./components/layouts/Layout";
// import ProtectedRoute from "./components/layouts/ProtectedRoute";

// Public routes
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Protected routes
import Dashboard from "./pages/portal/Dashboard";
import LegalKnowledge from "./pages/portal/LegalKnowledge";
import DocumentGenerator from "./pages/portal/DocumentGenerator";
import LegalQA from "./pages/portal/LegalQA";
import CrimeAnalysis from "./pages/portal/CrimeAnalysis";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="knowledge" element={<LegalKnowledge />} />
        <Route path="generate" element={<DocumentGenerator />} />
        <Route path="qa" element={<LegalQA />} />
        <Route path="analysis" element={<CrimeAnalysis />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
