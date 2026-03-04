'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@/entities/User'

export function useUser() {
    const [user, setUser] = useState<(User & { id: number; role: string }) | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUser = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/auth/me')
            const data = await res.json()
            if (res.ok) {
                setUser(data.user)
                setError(null)
            } else {
                setUser(null)
                setError(data.error || 'Failed to fetch user')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    return { user, loading, error, refetch: fetchUser }
}
