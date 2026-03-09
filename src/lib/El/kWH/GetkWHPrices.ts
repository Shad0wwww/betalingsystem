/**
 * Fetches Danish electricity prices from elprisenligenu.dk
 * Prices are already consumer prices incl. VAT and all fees (DKK/kWh).
 *
 * API format: https://www.elprisenligenu.dk/api/v1/prices/{year}/{MM-DD}_{area}.json
 */

export type PriceArea = "DK1" | "DK2"; // DK1 = West Denmark, DK2 = East Denmark

export interface ElOverblik {
    date: string;           // e.g. "2026-03-09"
    hoejestePris: number;   // kr/kWh incl. VAT
    hoejesteTid: string;    // e.g. "19:00-20:00"
    lavestesPris: number;   // kr/kWh incl. VAT
    lavestesTid: string;    // e.g. "13:00-14:00"
    gennemsnit: number;     // kr/kWh incl. VAT
}

export interface ElPrisLigenu {
    date: string;           // e.g. "2026-03-09"
    pris: number;           // kr/kWh incl. VAT
    tid: string;            // e.g. "10:00-11:00"
    underDagensGns: number; // percent vs average (positive = cheaper, negative = more expensive)
}

export interface ElPriserResult {
    overblik: ElOverblik;
    prisLigenu: ElPrisLigenu;
}

interface ElprisRecord {
    DKK_per_kWh: number;    // already incl. VAT and fees
    EUR_per_kWh: number;
    EXR: number;
    time_start: string;     // "2026-03-09T13:00:00+01:00"
    time_end: string;       // "2026-03-09T14:00:00+01:00"
}

function formatTimeSlot(isoStart: string, isoEnd: string): string {
    // "2026-03-09T13:00:00+01:00" → "13:00"
    const start = isoStart.substring(11, 16);
    const end = isoEnd.substring(11, 16);
    return `${start}-${end}`;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const response = await fetch(url);
        if (response.ok) return response;
        if (response.status < 500 || attempt === retries) {
            throw new Error(`elprisenligenu.dk API error: ${response.status} ${response.statusText}`);
        }
        console.warn(`Attempt ${attempt} failed with ${response.status}. Retrying in ${RETRY_DELAY_MS * attempt}ms...`);
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS * attempt));
    }
    throw new Error("Unexpected retry loop exit");
}

/**
 * Fetches today's electricity prices and returns overblik + current price.
 * @param priceArea "DK1" (Vestdanmark) or "DK2" (Østdanmark). Defaults to DK1.
 */
export async function getElPriser(priceArea: PriceArea = "DK1"): Promise<ElPriserResult> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    const url = `https://www.elprisenligenu.dk/api/v1/prices/${year}/${month}-${day}_${priceArea}.json`;

    const response = await fetchWithRetry(url);
    const records = (await response.json()) as ElprisRecord[];

    if (!records || records.length === 0) {
        throw new Error("No electricity price data available for today.");
    }

    // --- Overblik ---
    const highest = records.reduce((a, b) => (a.DKK_per_kWh > b.DKK_per_kWh ? a : b));
    const lowest  = records.reduce((a, b) => (a.DKK_per_kWh < b.DKK_per_kWh ? a : b));
    const average = records.reduce((sum, r) => sum + r.DKK_per_kWh, 0) / records.length;

    const overblik: ElOverblik = {
        date: todayStr,
        hoejestePris: Math.round(highest.DKK_per_kWh * 100) / 100,
        hoejesteTid: formatTimeSlot(highest.time_start, highest.time_end),
        lavestesPris: Math.round(lowest.DKK_per_kWh * 100) / 100,
        lavestesTid: formatTimeSlot(lowest.time_start, lowest.time_end),
        gennemsnit: Math.round(average * 100) / 100,
    };

    // --- Prisen lige nu ---
    // Find the record where now falls between time_start and time_end
    const current =
        records.find((r) => {
            const start = new Date(r.time_start).getTime();
            const end = new Date(r.time_end).getTime();
            return now.getTime() >= start && now.getTime() < end;
        }) ?? records[records.length - 1];

    const underGns = Math.round(((average - current.DKK_per_kWh) / average) * 100);

    const prisLigenu: ElPrisLigenu = {
        date: todayStr,
        pris: Math.round(current.DKK_per_kWh * 100) / 100,
        tid: formatTimeSlot(current.time_start, current.time_end),
        underDagensGns: underGns,
    };

    return { overblik, prisLigenu };
}


