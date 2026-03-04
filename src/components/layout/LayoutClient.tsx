'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import React, { useState } from 'react'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
    const { user, loading, refetch } = useUser()
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Check if device is mobile
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // These pages don't require authentication
    const publicPages = ['/login', '/register']
    const isPublicPage = publicPages.includes(pathname)

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        await refetch() // Обновляем состояние пользователя
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
                <div className="flex min-h-screen bg-gray-50">
                    {/* Overlay на мобильных при открытом меню */}
                    {sidebarOpen && isMobile && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-30"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Навигация по боковой панели */}
                    <nav
                        className={`fixed md:static top-0 left-0 h-screen w-64 bg-white shadow-lg p-4 z-40 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'
                            }`}
                    >
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-blue-600">CRM Система</h1>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{user.fullName}</p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            <button
                                className={`${isMobile ? 'block' : 'hidden'} text-gray-600 hover:text-gray-800`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="block px-4 py-2 rounded hover:bg-gray-100 text-sm md:text-base"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    Дашборд
                                </Link>
                            </li>

                            {(user.role === 'OPERATOR' || user.role === 'ADMIN') && (
                                <>
                                    <li>
                                        <Link
                                            href="/shifts"
                                            className="block px-4 py-2 rounded hover:bg-gray-100 text-sm md:text-base"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            Смены
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/orders/new"
                                            className="block px-4 py-2 rounded hover:bg-gray-100 text-sm md:text-base"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            Создать заказ
                                        </Link>
                                    </li>
                                </>
                            )}

                            {user.role === 'MASTER' && (
                                <li>
                                    <Link
                                        href="/my-orders"
                                        className="block px-4 py-2 rounded hover:bg-gray-100 text-sm md:text-base"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        Мои заказы
                                    </Link>
                                </li>
                            )}

                            {user.role === 'CLIENT' && (
                                <>
                                    <li>
                                        <Link
                                            href="/services"
                                            className="block px-4 py-2 rounded hover:bg-gray-100 text-sm md:text-base"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            Обзор услуг
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/my-orders"
                                            className="block px-4 py-2 rounded hover:bg-gray-100 text-sm md:text-base"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            Мои заказы
                                        </Link>
                                    </li>
                                </>
                            )}

                            <li>
                                <Link
                                    href="/orders"
                                    className="block px-4 py-2 rounded hover:bg-gray-100 text-sm md:text-base"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    Все заказы
                                </Link>
                            </li>

                            {(user.role === 'OPERATOR' || user.role === 'ADMIN') && (
                                <li>
                                    <Link
                                        href="/clients"
                                        className="block px-4 py-2 rounded hover:bg-gray-100 text-sm md:text-base"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        Клиенты
                                    </Link>
                                </li>
                            )}

                            <li className="pt-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm md:text-base"
                                >
                                    Выход
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Основное содержимое */}
                    <main className="flex-1 overflow-hidden">
                        <div className="relative">
                            {/* Кнопка для открытия меню на мобильных */}
                            <button
                                className={`${isMobile ? 'fixed' : 'hidden'} top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded hover:bg-blue-700`}
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                title="Открыть меню"
                            >
                                ☰
                            </button>
                        </div>
                        <div className={`${isMobile ? 'p-4 pt-16' : 'p-4 sm:p-6 md:p-8'}`}>{children}</div>
                    </main>
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
