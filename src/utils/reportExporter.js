/**
 * Helper utility for exporting report data to CSV and formatted printable HTML/PDF views.
 */

/**
 * Download tabular data as a CSV file.
 * @param {string} filename - Desired output filename (e.g. sales_report_2026-08-01.csv)
 * @param {string[]} headers - Header titles array
 * @param {Array<Array<string|number>>} rows - 2D array of row cells
 */
export function exportToCSV(filename, headers, rows) {
  const sanitizeCell = (cell) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(sanitizeCell).join(',');
  const rowLines = rows.map(row => row.map(sanitizeCell).join(','));
  const csvContent = [headerLine, ...rowLines].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open a printer-friendly layout in a popup window for saving as PDF or printing.
 */
export function printReportWindow({ title, dateRangeText, kpis = [], headers = [], rows = [] }) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  const kpisHtml = kpis.map(kpi => `
    <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: #fafafa;">
      <div style="font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px;">${kpi.label}</div>
      <div style="font-size: 22px; font-weight: bold; color: #111827; margin-top: 4px;">${kpi.value}</div>
      ${kpi.subtext ? `<div style="font-size: 11px; color: #059669; margin-top: 2px;">${kpi.subtext}</div>` : ''}
    </div>
  `).join('');

  const headersHtml = headers.map(h => `
    <th style="padding: 10px 12px; text-align: left; background: #1e1e24; color: #ffffff; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #374151;">${h}</th>
  `).join('');

  const rowsHtml = rows.map((row, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'}; border-bottom: 1px solid #e5e7eb;">
      ${row.map(cell => `<td style="padding: 10px 12px; font-size: 13px; color: #374151;">${cell ?? '-'}</td>`).join('')}
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${dateRangeText}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; margin: 30px; color: #1f2937; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: bold; font-family: serif; letter-spacing: 2px; }
          .brand span { color: #c5a880; font-style: italic; font-weight: 300; }
          .report-title { font-size: 18px; font-weight: 600; color: #111827; }
          .date-range { font-size: 13px; color: #6b7280; margin-top: 4px; }
          .kpi-container { display: flex; gap: 16px; margin-bottom: 28px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          @media print {
            body { margin: 10mm; }
            .kpi-container { gap: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">AURA <span>Admin</span></div>
            <div class="date-range">Generated: ${new Date().toLocaleString()}</div>
          </div>
          <div style="text-align: right;">
            <div class="report-title">${title}</div>
            <div class="date-range">Period: ${dateRangeText}</div>
          </div>
        </div>

        ${kpis.length > 0 ? `<div class="kpi-container">${kpisHtml}</div>` : ''}

        <table>
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <div class="footer">
          AURA Store Confidential Business Intelligence Report &bull; Page 1 of 1
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
