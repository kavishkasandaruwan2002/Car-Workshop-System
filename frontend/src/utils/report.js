// Lightweight HTML report generator that uses the browser's print dialog to save as PDF
// Usage: const html = buildReportHTML({ title, columns, rows }); openPrint(html, filename)

export function buildReportHTML({ title, subtitle = '', generatedAt = new Date(), columns = [], rows = [] }) {
  const styles = `
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; padding: 24px; color: #111827; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      h2 { font-size: 14px; margin: 0 0 16px; color: #6B7280; }
      .meta { font-size: 12px; color: #6B7280; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
      th { background: #F3F4F6; font-weight: 600; }
      tr:nth-child(even) td { background: #FAFAFA; }
      .footer { margin-top: 16px; font-size: 11px; color: #6B7280; }
    </style>
  `;
  const header = `
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<h2>${escapeHtml(subtitle)}</h2>` : ''}
    <div class="meta">Generated at ${new Date(generatedAt).toLocaleString()}</div>
  `;
  const thead = `<tr>${columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr>`;
  const tbody = rows.map(r => `<tr>${r.map(v => `<td>${escapeHtml(String(v ?? ''))}</td>`).join('')}</tr>`).join('');
  const table = `<table>${thead}${tbody}</table>`;
  const footer = `<div class="footer">PUEFix Garage • Reports</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"/>${styles}</head><body>${header}${table}${footer}</body></html>`;
}

export function openPrint(html, filename = 'report.pdf') {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.open();
  // Set document title for better default PDF filename in some browsers
  w.document.write(html.replace('<head>', `<head><title>${escapeHtml(filename)}</title>`));
  w.document.close();
  w.focus();
  // Give the browser a tick to render before printing
  setTimeout(() => { w.print(); }, 300);
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
