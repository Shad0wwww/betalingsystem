/**
 * Energinet electricity price fetcher
 *
 * Exports two functions:
 *  - getElPriser        — full daily summary (overblik) + current price
 *  - getLiveElectricityPrice — lightweight single-hour current price
 *
 * Both use the official Energinet Energi Data Service API.
 * No external dependencies. Node.js / Next.js compatible.
 */

export type PriceArea = "DK1" | "DK2";

export interface ElOverblik {
	date: string;
	hoejestePris: number;
	hoejesteTid: string;
	lavestesPris: number;
	lavestesTid: string;
	gennemsnit: number;
}

export interface ElPrisLigenu {
	date: string;
	pris: number;
	tid: string;
	underDagensGns: number;
}

export interface ElPriserResult {
	overblik: ElOverblik;
	prisLigenu: ElPrisLigenu;
}

interface EnerginetRecord {
	TimeDK: string;         // Danish local time, e.g. "2026-03-10T13:15:00" (15-min intervals)
	PriceArea: string;
	DayAheadPriceDKK: number; // DKK per MWh — divide by 1000 for DKK/kWh
}

interface EnerginetResponse {
	records?: EnerginetRecord[];
}

const MAX_RETRIES = 3;

async function fetchWithRetry(url: string): Promise<Response> {
	for (let i = 0; i < MAX_RETRIES; i++) {
		const res = await fetch(url);

		if (res.ok) return res;

		if (res.status < 500) {
			throw new Error(`Energinet API error: ${res.status} ${res.statusText}`);
		}

		await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
	}

	throw new Error("Energinet API failed after retries");
}

function formatHourSlot(hourDK: string) {
	const start = parseInt(hourDK.slice(11, 13));
	const end = (start + 1) % 24;

	return `${String(start).padStart(2, "0")}:00-${String(end).padStart(2, "0")}:00`;
}

function getTodayDK() {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Copenhagen",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());

	const obj: any = {};
	parts.forEach((p) => (obj[p.type] = p.value));

	return `${obj.year}-${obj.month}-${obj.day}`;
}

function resolveActiveDate(records: EnerginetRecord[], today: string, priceArea: PriceArea): string | null {
	const areaRecords = records.filter((r) => r.PriceArea === priceArea);
	if (areaRecords.length === 0) return null;

	// Prefer today's prices when available, otherwise use newest available local date.
	const hasToday = areaRecords.some((r) => r.TimeDK.startsWith(today));
	if (hasToday) return today;

	const latest = areaRecords
		.map((r) => r.TimeDK.slice(0, 10))
		.sort((a, b) => b.localeCompare(a))[0];

	return latest ?? null;
}

export async function getElPriser(
	priceArea: PriceArea = "DK1"
): Promise<ElPriserResult> {

	const today = getTodayDK();

	// Dataset: DayAheadPrices — current hourly spot prices for DK1/DK2.
	// Elspotprices is stale (last updated 2025-09-30); DayAheadPrices is live.
	// No filter/sort/start/end params — DayAheadPrices rejects unknown sort keys;
	// filtering and sorting happen in code.
	const url = "https://api.energidataservice.dk/dataset/DayAheadPrices?limit=120";

	const res = await fetchWithRetry(url);
	const body = (await res.json()) as EnerginetResponse;
	const activeDate = resolveActiveDate(body.records ?? [], today, priceArea);

	if (!activeDate) {
		throw new Error(`No prices returned for ${priceArea}`);
	}

	// Filter to active date + requested area, then sort ascending by HourDK.
	const records = (body.records ?? [])
		.filter((r) => r.PriceArea === priceArea)
		.filter((r) => r.TimeDK.startsWith(activeDate))
		.sort((a, b) => a.TimeDK.localeCompare(b.TimeDK));

	if (records.length === 0) {
		throw new Error(`No prices returned for ${activeDate}`);
	}

	const prices = records.map((r) => r.DayAheadPriceDKK / 1000);

	const max = Math.max(...prices);
	const min = Math.min(...prices);
	const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

	const maxIndex = prices.indexOf(max);
	const minIndex = prices.indexOf(min);

	const overblik: ElOverblik = {
		date: activeDate,
		hoejestePris: Number(max.toFixed(4)),
		hoejesteTid: formatHourSlot(records[maxIndex].TimeDK),
		lavestesPris: Number(min.toFixed(4)),
		lavestesTid: formatHourSlot(records[minIndex].TimeDK),
		gennemsnit: Number(avg.toFixed(4)),
	};

	// Get current hour in Copenhagen timezone (not UTC!)
	const currentHourDK = parseInt(
		new Intl.DateTimeFormat("en-GB", {
			timeZone: "Europe/Copenhagen",
			hour: "2-digit",
			hour12: false,
		}).format(new Date()),
		10
	);

	const current =
		records.find(
			(r) => parseInt(r.TimeDK.slice(11, 13)) === currentHourDK
		) || records[0];

	const currentPrice = current.DayAheadPriceDKK / 1000;

	const prisLigenu: ElPrisLigenu = {
		date: activeDate,
		pris: Number(currentPrice.toFixed(4)) + 0.1, // Add tiny amount to avoid zero price (for free sessions)
		tid: formatHourSlot(current.TimeDK),
		underDagensGns: Math.round(((avg - currentPrice) / avg) * 100),
	};

	return {
		overblik,
		prisLigenu,
	};
}

// ---------------------------------------------------------------------------
// getLiveElectricityPrice
// ---------------------------------------------------------------------------

/** Return type for getLiveElectricityPrice */
export interface LiveElectricityPrice {
	/** DKK/kWh spot price (SpotPriceDKK / 1000) */
	price: number;
	/** e.g. "13:00-14:00" */
	timeSlot: string;
	/** e.g. "2026-03-10" (Copenhagen date) */
	date: string;
}

/** Raw record shape from the DayAheadPrices dataset */
interface DayAheadRecord {
	/** Danish local time, 15-min intervals: "2026-03-10T13:15:00" */
	TimeDK: string;
	PriceArea: string;
	/** Day-ahead price in DKK per MWh — divide by 1000 for DKK/kWh */
	DayAheadPriceDKK: number;
}

interface DayAheadResponse {
	records?: DayAheadRecord[];
}

/**
 * Returns the current hour's electricity spot price for the given price area.
 *
 * Strategy:
 *  1. Fetch the last 120 records from DayAheadPrices (no filter/start/end
 *     params — avoids Energinet 400 errors).
 *  2. Filter in code: keep only today's records for the requested area.
 *  3. Match the record whose HourDK hour equals the current Copenhagen hour.
 *  4. Fall back to the most recent available record if no exact match.
 *
 * @param priceArea  "DK1" (West Denmark) | "DK2" (East Denmark). Default DK1.
 */
export async function getLiveElectricityPrice(
	priceArea: PriceArea = "DK1"
): Promise<LiveElectricityPrice> {
	// --- 1. Build today's date string in the Copenhagen timezone ---
	// Intl.DateTimeFormat with en-CA gives us "yyyy-MM-dd" directly.
	const todayDK = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Copenhagen",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());

	// Current hour in Copenhagen (0-23).
	const currentHourDK = parseInt(
		new Intl.DateTimeFormat("en-GB", {
			timeZone: "Europe/Copenhagen",
			hour: "2-digit",
			hour12: false,
		}).format(new Date()),
		10
	);

	// --- 2. Fetch from Energinet (no filter/sort/start/end to avoid 400s) ---
	// DayAheadPrices rejects unknown sort keys; we sort in code after filtering.
	const API_URL = "https://api.energidataservice.dk/dataset/DayAheadPrices?limit=120";

	let lastError: unknown;

	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			const res = await fetch(API_URL, { headers: { Accept: "application/json" } });

			if (!res.ok) {
				// 4xx errors are not transient — throw immediately.
				if (res.status < 500) {
					throw new Error(`Energinet DayAheadPrices API error: ${res.status} ${res.statusText}`);
				}
				// 5xx — retry with exponential back-off.
				throw new Error(`Energinet server error: ${res.status}`);
			}

			const body = (await res.json()) as DayAheadResponse;
			const activeDate = resolveActiveDate((body.records ?? []) as EnerginetRecord[], todayDK, priceArea);

			if (!activeDate) {
				throw new Error(`No DayAheadPrices records found for ${priceArea}.`);
			}

			// --- 3. Filter in code: active-date records for the requested area ---
			// Sort descending so todayRecords[0] is the most recent record (fallback).
			const todayRecords = (body.records ?? [])
				.filter((r) => r.PriceArea === priceArea)
				.filter((r) => r.TimeDK.startsWith(activeDate))
				.sort((a, b) => b.TimeDK.localeCompare(a.TimeDK));

			if (todayRecords.length === 0) {
				throw new Error(
					`No DayAheadPrices records found for ${activeDate} (${priceArea}).`
				);
			}

			// --- 4. Find the record for the current Copenhagen hour ---
			// Records are 15-min intervals; match on the hour component of TimeDK.
			const current =
				todayRecords.find(
					(r) => parseInt(r.TimeDK.slice(11, 13), 10) === currentHourDK
				) ??
				// Fall back to the most recent available record for today.
				todayRecords[0];

			// DayAheadPriceDKK is DKK/MWh → divide by 1000 for DKK/kWh.
			const price = Number((current.DayAheadPriceDKK / 1000).toFixed(4));
			const timeSlot = formatHourSlot(current.TimeDK);

			return { price, timeSlot, date: activeDate };
		} catch (err) {
			lastError = err;
			// Only retry on 5xx / network errors; 4xx and data errors are final.
			if (
				err instanceof Error &&
				(err.message.includes("server error") || err.message.includes("fetch"))
			) {
				if (attempt < 3) {
					await new Promise((r) => setTimeout(r, 1000 * attempt));
					continue;
				}
			}
			throw err;
		}
	}

	throw lastError ?? new Error("getLiveElectricityPrice failed after retries");
}