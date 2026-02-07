import prisma from "@/lib/prisma";
import DoesEmailExist from "@/lib/users/DoesEmailExist";

export async function POST(
    req: Request
) {
    const { 
        name, 
        email, 
        phone 
    } = await req.json();

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


