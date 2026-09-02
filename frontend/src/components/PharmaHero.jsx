import React, { useState } from 'react';
import LabInput from './LabInput';
import { UploadCloud, PenLine } from 'lucide-react';
import './PharmaHero.css';

export default function PharmaHero({ onAnalyze, isLoading, error }) {
  const [showInput, setShowInput] = useState(null);

  return (
    <div className="hero-shell">
      <div className="hero-grid"></div>

      <div className="hero-content">
        {/* Left */}
        <div className="hero-left">
          <div className="hero-tag">
            <span className="hero-tag-dot"></span>
            Pharmaceutical Intelligence Platform
          </div>

          <h1 className="hero-title">
            Clinical Intelligence,
            <span className="hero-title-accent">Reimagined</span>
          </h1>

          <p className="hero-desc">
            Analyze blood panels, urine screenings, and toxicology
            reports with explainable AI — powered by MCP and clinical reference databases.
          </p>

          <div className="hero-features">
            <div className="hero-feat"><span className="hf-dot ok"></span> Severity Classification</div>
            <div className="hero-feat"><span className="hf-dot ai"></span> AI Interpretation</div>
            <div className="hero-feat"><span className="hf-dot tox"></span> Drug / Tox Screening</div>
          </div>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setShowInput('csv')}>
              <UploadCloud size={17} /> Upload Lab Report
            </button>
            <button className="btn-secondary" onClick={() => setShowInput('manual')}>
              <PenLine size={15} /> Enter Manually
            </button>
          </div>

          {error && <div className="hero-error">⚠ {error}</div>}
        </div>

        {/* Right: Animated Viz */}
        <div className="hero-right">
          <PharmaViz />
        </div>
      </div>

      {/* Input Overlay */}
      {showInput && (
        <div className="hero-input-overlay anim-scale-in">
          <div className="hero-input-card">
            <div className="hic-header">
              <h3>{showInput === 'csv' ? '📂 Upload Lab Report' : '✎ Manual Entry'}</h3>
              <button className="hic-close" onClick={() => setShowInput(null)}>✕</button>
            </div>
            <LabInput
              onAnalyze={(d) => { setShowInput(null); onAnalyze(d); }}
              isLoading={isLoading}
              defaultTab={showInput}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PharmaViz() {
  return (
    <div className="phviz">
      <div className="phviz-ring ring-outer"></div>
      <div className="phviz-ring ring-mid"></div>
      <div className="phviz-ring ring-inner"></div>

      <div className="orbit orbit-1"><div className="orb-dot orb-blue"></div></div>
      <div className="orbit orbit-2"><div className="orb-dot orb-indigo"></div></div>
      <div className="orbit orbit-3"><div className="orb-dot orb-teal"></div></div>

      <div className="phviz-core">
        <div className="phviz-core-ring"></div>
        <div className="phviz-core-icon">⚕</div>
      </div>

      <div className="capsule cap-1"></div>
      <div className="capsule cap-2"></div>
      <div className="capsule cap-3"></div>

      <div className="data-node node-1"><div className="dn-dot ok"></div><span>Hemoglobin</span></div>
      <div className="data-node node-2"><div className="dn-dot warn"></div><span>Glucose</span></div>
      <div className="data-node node-3"><div className="dn-dot err"></div><span>Creatinine</span></div>
      <div className="data-node node-4"><div className="dn-dot ok"></div><span>WBC Count</span></div>

      <svg className="phviz-wave" viewBox="0 0 400 80" preserveAspectRatio="none">
        <polyline
          points="0,40 25,22 50,52 75,18 100,48 130,26 160,44 190,16 220,52 250,22 280,48 310,12 340,44 370,28 400,40"
          fill="none" stroke="url(#wg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="wg" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="30%"  stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="70%"  stopColor="#6366f1" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="particle p1"></div>
      <div className="particle p2"></div>
      <div className="particle p3"></div>
      <div className="particle p4"></div>
      <div className="particle p5"></div>
    </div>
  );
}
