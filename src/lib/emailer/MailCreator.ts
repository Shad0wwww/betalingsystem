export function generateHtmlOTP(code: string) {
    const digits = code.split('');
    const digitHtml = digits.map(d => 
        `<div class="digit">${d.toUpperCase()}</div>`
    ).join('');

    return `
        <!DOCTYPE html>
        <html lang="da">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Din verifikationskode</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background: #000000;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        color: #c9d1d9;
                    }
                    .container {
                        background: #0d1117;
                        padding: 40px 32px;
                        border-radius: 16px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                        text-align: center;
                        max-width: 480px;
                        width: 90%;
                        border: 1px solid #30363d;
                    }
                    h1 {
                        font-size: 30px;
                        margin: 0 0 12px 0;
                        color: #ffffff;
                        font-weight: 600;
                    }
                    .subtitle {
                        font-size: 16px;
                        color: #8b949e;
                        margin-bottom: 40px;
                    }
                    .otp-code {
                        display: flex;
                        justify-content: center;
                        gap: 12px;
                        margin: 0 auto 40px;
                        flex-wrap: wrap;
                    }
                    .digit {
                        font-size: 52px;
                        font-weight: bold;
                        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
                        line-height: 1;
                        background: #161b22;
                        border: 1px solid #30363d;
                        border-radius: 16px;
                        width: 72px;
                        display: grid;
                        place-items: center;
                        color: #f0f6fc;
                        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
                    }
                    .note {
                        font-size: 15px;
                        color: #8b949e;
                        margin-bottom: 16px;
                    }
                    .warning {
                        font-size: 14px;
                        color: #f85149;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Din Engangskode</h1>
                    <p class="subtitle">Indtast denne kode for at logge ind</p>
                    
                    <div class="otp-code">
                        ${digitHtml}
                    </div>
                    
                    <p class="note">Koden er gyldig i 10 minutter</p>
                    <p class="warning">Del aldrig denne kode med andre – heller ikke med os!</p>
                </div>
            </body>
        </html>`;
}