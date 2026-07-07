export interface EnquiryNotificationData {
  fullName: string;
  mobileNumber: string;
  city?: string;
  categoryName?: string;
  message?: string;
  source: string;
  submittedAt: Date;
}

export function buildEnquiryNotificationEmail(data: EnquiryNotificationData): {
  subject: string;
  html: string;
} {
  const rows: Array<[string, string]> = [
    ['Name', escapeHtml(data.fullName)],
    ['Mobile', escapeHtml(data.mobileNumber)],
    ['City', data.city ? escapeHtml(data.city) : '—'],
    [
      'Interested Category',
      data.categoryName ? escapeHtml(data.categoryName) : '—',
    ],
    ['Source', escapeHtml(data.source)],
    [
      'Submitted',
      data.submittedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    ],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#5c4433;border-bottom:1px solid #eee;white-space:nowrap;">${label}</td>
          <td style="padding:8px 12px;color:#333;border-bottom:1px solid #eee;">${value}</td>
        </tr>`,
    )
    .join('');

  const messageHtml = data.message
    ? `<p style="margin-top:16px;padding:12px;background:#faf6f1;border-radius:6px;color:#333;">${escapeHtml(
        data.message,
      )}</p>`
    : '';

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#5c4433;">New Enquiry — WOODIVO</h2>
      <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
      ${messageHtml}
    </div>
  `;

  return {
    subject: `New Enquiry from ${data.fullName}`,
    html,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
