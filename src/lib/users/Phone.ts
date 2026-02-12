import prisma from "../prisma";

export async function validatePhone(
    phone: string,
    country: string
) {
    const doesPhoneExist = await prisma.user.findFirst({
        where: {
            phone,
            phoneCountry: country,
        },
    });
    return doesPhoneExist !== null;
}
