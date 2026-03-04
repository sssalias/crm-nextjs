'use client'

import { useRouter } from 'next/navigation'
import { useFetch } from '@/hooks/useFetch'
import Link from 'next/link'
import { useState } from 'react'
import { ensurePlusPrefix, isValidPhoneInput, formatPhoneForDisplay } from '@/lib/phone'

export default function LoginPage() {
    const router = useRouter()
    const { execute, loading, error } = useFetch('/api/auth/login', { method: 'POST' })
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [validationError, setValidationError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')

        if (!phone || !password) {
            setValidationError('Телефон и пароль обязательны')
            return
        }

        if (!isValidPhoneInput(phone)) {
            setValidationError('Некорректный формат телефона. Ожидается: +123456789')
            return
        }

        const result = await execute({
            body: JSON.stringify({ phone, password }),
        })

        if (result?.user) {
            // Обновляем состояние и перенаправляем
            window.location.href = '/dashboard'
        } else if (result?.error) {
            setValidationError(result.error)
        }
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">CRM Система</h1>
                <p className="text-gray-600 text-center mb-6">Войдите в свой аккаунт</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                        <input
                            type="tel"
                            pattern="^\+[\d ]{6,20}$"
                            inputMode="tel"
                            value={phone}
                            onChange={(e) => {
                                const raw = ensurePlusPrefix(e.target.value)
                                setPhone(formatPhoneForDisplay(raw))
                            }}
                            onBlur={() => setPhone(formatPhoneForDisplay(ensurePlusPrefix(phone)))}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="+7 999 000 0001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {(error || validationError) && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                            {validationError || error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Нет аккаунта?{' '}
                    <Link href="/register" className="text-blue-600 hover:underline">
                        Зарегистрируйтесь
                    </Link>
                </p>
            </div>
        </div>
    )
}
