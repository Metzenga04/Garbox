function getUserIdFromCookie(req) {
    const cookie = req.headers.cookie;
    if (!cookie) return null;

    console.log('Cookies:', cookie);

    const cookieArray = cookie.split(';');
    for (const cookieItem of cookieArray) {
        const [name, value] = cookieItem.trim().split('=');
        if (name === 'userId') {
            return value;
        }
    }
    return null;
}

