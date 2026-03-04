'use client'

import { useRouter } from 'next/navigation'
import { useFetch } from '@/hooks/useFetch'
import Link from 'next/link'
import { useState } from 'react'
import { ensurePlusPrefix, isValidPhoneInput, formatPhoneForDisplay } from '@/lib/phone'

export default function RegisterPage() {
    const router = useRouter()
    const { execute, loading, error } = useFetch('/api/auth/register', { method: 'POST' })
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validationError, setValidationError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')

        if (!fullName || !phone || !password || !confirmPassword) {
            setValidationError('Все поля обязательны')
            return
        }

        if (!isValidPhoneInput(phone)) {
            setValidationError('Некорректный формат телефона. Ожидается: +123456789')
            return
        }

        if (password !== confirmPassword) {
            setValidationError('Пароли не совпадают')
            return
        }

        if (password.length < 6) {
            setValidationError('Пароль должен содержать минимум 6 символов')
            return
        }

        const result = await execute({
            body: JSON.stringify({ fullName, phone, password }),
        })

        if (result?.user) {
            // Обновляем серверное состояние и затем перенаправляем
            router.refresh()
            router.push('/dashboard')
        } else if (result?.error) {
            setValidationError(result.error)
        }
    }

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-green-600 mb-2 text-center">CRM Система</h1>
                <p className="text-gray-600 text-center mb-6">Создать новый аккаунт</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                            placeholder="John Doe"
                        />
                    </div>

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
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                            placeholder="+7 999 000 0001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердить пароль</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
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
                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Уже есть аккаунт?{' '}
                    <Link href="/login" className="text-green-600 hover:underline">
                        Войдите здесь
                    </Link>
                </p>
            </div>
        </div>
    )
}
