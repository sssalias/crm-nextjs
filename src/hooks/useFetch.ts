'use client'

import { useState, useEffect } from 'react'

interface FetchOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: string | Record<string, any>
}

export function useFetch<T = any>(
    url: string,
    initialOptions?:
        | FetchOptions
        | {
            method?: 'POST' | 'PATCH' | 'DELETE'
            body?: string | Record<string, any>
        }
): {
    data: T | null
    loading: boolean
    error: string | null
    execute: (opts?: FetchOptions) => Promise<T & { error?: string }>
} {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const execute = async (opts?: FetchOptions) => {
        setLoading(true)
        setError(null)

        try {
            const options: RequestInit = {
                method: opts?.method || initialOptions?.method || 'GET',
                headers: { 'Content-Type': 'application/json' },
            }

            let body = opts?.body || initialOptions?.body
            if (body) {
                options.body = typeof body === 'string' ? body : JSON.stringify(body)
            }

            const res = await fetch(url, options)
            const json = await res.json()

            if (!res.ok) {
                throw new Error(json.error || `Request failed: ${res.status}`)
            }

            setData(json)
            return json
        } catch (err: any) {
            const msg = err.message || 'Unknown error'
            setError(msg)
            return { error: msg } as any
        } finally {
            setLoading(false)
        }
    }

    // Auto-fetch on mount if method is GET (default)
    useEffect(() => {
        if (!initialOptions || initialOptions.method === 'GET' || !initialOptions.method) {
            execute()
        } else {
            setLoading(false)
        }
    }, [url])

    return { data, loading, error, execute }
}
