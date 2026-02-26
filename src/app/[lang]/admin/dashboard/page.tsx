
import { cookies } from "next/headers";
import { getCurrentUserIdFromToken } from "@/lib/jwt/Session";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";


export default async function AdminPage() {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value ?? null;
    const user = await getCurrentUserIdFromToken(token);

    if (!user || user.role.toLowerCase() !== Role.ADMIN) {
        redirect("/login");
    }

    return <div>Admin panel</div>;
}