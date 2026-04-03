'use client';

import { useState } from 'react';
import { Zap, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface EstimatedCostProps {
    dict: any;
    currentKwhPrice?: number;
}

const DAYS_DK = ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'];
const MONTHS_DK = [
    'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'December'
];

const VAT_RATE = 0.25;

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
}
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}
function isBetween(date: Date, start: Date, end: Date) {
    return date.getTime() > start.getTime() && date.getTime() < end.getTime();
}

export default function EstimatedCost({ dict, currentKwhPrice }: EstimatedCostProps) {
    const kwhPrice = currentKwhPrice && currentKwhPrice > 0 ? currentKwhPrice : 3.0;
    const priceSource = currentKwhPrice && currentKwhPrice > 0 ? 'live' : 'fallback';

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [selecting, setSelecting] = useState<'start' | 'end'>('start');
    const [kwh, setKwh] = useState<number>(5);

    const days = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const nights = startDate && endDate
        ? Math.round(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const exVat = nights * kwh * kwhPrice;
    const vatAmount = exVat * VAT_RATE;
    const inclVat = exVat + vatAmount;

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }
    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }
    function handleDayClick(date: Date) {
        if (selecting === 'start') {
            setStartDate(date);
            setEndDate(null);
            setSelecting('end');
        } else {
            if (startDate && date < startDate) {
                setEndDate(startDate);
                setStartDate(date);
            } else {
                setEndDate(date);
            }
            setSelecting('start');
        }
    }
    function getDayState(date: Date) {
        const activeEnd = endDate ?? (selecting === 'end' && hoverDate ? hoverDate : null);
        if (startDate && isSameDay(date, startDate)) return 'start';
        if (activeEnd && endDate && isSameDay(date, activeEnd)) return 'end';
        if (startDate && activeEnd && isBetween(date, startDate, activeEnd)) return 'between';
        return 'none';
    }

    const cells: (Date | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: days }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const fmt = (n: number) =>
        n.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <section style={{
            background: 'var(--background)',
            padding: '80px 20px',
            borderTop: '1px solid var(--border-color)',
        }}>
            <style>{`
                .ec-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: var(--primary-color);
                    background: rgba(37,99,235,0.08);
                    border: 1px solid rgba(37,99,235,0.18);
                    border-radius: 999px;
                    padding: 5px 14px;
                    margin-bottom: 20px;
                }
                .ec-card {
                    background: var(--box-color);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0px 4px 13px rgba(0,0,0,0.25);
                }
                .ec-section-label {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #3a3a3a;
                    margin-bottom: 16px;
                }
                .cal-nav-btn {
                    background: var(--box-color-lighter);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--sub-headline);
                    cursor: pointer;
                    padding: 6px;
                    display: flex;
                    align-items: center;
                    transition: border-color 0.15s, color 0.15s;
                }
                .cal-nav-btn:hover {
                    border-color: var(--primary-color);
                    color: #fff;
                }
                .cal-cell {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    border-radius: 6px;
                    cursor: pointer;
                    color: var(--sub-headline);
                    transition: background 0.1s, color 0.1s;
                    position: relative;
                    user-select: none;
                }
                .cal-cell:hover {
                    background: var(--box-color-lighter);
                    color: #fff;
                }
                .cal-cell--start, .cal-cell--end {
                    background: var(--primary-color) !important;
                    color: #fff !important;
                    font-weight: 700;
                }
                .cal-cell--between {
                    background: rgba(37,99,235,0.14);
                    color: #93c5fd;
                    border-radius: 0;
                }
                .cal-cell--today::after {
                    content: '';
                    position: absolute;
                    bottom: 3px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    background: var(--primary-color);
                }
                .cal-cell--past {
                    opacity: 0.2;
                    cursor: default;
                    pointer-events: none;
                }
                .ec-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    height: 3px;
                    border-radius: 2px;
                    outline: none;
                    background: linear-gradient(
                        to right,
                        var(--primary-color) var(--pct, 0%),
                        var(--box-color-lighter) var(--pct, 0%)
                    );
                }
                .ec-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    cursor: pointer;
                    border: 2px solid var(--background);
                }
                .ec-date-chip {
                    flex: 1;
                    background: var(--box-color-lighter);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 13px;
                    color: #444;
                    text-align: center;
                    transition: border-color 0.15s, color 0.15s;
                }
                .ec-date-chip--active {
                    border-color: rgba(37,99,235,0.35);
                    color: #93c5fd;
                }
                .ec-divider {
                    height: 1px;
                    background: var(--border-color);
                    margin: 10px 0;
                }
                .ec-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 13px;
                    padding: 3px 0;
                }
                .ec-warning {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-top: 16px;
                    padding: 10px 14px;
                    background: rgba(234,179,8,0.05);
                    border: 1px solid rgba(234,179,8,0.14);
                    border-radius: 8px;
                    font-size: 12px;
                    line-height: 1.5;
                }
            `}</style>

            <div style={{ maxWidth: 960, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div className="ec-badge">
                        <Zap size={11} />
                        Beregner
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(26px, 4vw, 38px)',
                        fontWeight: 700,
                        color: 'var(--headline-color)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        margin: '0 0 12px',
                    }}>
                        Beregn dit estimerede elforbrug
                    </h2>
                    <p style={{
                        fontSize: 15,
                        color: 'var(--sub-headline)',
                        maxWidth: 440,
                        margin: '0 auto',
                        lineHeight: 1.6,
                    }}>
                        Vælg dine datoer og juster forbruget for at se en estimeret pris.
                    </p>
                </div>

                {/* Two-column grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 20,
                    alignItems: 'start',
                }}>

                    {/* ── Calendar ── */}
                    <div className="ec-card">
                        <p className="ec-section-label">Vælg periode</p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <button className="cal-nav-btn" onClick={prevMonth}>
                                <ChevronLeft size={15} />
                            </button>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--headline-color)' }}>
                                {MONTHS_DK[viewMonth]} {viewYear}
                            </span>
                            <button className="cal-nav-btn" onClick={nextMonth}>
                                <ChevronRight size={15} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                            {DAYS_DK.map(d => (
                                <div key={d} style={{
                                    textAlign: 'center', fontSize: 11, fontWeight: 600,
                                    letterSpacing: '0.06em', color: '#333', padding: '4px 0',
                                }}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                            {cells.map((date, i) => {
                                if (!date) return <div key={`e-${i}`} style={{ aspectRatio: '1' }} />;
                                const state = getDayState(date);
                                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                const isToday = isSameDay(date, today);
                                return (
                                    <div
                                        key={i}
                                        className={[
                                            'cal-cell',
                                            state === 'start' ? 'cal-cell--start' : '',
                                            state === 'end' ? 'cal-cell--end' : '',
                                            state === 'between' ? 'cal-cell--between' : '',
                                            isToday ? 'cal-cell--today' : '',
                                            isPast ? 'cal-cell--past' : '',
                                        ].join(' ')}
                                        onClick={() => !isPast && handleDayClick(date)}
                                        onMouseEnter={() => selecting === 'end' && setHoverDate(date)}
                                        onMouseLeave={() => setHoverDate(null)}
                                    >
                                        {date.getDate()}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                            <div className={`ec-date-chip${startDate ? ' ec-date-chip--active' : ''}`}>
                                {startDate
                                    ? startDate.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
                                    : 'Ankomst'}
                            </div>
                            <span style={{ color: '#333' }}>→</span>
                            <div className={`ec-date-chip${endDate ? ' ec-date-chip--active' : ''}`}>
                                {endDate
                                    ? endDate.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
                                    : 'Afgang'}
                            </div>
                        </div>

                        <p style={{ marginTop: 10, fontSize: 12, color: '#333', textAlign: 'center' }}>
                            {selecting === 'start' ? 'Klik for at vælge ankomstdato' : 'Klik for at vælge afgangsdato'}
                        </p>
                    </div>

                    {/* ── Right column ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* kWh slider */}
                        <div className="ec-card">
                            <p className="ec-section-label">Dagligt elforbrug</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Zap size={15} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                <input
                                    type="range"
                                    min={1} max={20} step={0.5}
                                    value={kwh}
                                    className="ec-slider"
                                    style={{ '--pct': `${((kwh - 1) / 19) * 100}%` } as React.CSSProperties}
                                    onChange={e => setKwh(parseFloat(e.target.value))}
                                />
                                <span style={{
                                    minWidth: 64, textAlign: 'right',
                                    fontSize: 14, fontWeight: 600,
                                    color: 'var(--headline-color)',
                                }}>
                                    {kwh.toFixed(1)} kWh
                                </span>
                            </div>
                        </div>

                        {/* Result */}
                        <div className="ec-card">
                            <p className="ec-section-label">Estimat</p>

                            <div className="ec-row">
                                <span style={{ color: 'var(--sub-headline)' }}>Antal nætter</span>
                                <span style={{ color: 'var(--headline-color)', fontWeight: 500 }}>{nights}</span>
                            </div>
                            <div className="ec-row">
                                <span style={{ color: 'var(--sub-headline)' }}>Forbrug pr. nat</span>
                                <span style={{ color: 'var(--headline-color)', fontWeight: 500 }}>{kwh.toFixed(1)} kWh</span>
                            </div>
                            <div className="ec-row">
                                <span style={{ color: 'var(--sub-headline)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    Elpris
                                    <span style={{
                                        fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                                        textTransform: 'uppercase', padding: '2px 7px',
                                        borderRadius: 999,
                                        background: priceSource === 'live'
                                            ? 'rgba(37,99,235,0.1)' : 'rgba(234,179,8,0.1)',
                                        color: priceSource === 'live' ? '#93c5fd' : '#fbbf24',
                                        border: `1px solid ${priceSource === 'live'
                                            ? 'rgba(37,99,235,0.2)' : 'rgba(234,179,8,0.2)'}`,
                                    }}>
                                        {priceSource === 'live' ? '● Live' : '● Standard'}
                                    </span>
                                </span>
                                <span style={{ color: 'var(--headline-color)', fontWeight: 500 }}>
                                    {fmt(kwhPrice)} kr/kWh
                                </span>
                            </div>

                            <div className="ec-divider" />

                            <div className="ec-row">
                                <span style={{ color: 'var(--sub-headline)' }}>Ekskl. moms</span>
                                <span style={{ color: 'var(--headline-color)', fontWeight: 500 }}>
                                    {nights > 0 ? `${fmt(exVat)} kr.` : '—'}
                                </span>
                            </div>
                            <div className="ec-row">
                                <span style={{ color: 'var(--sub-headline)' }}>Moms (25 %)</span>
                                <span style={{ color: 'var(--headline-color)', fontWeight: 500 }}>
                                    {nights > 0 ? `${fmt(vatAmount)} kr.` : '—'}
                                </span>
                            </div>

                            <div className="ec-divider" />

                            {/* Total inkl. moms */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                                    textTransform: 'uppercase', color: '#3a3a3a',
                                }}>
                                    Total inkl. moms
                                </span>
                                <div>
                                    <span style={{
                                        fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em',
                                        color: nights > 0 ? 'var(--primary-color)' : '#2a2a2a',
                                        lineHeight: 1,
                                    }}>
                                        {nights > 0 ? fmt(inclVat) : '—'}
                                    </span>
                                    {nights > 0 && (
                                        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--sub-headline)', marginLeft: 4 }}>
                                            kr.
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="ec-warning">
                                <AlertTriangle size={13} style={{ color: '#ca8a04', flexShrink: 0, marginTop: 1 }} />
                                <span style={{ color: '#a16207', fontSize: 12 }}>
                                    Elprisen varierer løbende og beregningen er kun vejledende.
                                    {priceSource === 'fallback' &&
                                        ' Standardpris på 3,00 kr/kWh anvendes da live-pris ikke er tilgængelig.'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
