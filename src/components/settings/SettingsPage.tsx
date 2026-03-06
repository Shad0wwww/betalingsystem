'use client';

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { SkeletonCard } from "@/components/utils/SkeletonCard";
import RegisterShipModal from "../modals/RegisterShipModal";
import ChangeEmail from "../modals/ChangeEmailModal";

// --- Types ---
interface Ship {
    id?: string;
    name: string;
    model: string;
}

interface UserData {
    name: string;
    email: string;
}

// --- Shared input component ---
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full border rounded-lg px-3 py-2 bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors duration-150 ${props.className ?? ""}`}
    />
);

const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// --- API helpers ---
async function fetchUserData(): Promise<UserData> {
    const res = await fetch(`/api/user/me`);
    if (!res.ok) throw new Error("Kunne ikke hente brugerdata");
    return res.json();
}

async function updateUserFullName(name: string) {
    const res = await fetch(`/api/user/update-name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Kunne ikke opdatere navnet");
    return res.json();
}

async function fetchUserShips(): Promise<Ship[]> {
    const res = await fetch(`/api/boat/myboats`);
    if (!res.ok) throw new Error("Kunne ikke hente skibe");
    const data = await res.json();
    return data.map((ship: any) => ({
        id: ship.id,
        name: ship.kaldeNavn,
        model: ship.skibModel,
    }));
}

async function requestEmailChangeOtp(newEmail: string) {
    const res = await fetch(`/api/user/update-email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
    });
    if (!res.ok) throw new Error("Kunne ikke sende OTP koder");
    return res.json();
}

// --- Main component ---
export default function SettingsClient({ dict }: { dict: any }) {
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [oldEmail, setOldEmail] = useState("");
    const [email, setEmail] = useState("");
    const [isRequestingEmail, setIsRequestingEmail] = useState(false);
    const [ships, setShips] = useState<Ship[]>([]);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            try {
                const [userData, shipData] = await Promise.all([
                    fetchUserData(),
                    fetchUserShips(),
                ]);
                if (isMounted) {
                    setName(userData.name);
                    setOldEmail(userData.email);
                    setEmail(userData.email);
                    setShips(shipData);
                }
            } catch {
                toast.error("Der opstod en fejl ved hentning af data.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    const handleSaveName = async () => {
        try {
            await updateUserFullName(name);
            toast.success(dict.dashboard.settings.fullnameUpdatedToast);
        } catch {
            toast.error("Der skete en fejl. Prøv igen.");
        }
    };

    const isEmailReadyToChange =
        email.trim().toLowerCase() !== oldEmail.trim().toLowerCase() &&
        isValidEmail(email);

    const handleEmailRequest = async () => {
        setIsRequestingEmail(true);
        try {
            await requestEmailChangeOtp(email);
            toast.success("Engangskoder er sendt til begge emails!");
        } catch {
            toast.error("Der skete en fejl. Kunne ikke sende koder.");
            throw new Error("OTP send failed");
        } finally {
            setIsRequestingEmail(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto mt-10 px-4">
                <SkeletonCard noBorderBottom={true} />
                <div className="border border-white/[0.07] rounded-b-xl overflow-hidden">
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4">
            <Toaster />
            {/* Page header */}
            <div className="max-w-3xl mx-auto pt-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        Dashboard
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">{dict?.dashboard?.settings?.title ?? "Indstillinger"}</h1>
                <p className="text-zinc-500 text-sm mt-1">{dict?.dashboard?.settings?.subtitle ?? "Administrér din konto og dine skibe."}</p>
            </div>

            <div className="flex flex-col max-w-3xl mx-auto gap-6">

                {/* Ships */}
                <SettingsCard
                    title={dict.dashboard.settings.registerBoat}
                    description={dict.dashboard.settings.registerBoatDescription}
                    dialog={ships.length < 2 ? <RegisterShipModal onSuccess={(newShip) => setShips([...ships, newShip])} /> : null}
                    footerText={ships.length >= 2 ? dict.dashboard.settings.shipLimitReached : ""}
                >
                    {ships.length > 0 ? (
                        <div className="overflow-hidden border border-white/[0.07] rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/[0.03] text-white/30 uppercase text-[10px] tracking-widest border-b border-white/[0.07]">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">{dict.dashboard.settings.shipName}</th>
                                        <th className="px-4 py-3 font-medium">{dict.dashboard.settings.shipModel}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {ships.map((ship, index) => (
                                        <tr key={ship.id ?? index}>
                                            <td className="px-4 py-3 font-medium text-white">{ship.name}</td>
                                            <td className="px-4 py-3 text-white/45">{ship.model}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-white/30 text-sm italic">{dict.dashboard.settings.noShipsRegistered}</p>
                    )}
                </SettingsCard>

                {/* Full name */}
                <SettingsCard
                    title={dict.dashboard.settings.fullname}
                    description={dict.dashboard.settings.fullnameDescription}
                    buttonText={dict.dashboard.settings.saveChanges}
                    disabled={!name.trim()}
                    onAction={handleSaveName}
                >
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={dict.dashboard.settings.fullnamePlaceholder}
                    />
                </SettingsCard>

                {/* Email */}
                <SettingsCard
                    title={dict.dashboard.settings.email}
                    description={dict.dashboard.settings.emailDescription}
                    disabled={!isEmailReadyToChange || isRequestingEmail}
                    dialog={
                        <ChangeEmail
                            dict={dict}
                            newEmail={email}
                            oldEmail={oldEmail}
                            disabled={!isEmailReadyToChange || isRequestingEmail}
                            onAction={handleEmailRequest}
                        />
                    }
                >
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={dict.dashboard.settings.emailPlaceholder}
                        className={!isValidEmail(email) && email.length > 0 ? "border-red-500/50 focus:ring-red-500/50" : ""}
                    />
                </SettingsCard>

                {/* Delete account */}
                <SettingsCard
                    title={dict.dashboard.settings.deleteAccount}
                    description={dict.dashboard.settings.deleteAccountDescription}
                    buttonText={dict.dashboard.settings.deleteAccountButton}
                    onAction={() => console.log("Deleting account...")}
                    variant="danger"
                />
                <div className="mb-6" />
            </div>
        </div>
    );
}