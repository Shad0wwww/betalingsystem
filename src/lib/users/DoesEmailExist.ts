import prisma from "@/lib/prisma"

export default async function DoesEmailExist(
    email: string
) {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    return user != null;
}