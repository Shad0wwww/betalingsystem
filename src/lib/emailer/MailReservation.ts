export async function generateReservationEmailContent(
    amount: number,
    type: string,
    email: string,
    date: Date = new Date(),
    ReservationNumber: string, // Skiftede navn fra InvoiceNumber for klarhed
) {
    const utilityType = type === "ELECTRICITY" ? "El-forbrug" : "Vand-forbrug";
    const formattedDate = date.toLocaleDateString("da-DK");

    return `
        <html>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                    <h1 style="color: #2c3e50;">Bekræftelse på kortreservation</h1>
                    
                    <p style="font-size: 1.1em; color: #555;">
                        Dette er en bekræftelse på, at vi har reserveret et beløb på dit betalingskort. <strong>Pengene er endnu ikke trukket.</strong>
                    </p>

                    <div style="margin-bottom: 20px;">
                        <strong>Udbyder:</strong><br/>
                        Ribe Sejlklub<br/>
                        Erik Menvedsvej 20,
                        6760 Ribe<br/>
                        CVR: 74852513<br/>
                        Kontakt: support@pins.dk
                    </div>

                    <hr style="border: 0; border-top: 1px solid #eee;" />

                    <div style="margin: 20px 0;">
                        <p><strong>Reservationsnummer:</strong> ${ReservationNumber}</p>
                        <p><strong>Dato:</strong> ${formattedDate}</p>
                        <p><strong>Kunde:</strong> ${email}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Beskrivelse</th>
                                <th style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">Reserveret</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">Reservation til ${utilityType}</td>
                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${amount.toFixed(2)} DKK</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="text-align: right; margin-top: 20px;">
                        <p style="font-size: 1.2em; font-weight: bold;">Maksimalt beløb til trækning: ${amount.toFixed(2)} DKK</p>
                    </div>

                    <div style="margin-top: 40px; font-size: 0.9em; color: #777;">
                        <p><strong>Hvordan fungerer det?</strong><br/> 
                        Beløbet ovenfor er i øjeblikket kun reserveret på din bankkonto. Når du afslutter dit forbrug, opgør vi den præcise pris for det, du har brugt. Vi trækker kun det beløb, du rent faktisk har brugt, og beder derefter din bank om straks at frigive den resterende del af reservationen.</p>
                        
                        <p><strong>Faktura:</strong><br/>
                        Du vil modtage din endelige faktura og kvittering med momsspecifikation, så snart dit forbrug er afsluttet og det præcise beløb er trukket.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
}