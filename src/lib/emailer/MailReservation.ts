export async function generateReservationEmailContent(
    amount: number,
    type: string,
    email: string,
    date: Date = new Date(),
    ReservationNumber: string,
    dict?: any,
) {
    const t = dict?.email?.reservation;
    const title = t?.title ?? "Reservationsbek\u00e6ftelse";
    const intro = t?.intro ?? "Vi har reserveret et bel\u00f8b p\u00e5 dit betalingskort.";
    const notCharged = t?.notCharged ?? "Pengene er endnu ikke trukket.";
    const providerLabel = t?.provider ?? "Udbyder";
    const reservationNumberLabel = t?.reservationNumber ?? "Reservationsnummer";
    const dateLabel = t?.date ?? "Dato";
    const customerLabel = t?.customer ?? "Kunde";
    const descLabel = t?.description ?? "Beskrivelse";
    const reservedLabel = t?.reserved ?? "Reserveret";
    const electricity = t?.electricity ?? "El-forbrug";
    const water = t?.water ?? "Vand-forbrug";
    const maxAmountLabel = t?.maxAmount ?? "Maks. bel\u00f8b til tr\u00e6kning";
    const howTitle = t?.howTitle ?? "Hvordan fungerer det?";
    const howText = t?.howText ?? "Bel\u00f8bet er reserveret p\u00e5 din bankkonto. N\u00e5r du afslutter forbruget, tr\u00e6kker vi pr\u00e6cis det forbrugte bel\u00f8b og frigiver resten.";
    const invoiceTitle = t?.invoiceTitle ?? "Faktura";
    const invoiceText = t?.invoiceText ?? "Din endelige faktura sendes, n\u00e5r forbruget er afsluttet.";

    const utilityType = type === "ELECTRICITY" ? electricity : water;
    const formattedDate = date.toLocaleDateString("da-DK");

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
        <table width="100%" style="max-width:560px;background:#111111;border:1px solid #292828;border-radius:12px;overflow:hidden;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #292828;">
              <span style="color:#ffffff;font-size:17px;font-weight:600;letter-spacing:-0.3px;">Ribe Sejlklub</span>
            </td>
          </tr>

          <!-- Title + notice -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:600;margin:0 0 8px 0;letter-spacing:-0.3px;">${title}</h1>
              <p style="color:#a1a1aa;font-size:15px;margin:0 0 16px 0;">${intro}</p>
              <div style="background:#1a1a1a;border:1px solid #292828;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
                <p style="color:#facc15;font-size:13px;margin:0;font-weight:500;">&#9888; ${notCharged}</p>
              </div>
            </td>
          </tr>

          <!-- Provider -->
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <p style="color:#a1a1aa;font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:.6px;margin:0 0 8px 0;">${providerLabel}</p>
              <p style="color:#ffffff;font-size:14px;line-height:1.7;margin:0;">
                Ribe Sejlklub<br/>
                Erik Menvedsvej 20, 6760 Ribe<br/>
                CVR: 74852513<br/>
                support@pins.dk
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><div style="height:1px;background:#292828;"></div></td></tr>

          <!-- Meta info -->
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:8px;color:#a1a1aa;font-size:13px;width:55%;">${reservationNumberLabel}</td>
                  <td style="padding-bottom:8px;color:#ffffff;font-size:13px;text-align:right;">${ReservationNumber}</td>
                </tr>
                <tr>
                  <td style="padding-bottom:8px;color:#a1a1aa;font-size:13px;">${dateLabel}</td>
                  <td style="padding-bottom:8px;color:#ffffff;font-size:13px;text-align:right;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color:#a1a1aa;font-size:13px;">${customerLabel}</td>
                  <td style="color:#ffffff;font-size:13px;text-align:right;">${email}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><div style="height:1px;background:#292828;"></div></td></tr>

          <!-- Line items -->
          <tr>
            <td style="padding:16px 32px 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="background:#1a1a1a;">
                  <td style="padding:10px 14px;color:#a1a1aa;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;border-radius:6px 0 0 6px;">${descLabel}</td>
                  <td style="padding:10px 14px;color:#a1a1aa;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;text-align:right;border-radius:0 6px 6px 0;">${reservedLabel}</td>
                </tr>
                <tr>
                  <td style="padding:14px 14px;color:#ffffff;font-size:14px;border-bottom:1px solid #292828;">${utilityType}</td>
                  <td style="padding:14px 14px;color:#ffffff;font-size:14px;text-align:right;border-bottom:1px solid #292828;">${amount.toFixed(2)} DKK</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Max amount -->
          <tr>
            <td style="padding:16px 32px 32px 32px;text-align:right;">
              <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0;">${maxAmountLabel}: ${amount.toFixed(2)} DKK</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><div style="height:1px;background:#292828;"></div></td></tr>

          <!-- How it works -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="color:#a1a1aa;font-size:13px;margin:0 0 12px 0;line-height:1.7;">
                <strong style="color:#ffffff;">${howTitle}</strong><br/>${howText}
              </p>
              <p style="color:#a1a1aa;font-size:13px;margin:0;line-height:1.7;">
                <strong style="color:#ffffff;">${invoiceTitle}</strong><br/>${invoiceText}
              </p>
            </td>
          </tr>

          <!-- Footer -->
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