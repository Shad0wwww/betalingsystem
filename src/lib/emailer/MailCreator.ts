export function generateHtmlOTP(code: string, dict?: any) {
	const t = dict?.email?.otp;
	const title = t?.title ?? "Din Engangskode";
	const subtitle = t?.subtitle ?? "Indtast denne kode for at logge ind";
	const validFor = t?.validFor ?? "Koden er gyldig i 10 minutter";
	const warning = t?.warning ?? "Del aldrig denne kode med andre – heller ikke med os!";

	const digitHtml = code.split('').map(d =>
		`<span style="display:inline-block;width:52px;height:64px;line-height:64px;text-align:center;font-size:34px;font-weight:700;font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;background:linear-gradient(135deg,#1a1f2e,#141820);border:1px solid rgba(59,130,246,0.25);border-radius:10px;color:#ffffff;margin:0 4px;box-shadow:0 0 14px rgba(59,130,246,0.12);">${d.toUpperCase()}</span>`
	).join('');

	return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">

          <!-- Logo / Brand bar -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.4px;">
                <span style="color:#3b82f6;">&#9875;</span>&nbsp; Ribe Sejlklub
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(160deg,#141820 0%,#0f1318 100%);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;box-shadow:0 0 60px rgba(59,130,246,0.07);">

              <!-- Blue top accent line -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:2px;background:linear-gradient(90deg,transparent 0%,#3b82f6 50%,transparent 100%);"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 36px;text-align:center;">

                    <!-- Badge pill -->
                    <div style="display:inline-block;margin-bottom:24px;">
                      <span style="display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:9999px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.28);color:#93c5fd;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
                        &#128274;&nbsp; Sikker login
                      </span>
                    </div>

                    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px 0;letter-spacing:-0.4px;">${title}</h1>
                    <p style="color:#71717a;font-size:14px;margin:0 0 36px 0;line-height:1.6;">${subtitle}</p>

                    <!-- OTP digits -->
                    <div style="margin-bottom:36px;letter-spacing:0;">
                      ${digitHtml}
                    </div>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="height:1px;background:rgba(255,255,255,0.06);"></td>
                      </tr>
                    </table>

                    <p style="color:#71717a;font-size:13px;margin:0 0 10px 0;">${validFor}</p>
                    <p style="color:#f87171;font-size:12px;margin:0;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.18);border-radius:8px;padding:10px 16px;display:inline-block;">${warning}</p>

                  </td>
                </tr>
              </table>

              <!-- Footer inside card -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:18px 36px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                    <p style="color:#3f3f46;font-size:11px;margin:0;line-height:1.6;">
                      Ribe Sejlklub &middot; Erik Menvedsvej 20, 6760 Ribe &middot; CVR: 74852513<br/>
                      <a href="mailto:support@pins.dk" style="color:#3b82f6;text-decoration:none;">support@pins.dk</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Bottom note -->
          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="color:#3f3f46;font-size:11px;margin:0;">
                Modtog du denne mail ved en fejl? Du kan ignorere den.
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