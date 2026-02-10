import jwt from "jsonwebtoken";


export async function generateJsonWebtoken(
    userId: string, 
    email: string
) {
    return jwt.sign(
        { userId, email }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: "1d" }
    );
}

export async function verifyJsonWebtoken(
    token: string
) {
    return jwt.verify(
        token,
        process.env.JWT_SECRET as string
    )
}
    