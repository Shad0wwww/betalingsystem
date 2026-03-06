export function generateHtmlOTP(code: string, dict?: any) {
    const t = dict?.email?.otp;
    const title = t?.title ?? "Din Engangskode";
    const subtitle = t?.subtitle ?? "Indtast denne kode for at logge ind";
    const validFor = t?.validFor ?? "Koden er gyldig i 10 minutter";
    const warning = t?.warning ?? "Del aldrig denne kode med andre \u2013 heller ikke med os!";

    const digitHtml = code.split('').map(d =>
        `<span style="display:inline-block;width:52px;height:64px;line-height:64px;text-align:center;font-size:36px;font-weight:700;font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;background:#1a1a1a;border:1px solid #292828;border-radius:10px;color:#ffffff;margin:0 4px;">${d.toUpperCase()}</span>`
    ).join('');

    return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#111111;border:1px solid #292828;border-radius:12px;overflow:hidden;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #292828;">
              <span style="color:#ffffff;font-size:17px;font-weight:600;letter-spacing:-0.3px;">Ribe Sejlklub</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;text-align:center;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:600;margin:0 0 8px 0;letter-spacing:-0.3px;">${title}</h1>
              <p style="color:#a1a1aa;font-size:15px;margin:0 0 36px 0;">${subtitle}</p>

              <div style="margin-bottom:36px;">
                ${digitHtml}
              </div>

              <p style="color:#a1a1aa;font-size:14px;margin:0 0 8px 0;">${validFor}</p>
              <p style="color:#ef4444;font-size:13px;margin:0;">${warning}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #292828;text-align:center;">
              <p style="color:#52525b;font-size:12px;margin:0;line-height:1.5;">
                Ribe Sejlklub &middot; Erik Menvedsvej 20, 6760 Ribe &middot; CVR: 74852513 &middot; support@pins.dk
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