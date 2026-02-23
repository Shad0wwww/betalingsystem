export async function generateInvoiceEmailContent(
    amount: number,
    type: string,
    email: string,
    date: Date = new Date(),
    InvoiceNumber: string,
) {
    const utilityType = type === "ELECTRICITY" ? "El-forbrug" : "Vand-forbrug";
    
    const mva = amount * 0.2; 
    const priceExMva = amount - mva;

    const formattedDate = date.toLocaleDateString("da-DK");


    return `
        <html>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                    <h1 style="color: #2c3e50;">Faktura / Købsbevis</h1>
                    
                    <div style="margin-bottom: 20px;">
                        <strong>Sælger:</strong><br/>
                        Ribe Sejlklub<br/>
                        Erik Menvedsvej 20,
                        6760 Ribe<br/>
                        CVR: 74852513<br/>
                        Kontakt: support@pins.dk
                    </div>

                    <hr style="border: 0; border-top: 1px solid #eee;" />

                    <div style="margin: 20px 0;">
                        <p><strong>Fakturanummer:</strong> ${InvoiceNumber}</p>
                        <p><strong>Dato:</strong> ${formattedDate}</p>
                        <p><strong>Kunde:</strong> ${email}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Beskrivelse</th>
                                <th style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">Pris</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${utilityType} (Indbetaling til balance)</td>
                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${priceExMva.toFixed(2)} DKK</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="text-align: right; margin-top: 20px;">
                        <p>Heraf moms (25%): ${mva.toFixed(2)} DKK</p>
                        <p style="font-size: 1.2em; font-weight: bold;">Total inkl. moms: ${amount.toFixed(2)} DKK</p>
                    </div>

                    <div style="margin-top: 40px; font-size: 0.9em; color: #777;">
                        <p><strong>Info:</strong> Dette er din dokumentation for købet. Gem denne e-mail i mindst 2 år som dokumentation for din reklamationsret.</p>
                        <p><strong>Fortrydelsesret:</strong> Da der er tale om øjeblikkelig levering af energi/forsyning til din balance, accepterer du ved købet, at fortrydelsesretten bortfalder, når ydelsen tages i brug.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
}