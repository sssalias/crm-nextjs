'use client'

import { useUser } from '@/hooks/useUser'
import { useFetch } from '@/hooks/useFetch'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Shift {
    id: number
    openedAt: string
    closedAt: string | null
    isClosed: boolean
    operatorId: number
}

interface Order {
    id: number
    clientId: number
    serviceId: number
    masterId: number | null
    operatorId: number
    scheduledAt: string
    status: string
    servicePrice: number
    discount: number
    extraWork: number
    paidAmount: number
}

export default function DashboardPage() {
    const { user, loading: userLoading } = useUser()
    const { data: shiftsData, loading: shiftsLoading } = useFetch<{ shifts: Shift[] }>('/api/shifts')
    const { data: ordersData, loading: ordersLoading } = useFetch<{ orders: Order[] }>('/api/orders?limit=5')

    const [shifts, setShifts] = useState<Shift[]>([])
    const [orders, setOrders] = useState<Order[]>([])

    useEffect(() => {
        if (shiftsData && shiftsData.shifts) setShifts(shiftsData.shifts)
    }, [shiftsData])

    useEffect(() => {
        if (ordersData && ordersData.orders) setOrders(ordersData.orders)
    }, [ordersData])

    if (userLoading) return <div className="p-4">Загружаю...</div>

    if (!user) return null

    const isOperator = user.role === 'OPERATOR' || user.role === 'ADMIN'
    const isMaster = user.role === 'MASTER'
    const isClient = user.role === 'CLIENT'

    const openShift = shifts.find((s) => !s.isClosed)
    const totalOrders = orders.length
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length
    const totalRevenue = orders.reduce((sum, o) => sum + o.paidAmount, 0)

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Дашборд</h1>
                <p className="text-gray-600">Добрый день, {user.fullName}!</p>
            </div>

            {/* Operator/Admin Dashboard */}
            {isOperator && (
                <>
                    {/* Статус смены */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Статус смены</h2>
                        {openShift ? (
                            <div className="bg-green-50 border border-green-300 rounded p-4">
                                <p className="text-green-700 font-bold">Смена активна</p>
                                <p className="text-gray-600 text-sm">
                                    Начала: {new Date(openShift.openedAt).toLocaleString('ru')}
                                </p>
                                <Link
                                    href="/shifts"
                                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Управлять сменами
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 border border-yellow-300 rounded p-4">
                                <p className="text-yellow-700 font-bold">Нет активной смены</p>
                                <p className="text-gray-600 text-sm">Начните смену, чтобы начать работу</p>
                                <Link
                                    href="/shifts"
                                    className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Начать смену
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Быстрые статистики */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 font-semibold">Всего заказов</p>
                            <p className="text-4xl font-bold text-blue-600 mt-2">{totalOrders}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 font-semibold">Выполнено</p>
                            <p className="text-4xl font-bold text-green-600 mt-2">{completedOrders}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 font-semibold">Доход</p>
                            <p className="text-4xl font-bold text-purple-600 mt-2">₽{(totalRevenue / 100).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Быстрые ссылки */}
                    <div className="space-y-2">
                        <Link
                            href="/orders/new"
                            className="block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                        >
                            Создать новый заказ
                        </Link>
                        <Link href="/orders" className="block px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-center">
                            Посмотреть все заказы
                        </Link>
                    </div>
                </>
            )}

            {/* Master Dashboard */}
            {isMaster && (
                <>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Мои заказы</h2>
                        <p className="text-gray-600 mb-4">Вам назначено {totalOrders} заказов</p>
                        <Link
                            href="/my-orders"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Посмотреть мои заказы
                        </Link>
                    </div>
                </>
            )}

            {/* Client Dashboard */}
            {isClient && (
                <>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Мои заказы</h2>
                        <p className="text-gray-600 mb-4">У вас есть {totalOrders} заказ</p>
                        <Link
                            href="/my-orders"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Посмотреть мои заказы
                        </Link>
                    </div>
                </>
            )}

            {/* Recent Orders */}
            {ordersLoading ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Загружаю последние заказы...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Последние заказы</h2>
                    {orders.length === 0 ? (
                        <p className="text-gray-600">Заказов нет</p>
                    ) : (
                        <div className="space-y-2">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="block p-4 bg-gray-50 rounded hover:bg-gray-100 border border-gray-200"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800">Заказ #{order.id}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.scheduledAt).toLocaleDateString('ru')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-800">₽{(order.servicePrice / 100).toFixed(2)}</p>
                                            <p className={`text-sm font-bold ${order.status === 'COMPLETED' ? 'text-green-600' :
                                                order.status === 'CANCELLED' ? 'text-red-600' :
                                                    order.status === 'IN_PROGRESS' ? 'text-blue-600' :
                                                        'text-yellow-600'
                                                }`}>
                                                {order.status}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
