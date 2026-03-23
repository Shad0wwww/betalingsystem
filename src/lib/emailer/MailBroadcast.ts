export function generateBroadcastEmailContent(
	subject: string,
	body: string,
	dict?: any
) {
	const t = dict?.email?.broadcast;
	const badge = t?.badge ?? "Vigtig meddelelse";
	const footerText = t?.footer ?? "Du modtager denne mail, fordi du har en konto hos Ribe Sejlklub.";
	const unsubscribeNote = t?.unsubscribeNote ?? "For at afmelde dig fra fremtidige meddelelser, kan du kontakte os på support@pins.dk.";

	// Konverter newlines til <br> tags og escape HTML
	const formattedBody = body
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\n/g, '<br/>');

	return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
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

          <!-- Blue accent badge -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="margin-bottom:20px;">
                <span style="display:inline-block;padding:5px 14px;border-radius:9999px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.28);color:#93c5fd;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
                  &#128226; ${badge}
                </span>
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:0 32px 16px 32px;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:600;margin:0;letter-spacing:-0.3px;">${subject}</h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><div style="height:1px;background:#292828;"></div></td></tr>

          <!-- Body content -->
          <tr>
            <td style="padding:24px 32px;">
              <div style="color:#e4e4e7;font-size:15px;line-height:1.7;">
                ${formattedBody}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><div style="height:1px;background:#292828;"></div></td></tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="color:#71717a;font-size:12px;margin:0 0 8px 0;line-height:1.6;">
                ${footerText}
              </p>
              <p style="color:#52525b;font-size:11px;margin:0;line-height:1.6;">
                ${unsubscribeNote}
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
