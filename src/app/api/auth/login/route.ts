import DoesEmailExist from "@/lib/users/DoesEmailExist";
import { validateEmail } from "@/lib/utils/Email";


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

    



}