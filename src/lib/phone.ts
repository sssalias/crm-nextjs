export function normalizePhoneForDB(phone: string): string {
    if (!phone) return ''
    // Keep only digits for storage (no plus, no spaces, no dashes)
    return phone.replace(/\D/g, '')
}

export function isValidPhoneInput(phone: string): boolean {
    // allow spaces for readability, strip them before testing
    const compact = phone.replace(/\s+/g, '')
    // Expect a plus and 6-15 digits (international-like)
    return /^\+\d{6,15}$/.test(compact)
}

export function ensurePlusPrefix(phone: string): string {
    if (!phone) return ''
    const digits = phone.replace(/\D/g, '')
    return '+' + digits
}

/**
 * Format a phone number for display with simple spacing.
 * The result keeps only digits and leading plus, then inserts
 * spaces after country code and every 3-4 digits for readability.
 * Example: "+79990000001" -> "+7 999 000 0001"
 */
export function formatPhoneForDisplay(phone: string): string {
    if (!phone) return ''
    // ensure plus and digits only
    let normalized = ensurePlusPrefix(phone)
    // split into plus, country and rest
    const match = normalized.match(/^(\+\d{1,3})(\d*)$/)
    if (!match) return normalized
    const [, country, rest] = match
    // group rest by 3's
    const groups = rest.match(/\d{1,3}/g) || []
    return [country, ...groups].join(' ').trim()
}
