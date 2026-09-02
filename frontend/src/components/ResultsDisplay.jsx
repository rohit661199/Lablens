import React from 'react';
import SeverityBadge from './SeverityBadge';
import { Stethoscope, ChevronRight, Beaker, Pill, LayoutGrid } from 'lucide-react';
import './ResultsDisplay.css';

const isDrug = (name, val) => {
  const n = name.toLowerCase(), v = val.toLowerCase();
  return n.includes('screen')||n.includes('tox')||n.includes('drug')||
         n.includes('thc')||n.includes('cocaine')||n.includes('opiate')||
         v.includes('detected')||v.includes('positive');
};

const toxLabel = (sev) => (sev==='Critical'||sev==='Warning') ? 'PRESUMPTIVE POSITIVE' : 'PRESUMPTIVE NEGATIVE';

export default function ResultsDisplay({ results, selectedIndex, onSelectIndex }) {

  /* ── Empty ── */
  if (!results || results.length === 0) {
    return (
      <div className="rd-empty anim-fade-in">
        <div className="rde-ring">
          <Beaker size={36} className="rde-icon" />
        </div>
        <h3>Select a Specimen</h3>
        <p>Click any test in the results panel to view its full diagnostic analysis.</p>
      </div>
    );
  }

  /* ── Overview ── */
  if (selectedIndex === null) {
    const primary = results.find(r=>r.Severity==='Critical') || results.find(r=>r.Severity==='Warning');
    const abnTests = results.filter(r=>r.Severity!=='Normal').map(r=>r.Test_Name);

    return (
      <div className="rd-overview anim-fade-up">
        <div className="rdo-header">
          <LayoutGrid size={22} className="rdo-icon" />
          <div>
            <h2>Analysis Overview</h2>
            <p>Select any specimen from the panel to view its full diagnostic report</p>
          </div>
        </div>

        {primary && (
          <div className={`rdo-alert sev-alert-${primary.Severity.toLowerCase()}`}>
            <div className="rda-label">Primary Clinical Concern</div>
            <div className="rda-name">{primary.Test_Name}</div>
            <div className="rda-val">{primary.Result} {primary.Unit}</div>
            <SeverityBadge severity={primary.Severity} />
          </div>
        )}

        {abnTests.length > 0 && (
          <div className="rdo-abn-list">
            <p className="rdo-section-title">Tests Requiring Attention</p>
            <div className="rdo-abn-chips">
              {abnTests.map((t, i) => {
                const r = results.find(x => x.Test_Name === t);
                return (
                  <span key={i} className={`abn-chip sev-chip-${r.Severity.toLowerCase()}`} onClick={() => onSelectIndex(results.indexOf(r))}>
                    {t}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="rdo-hint">↑↓ keyboard navigation · Click test for full diagnosis →</div>
      </div>
    );
  }

  /* ── Detail ── */
  const res = results[selectedIndex];
  const drug = isDrug(res.Test_Name, res.Result);
  const customLabel = drug ? toxLabel(res.Severity) : null;

  const renderGauge = () => {
    if (drug) return null;
    const val = parseFloat(res.Result);
    if (isNaN(val) || !res.Reference_Range?.includes('-')) return null;
    const [a, b] = res.Reference_Range.split('-');
    const min = parseFloat(a), max = parseFloat(b);
    if (isNaN(min)||isNaN(max)||max<=min) return null;

    const span = max - min, pad = span * 0.5;
    const sMin = min-pad, sMax = max+pad, sSpan = sMax-sMin;
    const minPct = ((min-sMin)/sSpan)*100;
    const maxPct = ((max-sMin)/sSpan)*100;
    let mPct = ((val-sMin)/sSpan)*100;
    mPct = Math.max(1, Math.min(99, mPct));
    const inRange = val >= min && val <= max;

    return (
      <div className="gauge-wrap">
        <p className="gauge-title">REFERENCE RANGE INDICATOR</p>
        <div className="gauge-track">
          <div className="gz gz-low"  style={{width:`${minPct}%`}}></div>
          <div className="gz gz-norm" style={{width:`${maxPct-minPct}%`}}></div>
          <div className="gz gz-high" style={{width:`${100-maxPct}%`}}></div>

          <div className="gauge-tick" style={{left:`${minPct}%`}}>
            <div className="gt-line"></div>
            <span>{min}</span>
          </div>
          <div className="gauge-tick" style={{left:`${maxPct}%`}}>
            <div className="gt-line"></div>
            <span>{max}</span>
          </div>

          <div className={`gauge-marker ${inRange?'in':'out'}`} style={{left:`${mPct}%`}}>
            <div className="gm-needle"></div>
            <div className="gm-tag">{val}</div>
          </div>
        </div>
        <div className="gauge-legend">
          <span className="gl-low">LOW</span>
          <span className="gl-norm">NORMAL RANGE</span>
          <span className="gl-high">HIGH</span>
        </div>
        <div className={`gauge-verdict ${inRange?'in':'out'}`}>
          {inRange ? '✓ Within reference range' : val < min ? '↓ Below reference range' : '↑ Above reference range'}
        </div>
      </div>
    );
  };

  return (
    <div className="rd-detail anim-scale-in" key={selectedIndex}>

      {/* Hero band */}
      <div className={`rd-hero-band sev-band-${res.Severity.toLowerCase()}`}>
        <div className="rdhb-left">
          <div className="rdhb-icon">{drug ? <Pill size={18}/> : <Beaker size={18}/>}</div>
          <div>
            <p className="rdhb-type">{drug ? 'TOXICOLOGY / DRUG SCREEN' : 'LABORATORY ANALYTE'}</p>
            <h2 className="rdhb-name">{res.Test_Name}</h2>
          </div>
        </div>
        <div className="rdhb-right">
          <SeverityBadge severity={res.Severity} customText={customLabel} />
          {drug && <span className="tox-pill">TOX MODE</span>}
        </div>
      </div>

      <div className="rd-body">
        {/* Metrics row */}
        <div className="rd-metrics">
          <div className="rdm-card rdm-primary">
            <span className="rdm-label">MEASURED VALUE</span>
            <div className="rdm-val-row">
              <span className={`rdm-val sev-val-${res.Severity.toLowerCase()}`}>{res.Result}</span>
              {res.Unit && <span className="rdm-unit">{res.Unit}</span>}
            </div>
          </div>
          <div className="rdm-card">
            <span className="rdm-label">{drug ? 'CUTOFF / REFERENCE' : 'REFERENCE RANGE'}</span>
            <span className="rdm-val2">{res.Reference_Range || 'N/A'}</span>
          </div>
          <div className="rdm-card">
            <span className="rdm-label">SEVERITY CLASS</span>
            <span className={`rdm-val2 sev-val-${res.Severity.toLowerCase()}`}>{res.Severity.toUpperCase()}</span>
          </div>
        </div>

        {/* Gauge */}
        {renderGauge()}

        {/* Drug chain */}
        {drug && (
          <div className="tox-block">
            <p className="tox-block-title">CHAIN-OF-ANALYSIS RECORD</p>
            <div className="tox-grid">
              <div className="tc"><span className="tc-k">Specimen</span><span className="tc-v">Drug Screen</span></div>
              <div className="tc"><span className="tc-k">Result</span><span className={`tc-v ${res.Severity==='Normal'?'tc-neg':'tc-pos'}`}>{res.Result}</span></div>
              <div className="tc"><span className="tc-k">Cutoff/Ref</span><span className="tc-v">{res.Reference_Range||'N/A'}</span></div>
              <div className="tc"><span className="tc-k">Screening Status</span><span className={`tc-v ${res.Severity==='Normal'?'tc-neg':'tc-pos'}`}>{toxLabel(res.Severity)}</span></div>
              {(res.Severity==='Critical'||res.Severity==='Warning') && (
                <div className="tc tc-full">
                  <div className="tc-confirm">
                    <span className="tc-conf-badge">!</span>
                    <span>Confirmation testing required — Recommend GC/MS or LC/MS analysis before final reporting of presumptive positive results.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Intelligence panel */}
        <div className="intel-panel">
          <div className="ip-hdr">
            <div className="ip-hdr-l">
              <Stethoscope size={16} className="ip-icon" />
              <span>CLINOVA INTELLIGENCE — ANALYSIS ENGINE</span>
            </div>
            <span className="ip-badge">INTERPRETATION COMPLETE</span>
          </div>
          <div className="ip-body">
            <div className="ip-sec">
              <h4>Clinical Interpretation</h4>
              <p>{res.Explanation}</p>
            </div>
            <div className="ip-divider"></div>
            <div className="ip-sec">
              <h4>Recommended Clinical Action</h4>
              <div className="ip-action">
                <ChevronRight size={16} className="ip-action-icon" />
                <p>{res.Suggested_Next_Steps}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="rd-nav no-print">
          <button className="rd-nav-btn" disabled={selectedIndex===0} onClick={() => onSelectIndex(selectedIndex-1)}>← Previous</button>
          <span className="rd-nav-pos">{selectedIndex+1} / {results.length}</span>
          <button className="rd-nav-btn" disabled={selectedIndex===results.length-1} onClick={() => onSelectIndex(selectedIndex+1)}>Next →</button>
        </div>
      </div>
    </div>
  );
}
