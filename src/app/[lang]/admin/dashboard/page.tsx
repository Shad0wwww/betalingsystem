import { getCurrentUserIdFromToken } from "@/lib/jwt/Jwt";
import { redirect } from "next/navigation";


export default async function AdminPage() {
    const user = await getCurrentUserIdFromToken();

    if (!user || user.role.toLowerCase() !== "admin") {
        redirect("/login");
    }

    return <div>Admin panel</div>;
}