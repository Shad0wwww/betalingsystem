'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { SkeletonCard } from "@/components/utils/SkeletonCard";
import RegisterShipModal from "../modals/RegisterShipModal";
import EditShipNameModal from "../modals/EditShipNameModal";
import ChangeEmail from "../modals/ChangeEmailModal";
import ActiveSessionsCard from "./ActiveSessionsCard";
import { getMe, getMyBoats } from "@/lib/actions/dashboard";
import { updateName, sendEmailChangeOtp, deleteAccount } from "@/lib/actions/settings";
import { deleteBoat } from "@/lib/actions/boat-actions";

// --- Types ---
interface Ship {
    id: number;
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

// --- Main component ---
export default function SettingsClient({ dict }: { dict: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [oldEmail, setOldEmail] = useState("");
    const [email, setEmail] = useState("");
    const [isRequestingEmail, setIsRequestingEmail] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [ships, setShips] = useState<Ship[]>([]);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            try {
                const [userData, shipData] = await Promise.all([
                    getMe(),
                    getMyBoats(),
                ]);
                if (isMounted) {
                    setName(userData.name);
                    setOldEmail(userData.email);
                    setEmail(userData.email);
                    setShips(shipData.map((s: any) => ({ id: s.id, name: s.kaldeNavn, model: s.skibModel })));
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
            await updateName(name);
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
            await sendEmailChangeOtp(email);
            toast.success("Engangskoder er sendt til begge emails!");
        } catch {
            toast.error("Der skete en fejl. Kunne ikke sende koder.");
            throw new Error("OTP send failed");
        } finally {
            setIsRequestingEmail(false);
        }
    };

    const handleDeleteAccountClick = () => {
        setShowDeleteConfirm(true);
        setDeleteConfirmText("");
    };

    const handleShipNameUpdated = (updatedShip: { id: number; name: string }) => {
        setShips((prev) =>
            prev.map((ship) =>
                ship.id === updatedShip.id ? { ...ship, name: updatedShip.name } : ship,
            ),
        );
        toast.success(dict?.dashboard?.settings?.shipNameUpdatedToast ?? "Bådens navn er opdateret.");
    };

    const handleDeleteShip = async (shipId: number) => {
        const confirmed = window.confirm(
            dict?.dashboard?.settings?.deleteShipConfirm ?? "Er du sikker på, at du vil slette denne båd?",
        );

        if (!confirmed) return;

        try {
            await deleteBoat(shipId);

            setShips((prev) => prev.filter((ship) => ship.id !== shipId));
            toast.success(dict?.dashboard?.settings?.shipDeletedToast ?? "Båden er slettet.");
        } catch (err: any) {
            toast.error(err.message || (dict?.dashboard?.settings?.genericError ?? "Der skete en fejl. Prøv igen."));
        }
    };

    const handleDeleteAccountConfirm = async () => {
        const expectedText = dict.dashboard.settings.deleteAccount === "Slet konto" 
            ? "SLET MIN KONTO" 
            : dict.dashboard.settings.deleteAccount === "Delete account"
            ? "DELETE MY ACCOUNT"
            : "KONTO LÖSCHEN";

        if (deleteConfirmText.trim() !== expectedText) {
            toast.error(dict.dashboard.settings.deleteAccountErrorMismatch);
            return;
        }

        setIsDeletingAccount(true);
        try {
            await deleteAccount();
            toast.success(dict.dashboard.settings.accountDeletedToast);
            // Redirect to home page after successful deletion
            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch (error) {
            toast.error("Der skete en fejl ved sletning af konto. Prøv igen.");
        } finally {
            setIsDeletingAccount(false);
            setShowDeleteConfirm(false);
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
                    dialog={
                        ships.length < 2
                            ? (
                                <RegisterShipModal
                                    onSuccess={(newShip) => {
                                        const normalizedShip: Ship = {
                                            id: typeof newShip.id === "number" ? newShip.id : Date.now(),
                                            name: newShip.name,
                                            model: newShip.model,
                                        };
                                        setShips((prev) => [...prev, normalizedShip]);
                                    }}
                                />
                            )
                            : null
                    }
                    footerText={ships.length >= 2 ? dict.dashboard.settings.shipLimitReached : ""}
                >
                    {ships.length > 0 ? (
                        <div className="overflow-hidden border border-white/[0.07] rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/[0.03] text-white/30 uppercase text-[10px] tracking-widest border-b border-white/[0.07]">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">{dict.dashboard.settings.shipName}</th>
                                        <th className="px-4 py-3 font-medium">{dict.dashboard.settings.shipModel}</th>
                                        <th className="px-4 py-3 font-medium">{dict?.dashboard?.settings?.actions ?? "Handlinger"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {ships.map((ship, index) => (
                                        <tr key={ship.id ?? index}>
                                            <td className="px-4 py-3 font-medium text-white">{ship.name}</td>
                                            <td className="px-4 py-3 text-white/45">{ship.model}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <EditShipNameModal
                                                        boatId={ship.id}
                                                        currentName={ship.name}
                                                        dict={dict}
                                                        onSuccess={handleShipNameUpdated}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteShip(ship.id)}
                                                        className="rounded-md border border-red-500/35 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-100"
                                                    >
                                                        {dict?.dashboard?.settings?.deleteShipButton ?? "Slet"}
                                                    </button>
                                                </div>
                                            </td>
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

                {/* Active sessions */}
                <ActiveSessionsCard dict={dict} />

                {/* Delete account */}
                <SettingsCard
                    title={dict.dashboard.settings.deleteAccount}
                    description={dict.dashboard.settings.deleteAccountDescription}
                    buttonText={dict.dashboard.settings.deleteAccountButton}
                    onAction={handleDeleteAccountClick}
                    disabled={isDeletingAccount}
                    variant="danger"
                />
                <div className="mb-6" />
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        {/* Title */}
                        <h2 className="text-xl font-bold text-white mb-4">
                            {dict.dashboard.settings.deleteAccountConfirmTitle}
                        </h2>

                        {/* Warnings */}
                        <div className="space-y-2 mb-6 text-sm text-red-300 border border-red-500/20 bg-red-500/5 rounded-lg p-4">
                            <p className="font-semibold">{dict.dashboard.settings.deleteAccountConfirmWarning1}</p>
                            <p>{dict.dashboard.settings.deleteAccountConfirmWarning2}</p>
                            <p>{dict.dashboard.settings.deleteAccountConfirmWarning3}</p>
                            <p>{dict.dashboard.settings.deleteAccountConfirmWarning4}</p>
                            <p>{dict.dashboard.settings.deleteAccountConfirmWarning5}</p>
                        </div>

                        {/* Confirmation Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white mb-2">
                                {dict.dashboard.settings.deleteAccountConfirmQuestion}
                            </label>
                            <Input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="SLET MIN KONTO"
                                className="uppercase"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeletingAccount}
                                className="flex-1 px-4 py-2 rounded-lg border border-white/[0.08] text-white hover:bg-white/[0.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {dict.dashboard.settings.deleteAccountCancel}
                            </button>
                            <button
                                onClick={handleDeleteAccountConfirm}
                                disabled={isDeletingAccount || deleteConfirmText.trim() === ""}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeletingAccount ? "Sletter..." : dict.dashboard.settings.deleteAccountConfirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        
    );
}