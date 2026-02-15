import prisma from "@/lib/prisma"

export default async function DoesEmailExist(
    email: string
) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
    
        return user != null;
    } catch (error) {
        return false;
        
    }
}