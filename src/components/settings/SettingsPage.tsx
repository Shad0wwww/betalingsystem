'use client';

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { SkeletonCard } from "@/components/utils/SkeletonCard";
import RegisterShipModal from "../modals/RegisterShipModal";
import ChangeEmail from "../modals/ChangeEmailModal";

// ==========================================
// 1. TYPER & INTERFACES
// ==========================================
interface Ship {
    id?: string;
    name: string;
    model: string;
}

interface UserData {
    name: string;
    email: string;
}

// ==========================================
// 2. HJÆLPE-KOMPONENTER & FUNKTIONER
// ==========================================
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full border rounded-md p-2 border-[#292828] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 ${props.className || ""}`}
    />
);

const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// ==========================================
// 3. API KALD (Uafhængige af komponenten)
// ==========================================
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
        model: ship.skibModel
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

// ==========================================
// 4. HOVEDKOMPONENT
// ==========================================
export default function SettingsClient({ dict }: { dict: any }) {
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState<string>("");

    // Email states
    const [oldEmail, setOldEmail] = useState<string>("");
    const [email, setEmail] = useState<string>(""); // Den brugeren taster i
    const [isRequestingEmail, setIsRequestingEmail] = useState(false);

    // Skib states
    const [ships, setShips] = useState<Ship[]>([]);

    // --- EFFECT (Data Hentning) ---
    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            try {
                const [userData, shipData] = await Promise.all([
                    fetchUserData(),
                    fetchUserShips()
                ]);
                if (isMounted) {
                    setName(userData.name);
                    setOldEmail(userData.email); // Gemmer den oprindelige email én gang
                    setEmail(userData.email);    // Sætter inputfeltets startværdi
                    setShips(shipData);
                }
            } catch (error) {
                toast.error("Der opstod en fejl ved hentning af data.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, []);

    // --- HANDLERS (Handlinger) ---
    const handleSaveName = async () => {
        try {
            await updateUserFullName(name);
            toast.success(dict.dashboard.settings.fullnameUpdatedToast);
        } catch (error) {
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
        } catch (error) {
            toast.error("Der skete en fejl. Kunne ikke sende koder.");
            throw error; // Kaster fejlen videre, så modalen ikke åbner
        } finally {
            setIsRequestingEmail(false);
        }
    };

    // --- RENDER LOAD STATE ---
    if (loading) {
        return (
            <div className="max-w-3xl mx-auto mt-10 px-4">
                <SkeletonCard noBorderBottom={true} />
                <div className="border border-[#252424] rounded-b-lg overflow-hidden">
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    // --- RENDER HOVEDVISNING ---
    return (
        <div className="min-h-screen px-4">
            <div><Toaster /></div>
            <div className="flex flex-col max-w-3xl mx-auto mt-2 gap-10">

                {/* 1. SKIBE */}
                <SettingsCard
                    title={dict.dashboard.settings.registerBoat}
                    description={dict.dashboard.settings.registerBoatDescription}
                    dialog={ships.length < 2 ? <RegisterShipModal onSuccess={(newShip) => setShips([...ships, newShip])} /> : null}
                    footerText={ships.length >= 2 ? dict.dashboard.settings.shipLimitReached : ""}
                >
                    {ships.length > 0 ? (
                        <div className="mt-4 overflow-hidden border border-[#292828] rounded-lg bg-[#0a0a0a]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#111111] text-zinc-500 uppercase text-[10px] tracking-widest border-b border-[#292828]">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">{dict.dashboard.settings.shipName}</th>
                                        <th className="px-4 py-3 font-medium">{dict.dashboard.settings.shipModel}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#292828]">
                                    {ships.map((ship, index) => (
                                        <tr key={ship.id || index} className="text-zinc-300">
                                            <td className="px-4 py-3 font-medium text-white">{ship.name}</td>
                                            <td className="px-4 py-3 text-zinc-400">{ship.model}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm italic mt-4">{dict.dashboard.settings.noShipsRegistered}</p>
                    )}
                </SettingsCard>

                {/* 2. FULDE NAVN */}
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

                {/* 3. EMAIL */}
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
                        value={email} // <-- FIKSET HER!
                        onChange={(e) => setEmail(e.target.value)} // <-- FIKSET HER!
                        placeholder={dict.dashboard.settings.emailPlaceholder}
                        className={!isValidEmail(email) && email.length > 0 ? "border-red-500/50 focus:ring-red-500" : ""}
                    />
                </SettingsCard>

                {/* 4. SLET KONTO */}
                <SettingsCard
                    title={dict.dashboard.settings.deleteAccount}
                    description={dict.dashboard.settings.deleteAccountDescription}
                    buttonText={dict.dashboard.settings.deleteAccountButton}
                    onAction={() => console.log("Deleting account...")}
                    variant="danger"
                />
            </div>
        </div>
    );
}