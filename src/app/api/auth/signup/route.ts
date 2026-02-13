import 'server-only';
import prisma from "@/lib/prisma";
import DoesEmailExist from "@/lib/users/DoesEmailExist";
import { validatePhone } from "@/lib/users/Phone";
import { validateEmail } from "@/lib/utils/Email";

export async function POST(
    req: Request
) {
    const {
        name,
        email,
        phone,
        phoneCountry,
    } = await req.json();

    if (!name || !email) {
        return Response.json({
            error: "Name and email are required"
        }, { status: 400 });
    }

    if (!(await validateEmail(email))) {
        return Response.json(
            {
                error: "Invalid email"
            }, { status: 400 }
        );
    }


    const doesEmailExist = await DoesEmailExist(email);

    if (doesEmailExist) {
        return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    const doesPhoneExist = await validatePhone(phone, phoneCountry);

    if (doesPhoneExist) {
        return Response.json({ error: "Phone already exists" }, { status: 400 });
    }

    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            phoneCountry,
        },
    });

    return Response.json(user);
}


