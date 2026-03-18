'use client';

import { useState, useEffect } from "react";
import { Monitor, Smartphone, Globe, LogOut, Shield } from "lucide-react";
import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { getMySessions, logoutSession, logoutAllOtherSessions, SessionInfo } from "@/lib/actions/settings";
import toast from "react-hot-toast";

interface ActiveSessionsCardProps {
    dict: any;
}

function getDeviceIcon(userAgent: string) {
    const ua = userAgent.toLowerCase();
    if (ua.includes("android") || ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
        return <Smartphone className="w-5 h-5 text-blue-400" />;
    }
    return <Monitor className="w-5 h-5 text-blue-400" />;
}

function formatDate(date: Date, locale: string = "da-DK"): string {
    return new Date(date).toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ActiveSessionsCard({ dict }: ActiveSessionsCardProps) {
    const [sessions, setSessions] = useState<SessionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState<string | null>(null);

    const t = dict.dashboard.settings.sessions;

    useEffect(() => {
        loadSessions();
    }, []);

    async function loadSessions() {
        try {
            const data = await getMySessions();
            setSessions(data);
        } catch {
            toast.error("Could not load sessions");
        } finally {
            setLoading(false);
        }
    }

    async function handleLogoutSession(sessionId: string) {
        setLogoutLoading(sessionId);
        try {
            await logoutSession(sessionId);
            setSessions(sessions.filter((s) => s.id !== sessionId));
            toast.success(t.sessionLoggedOut);
        } catch {
            toast.error("Could not logout session");
        } finally {
            setLogoutLoading(null);
        }
    }

    async function handleLogoutAll() {
        setLogoutLoading("all");
        try {
            await logoutAllOtherSessions();
            setSessions(sessions.filter((s) => s.isCurrentSession));
            toast.success(t.allSessionsLoggedOut);
        } catch {
            toast.error("Could not logout sessions");
        } finally {
            setLogoutLoading(null);
        }
    }

    const otherSessions = sessions.filter((s) => !s.isCurrentSession);
    const currentSession = sessions.find((s) => s.isCurrentSession);

    return (
        <SettingsCard
            title={t.title}
            description={t.description}
        >
            <div className="space-y-3">
                {/* Current session */}
                {currentSession && (
                    <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                {getDeviceIcon(currentSession.userAgent || "")}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-white text-sm">
                                        {currentSession.userAgent || t.unknownDevice}
                                    </span>
                                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        {t.thisDevice}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-white/40 text-xs">
                                    {currentSession.ipAddress && (
                                        <span className="flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            {currentSession.ipAddress}
                                        </span>
                                    )}
                                    <span>
                                        {t.loggedInAt}: {formatDate(currentSession.createdAt)}
                                    </span>
                                </div>
                            </div>
                            <div className="p-2">
                                <Shield className="w-4 h-4 text-green-400" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Other sessions */}
                {loading ? (
                    <div className="space-y-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white/10" />
                                    <div className="flex-1">
                                        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-48 bg-white/5 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : otherSessions.length > 0 ? (
                    <>
                        <div className="space-y-2">
                            {otherSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-white/[0.05]">
                                            {getDeviceIcon(session.userAgent || "")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium text-white text-sm">
                                                {session.userAgent || t.unknownDevice}
                                            </span>
                                            <div className="flex items-center gap-3 mt-1 text-white/40 text-xs">
                                                {session.ipAddress && (
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {session.ipAddress}
                                                    </span>
                                                )}
                                                <span>
                                                    {t.loggedInAt}: {formatDate(session.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleLogoutSession(session.id)}
                                            disabled={logoutLoading === session.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            {t.logoutSession}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Logout all button */}
                        <div className="pt-3 border-t border-white/[0.07]">
                            <button
                                onClick={handleLogoutAll}
                                disabled={logoutLoading === "all"}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <LogOut className="w-4 h-4" />
                                {t.logoutAllSessions}
                            </button>
                            <p className="text-center text-white/30 text-xs mt-2">
                                {t.logoutAllDescription}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] text-center">
                        <p className="text-white/40 text-sm">{t.noOtherSessions}</p>
                    </div>
                )}
            </div>
        </SettingsCard>
    );
}
