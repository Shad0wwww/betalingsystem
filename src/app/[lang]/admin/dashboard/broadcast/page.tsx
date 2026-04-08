    "use client";

import React from "react";
import { Box } from "@/components/admin/Box";
import toast from "react-hot-toast";
import {
    Send,
    Mail,
    FileText,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    Users,
    Bold,
    Italic,
    Link,
} from "lucide-react";

const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const textareaClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none";

function Field({
    label,
    icon: Icon,
    children,
}: {
    label: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </label>
            {children}
        </div>
    );
}

interface BroadcastResult {
    message: string;
    success: number;
    failed: number;
    total: number;
    errors?: string[];
}

export default function BroadcastPage() {
    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [result, setResult] = React.useState<BroadcastResult | null>(null);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const insertFormatting = (before: string, after: string, placeholder: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = body.substring(start, end);
        const textToInsert = selectedText || placeholder;

        const newText = body.substring(0, start) + before + textToInsert + after + body.substring(end);
        setBody(newText);

        // Sæt cursor position efter indsættelse
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + textToInsert.length + after.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const insertLink = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = body.substring(start, end);

        const linkText = selectedText || "linktekst";
        const template = `[${linkText}](https://example.com)`;

        const newText = body.substring(0, start) + template + body.substring(end);
        setBody(newText);

        setTimeout(() => {
            textarea.focus();
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subject.trim() || !body.trim()) {
            setError("Udfyld venligst både emne og brødtekst");
            return;
        }

        setShowConfirm(true);
    };

    const handleConfirmSend = async () => {
        setShowConfirm(false);
        setError(null);
        setResult(null);
        setSending(true);

        try {
            const res = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Der skete en fejl");
            }

            setResult(data);
            setSubject("");
            setBody("");
            toast.success(`Broadcast sendt til ${data.success} brugere!`);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message || "Der skete en fejl ved afsendelse");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        Admin
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">Broadcast Mail</h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Send en besked til alle brugere på platformen.
                </p>
            </div>

            <div className="mx-auto max-w-screen-xl px-4 md:px-20 space-y-6">
                {/* Advarsel */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-yellow-400 font-medium text-sm">
                            Brug kun til vigtige meddelelser
                        </p>
                        <p className="text-yellow-400/70 text-sm mt-1">
                            Denne funktion sender en email til ALLE brugere.
                            Brug kun til kritiske opdateringer som sikkerhedsfejl,
                            vilkårsændringer eller vigtige systembeskeder.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formular */}
                    <div className="lg:col-span-2">
                        <Box>
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-white">
                                    Skriv din besked
                                </h2>
                                <p className="text-zinc-500 text-sm mt-0.5">
                                    Beskeden sendes fra noreply-adressen.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Field label="Emne" icon={Mail}>
                                    <input
                                        className={inputClass}
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        disabled={sending}
                                        placeholder="f.eks. Vigtig sikkerhedsopdatering"
                                        maxLength={200}
                                    />
                                </Field>

                                <Field label="Brødtekst" icon={FileText}>
                                    {/* Formatting toolbar */}
                                    <div className="flex items-center gap-1 mb-2 p-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50 w-fit">
                                        <button
                                            type="button"
                                            onClick={() => insertFormatting("**", "**", "fed tekst")}
                                            disabled={sending}
                                            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                                            title="Fed tekst (Ctrl+B)"
                                        >
                                            <Bold className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => insertFormatting("*", "*", "kursiv tekst")}
                                            disabled={sending}
                                            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                                            title="Kursiv tekst (Ctrl+I)"
                                        >
                                            <Italic className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-zinc-700 mx-1" />
                                        <button
                                            type="button"
                                            onClick={insertLink}
                                            disabled={sending}
                                            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                                            title="Indsæt link"
                                        >
                                            <Link className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <textarea
                                        ref={textareaRef}
                                        className={textareaClass}
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        disabled={sending}
                                        placeholder="Skriv din besked her...&#10;&#10;Formatering:&#10;**fed tekst** eller *kursiv tekst*&#10;[linktekst](https://example.com)"
                                        rows={10}
                                        maxLength={5000}
                                    />
                                    <p className="text-zinc-600 text-xs mt-1 text-right">
                                        {body.length} / 5000 tegn
                                    </p>
                                </Field>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {result && (
                                    <div className={`p-4 rounded-lg border ${result.failed === 0
                                        ? "bg-green-500/10 border-green-500/20"
                                        : "bg-yellow-500/10 border-yellow-500/20"
                                        }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className={`w-4 h-4 ${result.failed === 0 ? "text-green-400" : "text-yellow-400"
                                                }`} />
                                            <p className={`font-medium text-sm ${result.failed === 0 ? "text-green-400" : "text-yellow-400"
                                                }`}>
                                                {result.message}
                                            </p>
                                        </div>
                                        <div className="flex gap-4 text-xs text-zinc-400">
                                            <span>Sendt: {result.success}</span>
                                            <span>Fejlede: {result.failed}</span>
                                            <span>Total: {result.total}</span>
                                        </div>
                                        {result.errors && result.errors.length > 0 && (
                                            <div className="mt-3 p-2 rounded bg-zinc-900/50 text-xs text-red-400 font-mono">
                                                {result.errors.map((err, i) => (
                                                    <div key={i}>{err}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={sending || !subject.trim() || !body.trim()}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        {sending ? "Sender..." : "Send til alle brugere"}
                                    </button>
                                </div>
                            </form>
                        </Box>
                    </div>

                    {/* Sidebar info */}
                    <div>
                        <Box>
                            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                Information
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">
                                        Afsender
                                    </p>
                                    <p className="text-white font-mono text-xs">
                                        noreply@pins.dk
                                    </p>
                                </div>
                                <div className="h-px bg-zinc-800" />
                                <div>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">
                                        Modtagere
                                    </p>
                                    <p className="text-zinc-400 text-xs">
                                        Alle registrerede brugere
                                    </p>
                                </div>
                                <div className="h-px bg-zinc-800" />
                                <div>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">
                                        Passende brug
                                    </p>
                                    <ul className="text-zinc-400 text-xs space-y-1 mt-1">
                                        <li>- Sikkerhedsopdateringer</li>
                                        <li>- Vilkårsændringer (ToS)</li>
                                        <li>- Kritiske systembeskeder</li>
                                        <li>- Vedligeholdelsesnotifikationer</li>
                                    </ul>
                                </div>
                                <div className="h-px bg-zinc-800" />
                                <div>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">
                                        Formatering
                                    </p>
                                    <ul className="text-zinc-400 text-xs space-y-1 mt-1 font-mono">
                                        <li>**fed**</li>
                                        <li>*kursiv*</li>
                                        <li>[tekst](url)</li>
                                    </ul>
                                </div>
                            </div>
                        </Box>
                    </div>
                </div>
            </div>

            {/* Bekræftelsesdialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">
                                Bekræft afsendelse
                            </h3>
                        </div>

                        <p className="text-zinc-400 text-sm mb-2">
                            Du er ved at sende en email til <strong className="text-white">alle brugere</strong> på platformen.
                        </p>

                        <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Emne</p>
                            <p className="text-white text-sm">{subject}</p>
                        </div>

                        <p className="text-zinc-500 text-xs mb-4">
                            Denne handling kan ikke fortrydes.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                            >
                                Annuller
                            </button>
                            <button
                                onClick={handleConfirmSend}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                            >
                                Send broadcast
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
