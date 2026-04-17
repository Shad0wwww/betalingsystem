# Ribe Sejlklub - Betalingssystem

Et moderne betalings- og forbrugssystem til Ribe Sejlklub, der håndterer el-forbrug, betalinger og brugeradministration.

---

## Funktioner

### El-måler Integration
- **Modbus protokol** - Direkte kommunikation med elmålere
- **Realtidsmåling** - Se dit forbrug løbende
- **Spotpris-integration** - Automatisk beregning baseret på aktuelle elpriser
- **Session-håndtering** - Start/stop måling direkte fra appen

### Betalinger
- **Stripe integration** - Sikker betaling med kort
- **Reservationsbeløb** - Forhåndsreservering af forbrug
- **Automatisk fakturering** - Kvitteringer sendes på email
- **Transaktionshistorik** - Fuld oversigt over alle betalinger

### Brugersystem
- **OTP login** - Sikker login via engangskode på email
- **Multi-sprog** - Dansk, engelsk og tysk
- **Bådregistrering** - Tilknyt både til din profil
- **Forbrugsoversigt** - Dashboard med statistik

### Admin Panel
- **Brugeroversigt** - Se og rediger alle brugere
- **Måleradministration** - Tilføj og konfigurer elmålere
- **Aktive sessioner** - Monitorer igangværende forbrug
- **Broadcast mails** - Send beskeder til alle brugere
- **Bogføring** - Eksporter data til regnskab
- **Audit logs** - Fuld sporbarhed af handlinger

---

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 16 |
| Sprog | TypeScript |
| Database | PostgreSQL + Prisma |
| Styling | Tailwind CSS |
| Betaling | Stripe |
| Email | Nodemailer (Mailgun) |
| Auth | JWT + OTP |

---

## Kom i gang

### Forudsætninger
- Node.js 18+
- PostgreSQL database
- Stripe konto
- Mailgun konto

### Installation

```bash
# Klon repo
git clone https://github.com/Shad0wwww/betalingsystem.git
cd betalingsystem

# Installer dependencies
pnpm install

# Opsæt miljøvariabler
cp .env.example .env

# Kør database migrations
pnpm prisma migrate dev

# Start udviklings-server
pnpm dev
```

### Miljøvariabler

```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
MAILGUN_HOST=smtp.mailgun.org
MAILGUN_LOGIN=postmaster@...
MAILGUN_PASSWORD=...
JWT_SECRET=...
```

---

## Projekt Struktur

```
src/
├── app/
│   ├── [lang]/           # Sprog-router (da/en/de)
│   │   ├── admin/        # Admin panel
│   │   ├── dashboard/    # Bruger dashboard
│   │   └── login/        # Login side
│   └── api/              # API routes
├── components/           # React komponenter
├── lib/
│   ├── emailer/          # Email templates
│   ├── session/          # Auth håndtering
│   └── stripe/           # Stripe integration
└── dictionaries/         # Oversættelser
```

---

## API Endpoints

| Endpoint | Metode | Beskrivelse |
|----------|--------|-------------|
| `/api/modbus/session/start` | POST | Start elmåler-session |
| `/api/modbus/session/stop` | POST | Stop session og beregn forbrug |
| `/api/stripe/webhook` | POST | Håndter Stripe events |
| `/api/admin/users` | GET | Hent alle brugere |
| `/api/admin/broadcast` | POST | Send broadcast email |

---

## NEXT RELEAESE
[ ] Tjek om der bliver taget strøm, selvom måleren ikke er tilsluttet. Hvis der blvier taget strøm, så skal der sende en advarsel til admin på f.eks. mail, hvor de får det som en advarsel, med lokation, måler. 

## Licens

Privat projekt - Ribe Sejlklub
