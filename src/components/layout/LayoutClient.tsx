'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser()
    const router = useRouter()
    const pathname = usePathname()

    // These pages don't require authentication
    const publicPages = ['/login', '/register']
    const isPublicPage = publicPages.includes(pathname)

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.refresh()
        router.push('/login')
    }

    if (loading) return <div className="p-4">Загружаю...</div>

    // Show public pages without authentication check
    if (isPublicPage) {
        return <>{children}</>
    }

    return (
        <>
            {user ? (
                <div className="flex min-h-screen">
                    {/* Навигация по боковой панели */}
                    <nav className="w-64 bg-white shadow-lg p-4">
                        <div className="mb-8">
                            <h1 className="text-xl font-bold text-blue-600">CRM Система</h1>
                            <p className="text-sm text-gray-600 mt-1">{user.fullName}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                        </div>

                        <ul className="space-y-2">
                            <li>
                                <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-100">
                                    Дашборд
                                </Link>
                            </li>

                            {(user.role === 'OPERATOR' || user.role === 'ADMIN') && (
                                <>
                                    <li>
                                        <Link href="/shifts" className="block px-4 py-2 rounded hover:bg-gray-100">
                                            Смены
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/orders/new" className="block px-4 py-2 rounded hover:bg-gray-100">
                                            Создать заказ
                                        </Link>
                                    </li>
                                </>
                            )}

                            {user.role === 'MASTER' && (
                                <li>
                                    <Link href="/my-orders" className="block px-4 py-2 rounded hover:bg-gray-100">
                                        Мои заказы
                                    </Link>
                                </li>
                            )}

                            {user.role === 'CLIENT' && (
                                <>
                                    <li>
                                        <Link href="/services" className="block px-4 py-2 rounded hover:bg-gray-100">
                                            Обзор услуг
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/my-orders" className="block px-4 py-2 rounded hover:bg-gray-100">
                                            Мои заказы
                                        </Link>
                                    </li>
                                </>
                            )}

                            <li>
                                <Link href="/orders" className="block px-4 py-2 rounded hover:bg-gray-100">
                                    Все заказы
                                </Link>
                            </li>

                            <li className="pt-4">
                                <button onClick={handleLogout} className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                    Выход
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Основное содержимое */}
                    <main className="flex-1 p-8">{children}</main>
                </div>
            ) : (
                <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-blue-600 mb-4">CRM Система</h1>
                            <p className="text-gray-600">Пожалуйста, войдите или зарегистрируйтесь</p>
                        </div>
                        <div className="space-x-4">
                            <Link href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Войти
                            </Link>
                            <Link href="/register" className="inline-block px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">
                                Регистрация
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
