import { sendEmail } from "@/lib/emailer/Mail";
import { generateHtmlOTP } from "@/lib/emailer/MailCreator";
import prisma from "@/lib/prisma";
import DoesEmailExist from "@/lib/users/DoesEmailExist";
import { validateEmail } from "@/lib/utils/Email";
import { generateCode, hashOTPCode } from "@/lib/utils/OTP";


export async function POST(
    request: Request
) {
    const {
        email,
    } = await request.json();


    if (!(await validateEmail(email))) {
        return Response.json(
            {
                error: "Invalid email"
            }, { status: 400 }
        );
    }

    const doesEmailExist = await DoesEmailExist(email);

    if (!doesEmailExist) {
        return Response.json({ error: "Email does not exist" }, { status: 400 });
    }

    const userid = await prisma.user.findUnique({
        where: {
            email
        }, select: {
            id: true,
        }
    });

    const code = await generateCode();

    // SEND EMAIL WITH CODE TO USER
    await sendEmail(
        email,
        "Her er din engangskode",
        generateHtmlOTP(code)
    );


    const hashedCode = await hashOTPCode(code);

    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.upsert({
        where: {
            identifier: email 
        },
        update: {
            token: hashedCode,
            expires: expires,
        },
        create: {
            identifier: email,
            token: hashedCode,
            userId: userid!.id,
            expires: expires,
        },
    });


    return Response.json({ success: true });

}