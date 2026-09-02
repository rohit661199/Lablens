import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LabInput from './components/LabInput';
import ResultsDisplay from './components/ResultsDisplay';
import PharmaHero from './components/PharmaHero';
import { Activity, Download, Cpu, Sun, Moon, Wifi, CheckCircle, Server } from 'lucide-react';
import './App.css';

const WORKFLOW = [
  { id: 'specimen',  label: 'Specimen Ingested',      done: true },
  { id: 'validate',  label: 'Reference Validation',   done: true },
  { id: 'classify',  label: 'Severity Classification',done: true },
  { id: 'mcp',       label: 'MCP Tool Invoked',       done: false },
  { id: 'ai',        label: 'AI Interpretation',      done: false },
  { id: 'report',    label: 'Report Generated',       done: false },
];

export default function App() {
  const [theme, setTheme]     = useState('dark');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [flowStep, setFlowStep] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [filterSev, setFilterSev]     = useState('All');
  const [searchQ, setSearchQ]         = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let t;
    if (isLoading) {
      setFlowStep(0);
      t = setInterval(() => setFlowStep(p => p < WORKFLOW.length - 2 ? p + 1 : p), 1500);
    } else if (results.length > 0) {
      setFlowStep(WORKFLOW.length - 1);
    }
    return () => clearInterval(t);
  }, [isLoading, results.length]);

  // Keyboard nav
  useEffect(() => {
    const fn = (e) => {
      if (!results.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(p => p === null ? 0 : Math.min(p + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIdx(p => p === null ? 0 : Math.max(p - 1, 0)); }
      if (e.key === 'Escape')    setSelectedIdx(null);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [results.length]);

  const handleAnalyze = async (data) => {
    setIsLoading(true); setError(null); setResults([]); setSelectedIdx(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const r = await fetch(`${apiUrl}/analyze_labs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: data }),
      });
      if (!r.ok) throw new Error(r.statusText);
      const d = await r.json();
      setResults(d.analyzed_results);
    } catch (e) {
      setError('Failed to reach the analysis server. Please ensure the backend is running on port 8001.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const ts = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
    const stats = {
      total: results.length,
      normal: results.filter(r => r.Severity === 'Normal').length,
      warning: results.filter(r => r.Severity === 'Warning').length,
      critical: results.filter(r => r.Severity === 'Critical').length,
    };
    const sc = { Normal: '#059669', Warning: '#d97706', Critical: '#dc2626' };
    const sb = { Normal: '#ecfdf5', Warning: '#fffbeb', Critical: '#fef2f2' };

    const rows = results.map((r, i) => `
      <div class="r-card ${r.Severity.toLowerCase()}">
        <div class="r-hdr">
          <div class="r-hdr-l">
            <span class="r-num">${String(i+1).padStart(2,'0')}</span>
            <h3>${r.Test_Name}</h3>
            <span class="badge" style="background:${sb[r.Severity]};color:${sc[r.Severity]}">${r.Severity.toUpperCase()}</span>
          </div>
          <div class="r-hdr-r"><span class="val">${r.Result}</span><span class="unit">${r.Unit||''}</span></div>
        </div>
        <div class="r-body">
          <div class="r-meta"><span class="ml">Reference Range:</span><span class="mv">${r.Reference_Range||'N/A'}</span></div>
          <div class="r-interp">
            <div><span class="ml">Clinical Interpretation</span><p>${r.Explanation}</p></div>
            <div><span class="ml">Recommended Action</span><p>${r.Suggested_Next_Steps}</p></div>
          </div>
        </div>
      </div>`).join('');

    const html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8"><title>Clinova Report — ${ts}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;background:#fff;color:#0f172a;font-size:13px}
.cover{height:100vh;background:linear-gradient(135deg,#0b1220,#162035,#0b1220);display:flex;flex-direction:column;justify-content:space-between;padding:60px;page-break-after:always}
.clogo{display:flex;align-items:center;gap:14px}.cmark{width:52px;height:52px;background:rgba(6,182,212,.15);border:2px solid #06b6d4;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:26px;color:#06b6d4}
.ctext h1{color:#f0f4ff;font-size:26px;font-weight:800;letter-spacing:.06em}.ctext p{color:#8a9cc0;font-size:13px;margin-top:3px}
.ctitle{color:#f0f4ff;font-size:44px;font-weight:900;line-height:1.1}.ctitle span{color:#22d3ee}
.cmeta{display:flex;gap:48px}.cmi p{color:#52647a;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px}.cmi h4{color:#c8d5f0;font-size:16px;font-weight:600}
.sum{padding:50px;page-break-after:always}
.sh{display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #e2e8f0}
.sh h2{font-size:20px;font-weight:700}.stag{font-size:10px;font-weight:600;color:#64748b;background:#f1f5f9;padding:3px 10px;border-radius:20px;letter-spacing:.08em;text-transform:uppercase}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:40px}
.sc{padding:24px;border-radius:12px;text-align:center}.sc p{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}.sc h3{font-size:38px;font-weight:800}
.sc.t{background:#f8fafc}.sc.t p{color:#64748b}.sc.t h3{color:#0f172a}
.sc.n{background:#ecfdf5}.sc.n p{color:#065f46}.sc.n h3{color:#059669}
.sc.w{background:#fffbeb}.sc.w p{color:#92400e}.sc.w h3{color:#d97706}
.sc.c{background:#fef2f2}.sc.c p{color:#991b1b}.sc.c h3{color:#dc2626}
.dbar{display:flex;height:14px;background:#e2e8f0;border-radius:7px;overflow:hidden;margin:16px 0 8px}
.ds{height:100%}.ds.n{background:#059669}.ds.w{background:#d97706}.ds.c{background:#dc2626}
.dl{display:flex;gap:20px;font-size:11px;font-weight:600}
.rp{padding:50px}
.r-card{margin-bottom:28px;border-radius:10px;border:1px solid #e2e8f0;overflow:hidden;page-break-inside:avoid}
.r-card.critical{border-left:5px solid #dc2626}.r-card.warning{border-left:5px solid #d97706}.r-card.normal{border-left:5px solid #059669}
.r-hdr{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0}
.r-hdr-l{display:flex;align-items:center;gap:12px}.r-num{font-size:11px;font-weight:700;color:#94a3b8;font-family:monospace}
.r-hdr-l h3{font-size:16px;font-weight:700}.badge{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:.08em}
.r-hdr-r{display:flex;align-items:baseline;gap:6px}.val{font-size:28px;font-weight:800}.unit{font-size:14px;color:#64748b}
.r-body{padding:18px 20px}.r-meta{display:flex;gap:12px;align-items:center;background:#f1f5f9;padding:10px 14px;border-radius:6px;margin-bottom:16px}
.ml{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#64748b;flex-shrink:0}.mv{font-size:13px;font-weight:600;color:#334155}
.r-interp{display:grid;grid-template-columns:1fr 1fr;gap:20px}.r-interp .ml{display:block;margin-bottom:6px}.r-interp p{font-size:12.5px;color:#475569;line-height:1.6}
.footer{background:#0b1220;padding:28px 50px;display:flex;justify-content:space-between;align-items:center}
.footer p{color:#52647a;font-size:11px}.footer span{color:#22d3ee;font-weight:600}
@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}.cover{height:100vh}}
</style></head><body>
<div class="cover">
  <div class="clogo"><div class="cmark">⚕</div><div class="ctext"><h1>CLINOVA</h1><p>Pharmaceutical &amp; Clinical Intelligence</p></div></div>
  <div><div class="ctitle">Laboratory<br><span>Diagnostic Report</span></div></div>
  <div class="cmeta">
    <div class="cmi"><p>Generated</p><h4>${ts}</h4></div>
    <div class="cmi"><p>Specimens</p><h4>${stats.total} Tests</h4></div>
    <div class="cmi"><p>Engine</p><h4>Clinova MCP v1.0</h4></div>
    <div class="cmi"><p>Status</p><h4>Complete</h4></div>
  </div>
</div>
<div class="sum">
  <div class="sh"><h2>Batch Analysis Summary</h2><span class="stag">Overview</span></div>
  <div class="sg">
    <div class="sc t"><p>Total Tests</p><h3>${stats.total}</h3></div>
    <div class="sc n"><p>Normal</p><h3>${stats.normal}</h3></div>
    <div class="sc w"><p>Warning</p><h3>${stats.warning}</h3></div>
    <div class="sc c"><p>Critical</p><h3>${stats.critical}</h3></div>
  </div>
  <div class="sh"><h2>Severity Distribution</h2></div>
  <div class="dbar">
    ${stats.normal>0?`<div class="ds n" style="flex:${stats.normal}"></div>`:''}
    ${stats.warning>0?`<div class="ds w" style="flex:${stats.warning}"></div>`:''}
    ${stats.critical>0?`<div class="ds c" style="flex:${stats.critical}"></div>`:''}
  </div>
  <div class="dl">
    <span style="color:#059669">${((stats.normal/stats.total)*100).toFixed(0)}% Normal</span>
    <span style="color:#d97706">${((stats.warning/stats.total)*100).toFixed(0)}% Warning</span>
    <span style="color:#dc2626">${((stats.critical/stats.total)*100).toFixed(0)}% Critical</span>
  </div>
</div>
<div class="rp">
  <div class="sh"><h2>Individual Test Results</h2><span class="stag">${stats.total} records</span></div>
  ${rows}
</div>
<div class="footer">
  <p>Generated by <span>Clinova Intelligence Platform</span></p>
  <p>All AI interpretations must be reviewed by a licensed clinician before clinical action.</p>
</div>
<script>window.onload=()=>setTimeout(()=>window.print(),600)</script>
</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  const stats = useMemo(() => {
    if (!results.length) return null;
    return {
      total: results.length,
      normal: results.filter(r => r.Severity === 'Normal').length,
      warning: results.filter(r => r.Severity === 'Warning').length,
      critical: results.filter(r => r.Severity === 'Critical').length,
    };
  }, [results]);

  const hasResults = results.length > 0 && !isLoading;

  return (
    <div className="app-shell" data-has-results={hasResults}>

      {/* ══ HEADER ══ */}
      <header className="app-header no-print">
        <div className="hdr-brand">
          <div className="hdr-logomark">
            <Activity size={20} />
          </div>
          <div className="hdr-brand-text">
            <h1>CLINOVA</h1>
            <p>Pharmaceutical &amp; Clinical Intelligence</p>
          </div>
        </div>

        <nav className="hdr-status-bar">
          <div className="status-chip online"><span className="chip-dot"></span>System Online</div>
          <div className="status-chip ai"><Cpu size={12} />AI Engine Active</div>
          <div className="status-chip mcp"><Server size={12} />MCP Connected</div>
        </nav>

        <div className="hdr-actions">
          {hasResults && (
            <button className="btn-export" onClick={handleExport}>
              <Download size={15} /> Export Report
            </button>
          )}
          <button className="btn-theme" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div className="app-body">
        {isLoading ? (
          <AnalysisPipeline step={flowStep} />
        ) : hasResults ? (
          <AnalysisWorkspace
            results={results}
            stats={stats}
            selectedIdx={selectedIdx}
            setSelectedIdx={setSelectedIdx}
            filterSev={filterSev}
            setFilterSev={setFilterSev}
            searchQ={searchQ}
            setSearchQ={setSearchQ}
          />
        ) : (
          <PharmaHero onAnalyze={handleAnalyze} isLoading={isLoading} error={error} />
        )}
      </div>
    </div>
  );
}

/* ── Analysis Pipeline Overlay ── */
function AnalysisPipeline({ step }) {
  const steps = [
    { id:'specimen',  label:'Specimen Received',       icon:'🧪' },
    { id:'validate',  label:'Reference Validation',    icon:'📋' },
    { id:'classify',  label:'Severity Classification', icon:'⚡' },
    { id:'mcp',       label:'MCP Tool Invoked',        icon:'🔗' },
    { id:'ai',        label:'AI Interpretation',       icon:'🧠' },
    { id:'complete',  label:'Report Generated',        icon:'✅' },
  ];
  return (
    <div className="pipeline-overlay anim-fade-in">
      <div className="pipeline-glow"></div>
      <div className="pipeline-inner">
        <div className="pipeline-header">
          <div className="pipeline-pulse"></div>
          <h2>Analysis In Progress</h2>
          <p>Processing specimen data through clinical intelligence pipeline</p>
        </div>
        <div className="pipeline-steps">
          {steps.map((s, i) => (
            <div key={s.id} className={`ps-item ${i === step ? 'active' : i < step ? 'done' : 'pending'}`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="ps-node">
                <div className="ps-circle">{i < step ? <CheckCircle size={16} /> : s.icon}</div>
                {i < steps.length - 1 && <div className="ps-connector"></div>}
              </div>
              <div className="ps-info">
                <span className="ps-label">{s.label}</span>
                {i === step && <span className="ps-running">Running…</span>}
                {i < step && <span className="ps-done">Complete</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Analysis Workspace (post-load) ── */
function AnalysisWorkspace({ results, stats, selectedIdx, setSelectedIdx, filterSev, setFilterSev, searchQ, setSearchQ }) {
  const filtered = results.filter(r => {
    const ms = filterSev === 'All' || r.Severity === filterSev;
    const mq = r.Test_Name.toLowerCase().includes(searchQ.toLowerCase());
    return ms && mq;
  });

  const abnPct = stats ? (((stats.warning + stats.critical) / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="workspace anim-fade-in">
      {/* Lab Status Bar */}
      <div className="lab-status-bar">
        <div className="lsb-label">
          <div className="lsb-dot"></div>
          LAB STATUS — ANALYSIS COMPLETE
        </div>
        <div className="lsb-stats">
          <div className="lsb-stat">
            <span className="lsb-num">{stats.total}</span>
            <span className="lsb-key">Total Tests</span>
          </div>
          <div className="lsb-divider"></div>
          <div className="lsb-stat normal">
            <span className="lsb-num">{stats.normal}</span>
            <span className="lsb-key">Normal</span>
          </div>
          <div className="lsb-divider"></div>
          <div className="lsb-stat warning">
            <span className="lsb-num">{stats.warning}</span>
            <span className="lsb-key">Warning</span>
          </div>
          <div className="lsb-divider"></div>
          <div className="lsb-stat critical">
            <span className="lsb-num">{stats.critical}</span>
            <span className="lsb-key">Critical</span>
          </div>
          <div className="lsb-divider"></div>
          <div className="lsb-stat">
            <span className="lsb-num abnorm">{abnPct}%</span>
            <span className="lsb-key">Abnormal Rate</span>
          </div>
        </div>
        <div className="lsb-bar">
          {stats.normal > 0   && <div className="lsb-seg normal"   style={{flex: stats.normal}}></div>}
          {stats.warning > 0  && <div className="lsb-seg warning"  style={{flex: stats.warning}}></div>}
          {stats.critical > 0 && <div className="lsb-seg critical" style={{flex: stats.critical}}></div>}
        </div>
      </div>

      {/* Split panel */}
      <div className="workspace-split">
        {/* Left: Result List */}
        <aside className="result-panel">
          <div className="rp-toolbar">
            <input className="rp-search" type="text" placeholder="🔍  Search tests…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            <select className="rp-filter" value={filterSev} onChange={e => setFilterSev(e.target.value)}>
              <option value="All">All</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
          <div className="rp-list">
            {filtered.map((res) => {
              const idx = results.indexOf(res);
              return (
                <div
                  key={idx}
                  className={`rp-item sev-${res.Severity.toLowerCase()} ${selectedIdx === idx ? 'selected' : ''}`}
                  onClick={() => setSelectedIdx(idx)}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className={`rp-sev-bar sev-bar-${res.Severity.toLowerCase()}`}></div>
                  <div className="rp-content">
                    <div className="rp-name">{res.Test_Name}</div>
                    <div className="rp-meta">
                      <span className="rp-val">{res.Result} {res.Unit}</span>
                      <span className={`rp-badge sev-badge-${res.Severity.toLowerCase()}`}>{res.Severity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="rp-empty">No tests match your filters.</div>
            )}
          </div>
          <div className="rp-footer">
            <span>{filtered.length} of {results.length} tests shown</span>
            <span>↑↓ to navigate · ESC overview</span>
          </div>
        </aside>

        {/* Right: Detail Canvas */}
        <main className="detail-canvas">
          <ResultsDisplay results={results} selectedIndex={selectedIdx} onSelectIndex={setSelectedIdx} />
        </main>
      </div>
    </div>
  );
}
