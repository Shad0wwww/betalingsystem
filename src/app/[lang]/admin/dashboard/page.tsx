
import { getCurrentUserIdFromToken } from "@/lib/jwt/Session";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";


export default async function AdminPage() {
    const user = await getCurrentUserIdFromToken();

    if (!user || user.role.toLowerCase() !== Role.ADMIN) {
        redirect("/login");
    }

    return <div>Admin panel</div>;
}