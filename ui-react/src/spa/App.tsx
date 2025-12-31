import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import ProductionPipeline from "@/screens/ProductionPipeline";

function Home() {
  return (
    <div className="rls-home">
      <div className="rls-title">Record Label Simulator</div>
      <div className="rls-subtitle">React preview surfaces for pipeline and routing.</div>
      <div className="rls-card">
        <div className="rls-card-title">Production Pipeline</div>
        <div className="rls-card-body">Explore the split layout and virtualized act list.</div>
        <Link className="rls-cta" to="/pipeline">Open Pipeline</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="rls-app">
      <header className="rls-topbar">
        <div className="rls-logo">RLS</div>
        <nav className="rls-nav">
          <Link to="/">Home</Link>
          <Link to="/pipeline">Pipeline</Link>
        </nav>
      </header>
      <main className="rls-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pipeline" element={<ProductionPipeline />} />
          <Route
            path="*"
            element={
              <div className="rls-card">
                <div className="rls-card-title">Not Found</div>
                <div className="rls-card-body">That route doesn't exist yet.</div>
                <Link className="rls-cta" to="/">Return Home</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
