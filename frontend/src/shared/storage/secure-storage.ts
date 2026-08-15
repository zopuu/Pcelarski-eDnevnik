function getStorage():
    Storage | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.sessionStorage;
}

export async function getSecureItem(
    key: string,
): Promise<string | null> {
    return getStorage()?.getItem(key) ?? null;
}

export async function setSecureItem(
    key: string,
    value: string,
): Promise<void> {
    getStorage()?.setItem(key, value);
}

export async function deleteSecureItem(
    key: string,
): Promise<void> {
    getStorage()?.removeItem(key);
}