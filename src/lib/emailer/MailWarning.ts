export function generateWarningEmailContent(
    adminName: string,
    message: string,
) {
    const formattedMessage = message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#3b82f6;text-decoration:underline;">$1</a>')
        .replace(/\n/g, '<br/>');

    return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Advarsel fra administrator</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#111111;border:1px solid #292828;border-radius:12px;overflow:hidden;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #292828;">
              <span style="color:#ffffff;font-size:17px;font-weight:600;letter-spacing:-0.3px;">Ribe Sejlklub</span>
            </td>
          </tr>

          <!-- Warning badge -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="margin-bottom:20px;">
                <span style="display:inline-block;padding:5px 14px;border-radius:9999px;background:rgba(244,114,71,0.08);border:1px solid rgba(244,114,71,0.28);color:#fca5a5;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
                  ⚠️ Advarsel fra administrator
                </span>
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:0 32px 16px 32px;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:600;margin:0;letter-spacing:-0.3px;">Du har modtaget en advarsel</h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><div style="height:1px;background:#292828;"></div></td></tr>

          <!-- Body content -->
          <tr>
            <td style="padding:24px 32px;">
              <div style="color:#e4e4e7;font-size:15px;line-height:1.7;">
                ${formattedMessage}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><div style="height:1px;background:#292828;"></div></td></tr>

          <!-- Admin info -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="color:#71717a;font-size:12px;margin:0;line-height:1.6;">
                Denne advarsel blev sendt af <strong>${adminName}</strong> på vegne af Ribe Sejlklub administration.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><div style="height:1px;background:#292828;"></div></td></tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="color:#71717a;font-size:12px;margin:0 0 8px 0;line-height:1.6;">
                Du modtager denne mail, fordi du har en konto hos Ribe Sejlklub.
              </p>
              <p style="color:#52525b;font-size:11px;margin:0;line-height:1.6;">
                Hvis du mener, at dette er en fejl, kan du kontakte os på support@pins.dk.
              </p>
            </td>
          </tr>

          <!-- Company footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #292828;text-align:center;">
              <p style="color:#52525b;font-size:12px;margin:0;">
                Ribe Sejlklub &middot; Erik Menvedsvej 20, 6760 Ribe &middot; CVR: 74852513
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
