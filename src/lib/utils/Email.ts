async function validateEmail(
    email: string
) {
    email = email.toLowerCase();
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

async function validatePhone(
    phone: string
) {
    const re = /^\+?[1-9]\d{1,14}$/;
    return re.test(String(phone));
}

export {
    validateEmail,
    validatePhone
}