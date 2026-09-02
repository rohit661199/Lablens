import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Keyboard, FlaskConical } from 'lucide-react';
import './LabInput.css';

export default function LabInput({ onAnalyze, isLoading, defaultTab }) {
  const [tab, setTab] = useState(defaultTab === 'manual' ? 'manual' : 'csv');
  const [testName, setTestName] = useState('');
  const [result, setResult]     = useState('');
  const [unit, setUnit]         = useState('');
  const [refRange, setRefRange] = useState('');
  const [dragging, setDragging] = useState(false);

  const parseFile = (file) => {
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: ({ data }) => {
        const cleaned = data.map(row => {
          const r = { ...row };
          if (r.Min_Reference === '') r.Min_Reference = null;
          if (r.Max_Reference === '') r.Max_Reference = null;
          if (r.Min_Reference != null) r.Min_Reference = parseFloat(r.Min_Reference) || null;
          if (r.Max_Reference != null) r.Max_Reference = parseFloat(r.Max_Reference) || null;
          return r;
        });
        onAnalyze(cleaned);
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!testName || !result) return;
    let minRef = null, maxRef = null;
    if (refRange?.includes('-')) {
      const [a, b] = refRange.split('-');
      minRef = parseFloat(a);
      maxRef = parseFloat(b);
    }
    onAnalyze([{ Test_Name: testName, Result: result, Unit: unit, Reference_Range: refRange,
      Min_Reference: isNaN(minRef) ? null : minRef, Max_Reference: isNaN(maxRef) ? null : maxRef }]);
  };

  return (
    <div className="lab-input-wrap">
      <div className="li-tabs">
        <button className={`li-tab ${tab === 'csv' ? 'active' : ''}`} onClick={() => setTab('csv')}>
          <Upload size={14} /> CSV Upload
        </button>
        <button className={`li-tab ${tab === 'manual' ? 'active' : ''}`} onClick={() => setTab('manual')}>
          <Keyboard size={14} /> Manual Entry
        </button>
      </div>

      {tab === 'csv' ? (
        <label
          className={`li-dropzone ${dragging ? 'dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if(f) parseFile(f); }}
        >
          <div className="dz-icon-wrap">
            <Upload size={28} className="dz-icon" />
          </div>
          <p className="dz-title">Drop CSV Lab Report Here</p>
          <p className="dz-sub">or click to browse · CSV format</p>
          <p className="dz-hint">Headers: Test_Name, Result, Unit, Reference_Range</p>
          <input type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if(f) parseFile(f); }} disabled={isLoading} hidden />
        </label>
      ) : (
        <form className="li-form" onSubmit={handleFormSubmit}>
          <div className="li-field">
            <label>Test Name <span className="req">*</span></label>
            <input value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g. Hemoglobin" required disabled={isLoading} />
          </div>
          <div className="li-row">
            <div className="li-field">
              <label>Result <span className="req">*</span></label>
              <input value={result} onChange={e => setResult(e.target.value)} placeholder="6.5" required disabled={isLoading} />
            </div>
            <div className="li-field">
              <label>Unit</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="g/dL" disabled={isLoading} />
            </div>
          </div>
          <div className="li-field">
            <label>Reference Range</label>
            <input value={refRange} onChange={e => setRefRange(e.target.value)} placeholder="12–16" disabled={isLoading} />
          </div>
          <button type="submit" className="li-submit" disabled={isLoading || !testName || !result}>
            <FlaskConical size={16} /> {isLoading ? 'Analyzing…' : 'Run Analysis'}
          </button>
        </form>
      )}
    </div>
  );
}
