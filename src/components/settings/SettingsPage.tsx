'use client';

import { useState, useEffect } from "react";
import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { SkeletonCard } from "@/components/utils/SkeletonCard";
import RegisterShipModal from "../modals/RegisterShipModal";
import toast, { Toaster } from "react-hot-toast";


interface Ship {
    id?: string; // Anbefalet at have et unikt ID
    name: string;
    model: string;
}

interface UserData {
    name: string;
    email: string;
}

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full border rounded-md p-2 border-[#292828] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 ${props.className || ""}`}
    />
);

// 2. Tilføj basal fejlhåndtering til dine API-kald
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

    const mappedShips = data.map((ship: any) => ({
        id: ship.id,
        name: ship.kaldeNavn, 
        model: ship.skibModel 
    }));

    return mappedShips;
}

export default function SettingsClient(
    { dict }: { dict: any }
) {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [ships, setShips] = useState<Ship[]>([]);
    const [loading, setLoading] = useState(true);

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
                    setEmail(userData.email);
                    setShips(shipData);
                }
            } catch (error) {
                console.error(error);
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
        } catch (error) {
            toast.error("Der skete en fejl. Prøv igen.");
        }
    };

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

    return (
        <div className="min-h-screen px-4">
            <div><Toaster /></div>
            <div className="flex flex-col max-w-3xl mx-auto mt-2 gap-10">

                {/* Register boat */}
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

                {/* Full Name */}
                <SettingsCard
                    title={dict.dashboard.settings.fullname}
                    description={dict.dashboard.settings.fullnameDescription}
                    buttonText={dict.dashboard.settings.saveChanges}
                    disabled={!name.trim()} // .trim() sørger for man ikke kan gemme "    "
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
                    buttonText={dict.dashboard.settings.saveChanges}
                    onAction={() => console.log("Changing email...")}
                    disabled={!email.trim()}
                >
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={dict.dashboard.settings.emailPlaceholder}
                    />
                </SettingsCard>

                {/* Delete Account */}
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

