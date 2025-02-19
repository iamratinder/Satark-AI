import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import Layout from "./components/layouts/Layout";
import ProtectedRoute from "./components/layouts/ProtectedRoute";

// Public routes
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected routes
import Dashboard from "./pages/portal/Dashboard";
import LegalKnowledge from "./pages/portal/LegalKnowledge";
import DocumentGenerator from "./pages/portal/DocumentGenerator";
import LegalQA from "./pages/portal/LegalQA";
import CrimeAnalysis from "./pages/portal/CrimeAnalysis";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute />}
        >
          <Route path="" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="knowledge" element={<LegalKnowledge />} />
            <Route path="generate" element={<DocumentGenerator />} />
            <Route path="qa" element={<LegalQA />} />
            <Route path="analysis" element={<CrimeAnalysis />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;