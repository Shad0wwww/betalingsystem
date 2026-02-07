import prisma from "@/lib/prisma"

export default async function DoesEmailExist(
    email: string
) {
    return await prisma.user.findUnique({
        where: {
            email,
        },
    });

}