import prisma from "@/lib/prisma";
import DoesEmailExist from "@/lib/users/DoesEmailExist";
import { validateEmail } from "@/lib/utils/Email";
import { generateCode, hashOTPCode } from "@/lib/utils/OTP";


export async function GET(
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

    const hashedCode = await hashOTPCode(code);

    const VerificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token: hashedCode,
            expires: new Date(Date.now() + 10 * 60 * 1000), 
            userId: userid!.id,
        }
    });
    



}