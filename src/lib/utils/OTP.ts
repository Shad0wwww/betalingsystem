import bcrypt from 'bcrypt';

export async function generateCode(
) {
    return (Math.random() + 1).toString(36).slice(-6).toString().toUpperCase();
}

export async function hashOTPCode(
    code: string
) {
    return await bcrypt.hash(code, 10);
}

export async function verifyOTPCode(
    code: string,
    hashedCode: string
) {
    return await bcrypt.compare(code, hashedCode);
}