import bcrypt from 'bcryptjs'
import jwt, { type Secret } from 'jsonwebtoken'
import { parse as parseCookie, serialize as serializeCookie } from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'
const COOKIE_NAME = process.env.COOKIE_NAME ?? 'crm_token'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'
const COOKIE_MAX_AGE = Number(process.env.COOKIE_MAX_AGE ?? 7 * 24 * 60 * 60) // seconds

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash)
}

export function signToken(payload: object) {
    return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string) {
    return (jwt as any).verify(token, JWT_SECRET) as any
}

export function serializeAuthCookie(token: string) {
    return serializeCookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    })
}

export function clearAuthCookie() {
    return serializeCookie(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
    })
}

export function parseTokenFromCookieHeader(cookieHeader?: string) {
    if (!cookieHeader) return undefined
    const parsed = parseCookie(cookieHeader || '')
    return parsed[COOKIE_NAME]
}
