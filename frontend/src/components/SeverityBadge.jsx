import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import './SeverityBadge.css';

export default function SeverityBadge({ severity, customText }) {
  const Icon = severity === 'Critical' ? AlertOctagon : severity === 'Warning' ? AlertTriangle : CheckCircle2;
  const cls  = `sev-badge sev-badge-${severity.toLowerCase()}`;
  return (
    <div className={cls}>
      <Icon size={13} />
      <span>{customText || severity.toUpperCase()}</span>
    </div>
  );
}
