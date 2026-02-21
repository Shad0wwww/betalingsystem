'use client';

import { useState, useEffect } from "react";
import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { SkeletonCard } from "@/components/utils/SkeletonCard";
import RegisterShipModal from "../modals/RegisterShipModal";
import toast, { Toaster } from "react-hot-toast";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full border rounded-md p-2 border-[#292828] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 ${props.className}`}
    />
);

async function fetchUserFullName() {
    const res = await fetch(`/api/user/me`);
    return res.json();
}

async function updateUserFullName(name: string) {
    const res = await fetch(`/api/user/update-name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });
    return res.json();
}

export default function SettingsClient({ dict }: { dict: any }) {
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<string>("");
    

    useEffect(() => {
        setLoading(true);
        fetchUserFullName().then((data) => {
            setName(data.name);
            setEmail(data.email);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto mt-10">
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
                    dialog={<RegisterShipModal />}
                    footerText=""
                    buttonText=""
                />


                <SettingsCard
                    title={dict.dashboard.settings.fullname}
                    description={dict.dashboard.settings.fullnameDescription}
                    buttonText={dict.dashboard.settings.saveChanges}
                    disabled={(!name || name.length === 0)}
                    onAction={async () => {
                        await updateUserFullName(name);
                        setName(name);
                        toast.success(dict.dashboard.settings.fullnameUpdatedToast);
                    }}
                >
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={dict.dashboard.settings.fullnamePlaceholder}
                    />
                </SettingsCard>

                <SettingsCard
                    title={dict.dashboard.settings.email}
                    description={dict.dashboard.settings.emailDescription}
                    buttonText={dict.dashboard.settings.saveChanges}
                    onAction={() => console.log("Changing email...")}
                    disabled={(!email || email.length === 0)}
                >
                    <Input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={dict.dashboard.settings.emailPlaceholder}
                    />
                </SettingsCard>

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