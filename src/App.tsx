import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import Artworks from "@/pages/Artworks";
import Applications from "@/pages/Applications";
import Transportation from "@/pages/Transportation";
import Tracking from "@/pages/Tracking";
import Documents from "@/pages/Documents";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/artworks" replace />} />
          <Route path="/artworks" element={<Artworks />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/transportation" element={<Transportation />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="*" element={<Navigate to="/artworks" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
