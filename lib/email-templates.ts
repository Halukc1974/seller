// ─── Purchase Confirmation Email ──────────────────────────────────────────────

interface PurchaseConfirmationOptions {
  productTitle: string;
  amount: number;
  currency: string;
  downloadUrl: string;
  licenseKey?: string;
}

export function purchaseConfirmationSubject(productTitle: string): string {
  return `Your purchase of "${productTitle}" is confirmed`;
}

export function purchaseConfirmationEmail({
  productTitle,
  amount,
  currency,
  downloadUrl,
  licenseKey,
}: PurchaseConfirmationOptions): string {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);

  const licenseSection = licenseKey
    ? `
    <tr>
      <td style="padding: 0 40px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#1e40af;text-transform:uppercase;letter-spacing:0.05em;">License Key</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:#1e3a8a;font-family:monospace;letter-spacing:0.1em;">${licenseKey}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#3b82f6;">Keep this key safe — you may need it to activate your software.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Purchase Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#bfdbfe;text-transform:uppercase;letter-spacing:0.1em;">Order Confirmed</p>
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;">Thank you for your purchase!</h1>
            </td>
          </tr>

          <!-- Product summary -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Product</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">${productTitle}</p>
                  </td>
                  <td style="padding:20px 24px;text-align:right;white-space:nowrap;">
                    <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Amount Paid</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#2563eb;">${formattedAmount}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${licenseSection}

          <!-- Download CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0 0 20px;font-size:15px;color:#475569;">Your file is ready to download. Click the button below to get started.</p>
              <a href="${downloadUrl}"
                 style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.01em;">
                Download Now
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">You can also access all your purchases at any time from your</p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://onedollarsell.com"}/dashboard/downloads"
                 style="font-size:13px;color:#2563eb;text-decoration:none;font-weight:600;">
                Downloads Dashboard
              </a>
              <p style="margin:20px 0 0;font-size:12px;color:#cbd5e1;">&copy; ${new Date().getFullYear()} OneDollarSell. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Download Link Email ───────────────────────────────────────────────────────

interface DownloadLinkOptions {
  productTitle: string;
  downloadUrl: string;
  expiresIn: string;
}

export function downloadLinkSubject(productTitle: string): string {
  return `Your download link for "${productTitle}"`;
}

export function downloadLinkEmail({
  productTitle,
  downloadUrl,
  expiresIn,
}: DownloadLinkOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Download is Ready</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#bfdbfe;text-transform:uppercase;letter-spacing:0.1em;">Download Ready</p>
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;">Your file is ready!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:17px;color:#0f172a;font-weight:600;">${productTitle}</p>
              <p style="margin:0 0 32px;font-size:15px;color:#475569;">
                Click the button below to download your file.<br />
                This link expires in <strong style="color:#0f172a;">${expiresIn}</strong>.
              </p>
              <a href="${downloadUrl}"
                 style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.01em;">
                Download File
              </a>
            </td>
          </tr>

          <!-- Expiry note -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 20px;">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0;font-size:13px;color:#92400e;">
                      If the link expires, you can generate a fresh download link from your
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://onedollarsell.com"}/dashboard/downloads"
                         style="color:#b45309;font-weight:600;text-decoration:none;">Downloads Dashboard</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#cbd5e1;">&copy; ${new Date().getFullYear()} OneDollarSell. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
