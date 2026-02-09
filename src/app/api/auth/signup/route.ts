import prisma from "@/lib/prisma";
import DoesEmailExist from "@/lib/users/DoesEmailExist";
import { validateEmail, validatePhone } from "@/lib/utils/Email";

export async function POST(
    req: Request
) {
    const { 
        name, 
        email, 
        phone 
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

    if (phone && !(await validatePhone(phone))) {
        return Response.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const doesEmailExist = await DoesEmailExist(email);

    if (doesEmailExist) {
        return Response.json({ error: "Email already exists" }, { status: 400 });
    }


    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
        },
    });

    //TODO: Add error handling and validation
    //TODO: Nu skal den sende en engangskode til emailen, og så skal den gemme den i databasen, og så skal den sammenligne den når brugeren indtaster den

    return Response.json(user);
}


