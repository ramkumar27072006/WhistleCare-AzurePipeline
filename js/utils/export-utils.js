/* ============================================================
   HEALTHPULSE EXPORT UTILITIES
   PDF (via print), PNG, CSV, JSON export functions
   ============================================================ */

/**
 * Export the clinical report section as PDF via browser print.
 */
export function exportReportPDF() {
  const reportEl = document.getElementById('clinical-report-content');
  if (!reportEl) return;

  // Create a print-specific window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HealthPulse Clinical Report</title>
      <style>
        body { font-family: 'Inter', 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; line-height: 1.6; }
        h1 { font-size: 22px; color: #0a2540; border-bottom: 2px solid #00d4aa; padding-bottom: 8px; }
        h2 { font-size: 16px; color: #0a2540; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
        th { background: #f3f4f6; text-align: left; padding: 8px; border: 1px solid #ddd; font-weight: 600; }
        td { padding: 8px; border: 1px solid #ddd; }
        .risk-high { color: #dc2626; font-weight: 600; }
        .risk-moderate { color: #d97706; font-weight: 600; }
        .risk-low { color: #059669; font-weight: 600; }
        .disclaimer { font-size: 11px; color: #888; margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; }
        .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; color: #555; }
        ul { margin: 8px 0; padding-left: 20px; }
        li { margin-bottom: 4px; font-size: 13px; }
        .alert-item { padding: 8px 12px; border-left: 3px solid; margin-bottom: 8px; font-size: 13px; }
        .alert-critical { border-left-color: #dc2626; background: #fef2f2; }
        .alert-warning { border-left-color: #d97706; background: #fffbeb; }
        .alert-monitor { border-left-color: #3b82f6; background: #eff6ff; }
      </style>
    </head>
    <body>${reportEl.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 500);
}

/**
 * Export a canvas element as PNG.
 */
export function exportCanvasPNG(canvasId, filename = 'chart.png') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Export data as CSV.
 */
export function exportCSV(data, filename = 'data.csv') {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h];
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return val;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export data as JSON.
 */
export function exportJSON(data, filename = 'data.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
