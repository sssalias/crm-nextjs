'use client'

import { useUser } from '@/hooks/useUser'
import { useFetch } from '@/hooks/useFetch'
import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    client?: { fullName: string }
    service?: { name: string }
    master?: { fullName: string }
    finalPrice?: number
}

export default function OrdersPage() {
    const { user, loading: userLoading } = useUser()
    const [statusFilter, setStatusFilter] = useState('')
    const [masterFilter, setMasterFilter] = useState('')
    const [dateFromFilter, setDateFromFilter] = useState('')
    const [dateToFilter, setDateToFilter] = useState('')

    // Build query string
    const queryParams = new URLSearchParams()
    if (statusFilter) queryParams.append('status', statusFilter)
    if (masterFilter) queryParams.append('masterId', masterFilter)
    if (dateFromFilter) queryParams.append('dateFrom', dateFromFilter)
    if (dateToFilter) queryParams.append('dateTo', dateToFilter)

    const { data: ordersData, loading: ordersLoading } = useFetch<{ orders: Order[] }>(`/api/orders?${queryParams.toString()}`)
    const [orders, setOrders] = useState<Order[]>([])

    useEffect(() => {
        if (ordersData && ordersData.orders) {
            setOrders(ordersData.orders)
        }
    }, [ordersData])

    if (userLoading) return <div className="p-4">Загружаю...</div>
    if (!user) return null

    const canCreateOrder = user.role === 'OPERATOR' || user.role === 'ADMIN'

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'text-green-600 bg-green-50'
            case 'CANCELLED':
                return 'text-red-600 bg-red-50'
            case 'IN_PROGRESS':
                return 'text-blue-600 bg-blue-50'
            default:
                return 'text-yellow-600 bg-yellow-50'
        }
    }

    const finalPrice = (order: Order) => {
        return (order.servicePrice + order.extraWork - order.discount) / 100
    }

    return (
        <div className="space-y-6">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Заказы</h1>
                    <p className="text-gray-600">Уравляйте всеми заказами</p>
                </div>
                {canCreateOrder && (
                    <Link href="/orders/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Создать заказ
                    </Link>
                )}
            </div>

            {/* Фильтры */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Фильтры</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Все статусы</option>
                            <option value="CREATED">Создан</option>
                            <option value="IN_PROGRESS">В процессе</option>
                            <option value="COMPLETED">Выполнен</option>
                            <option value="CANCELLED">Отменен</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Мастера</label>
                        <input
                            type="text"
                            value={masterFilter}
                            onChange={(e) => setMasterFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Фильтр по мастеру"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">С этого даты</label>
                        <input
                            type="date"
                            value={dateFromFilter}
                            onChange={(e) => setDateFromFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">По эту дату</label>
                        <input
                            type="date"
                            value={dateToFilter}
                            onChange={(e) => setDateToFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Лист заказов */}
            {ordersLoading ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Загружаю заказы...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {orders.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-gray-600">Заказы не найдены</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Клиент</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Услуга</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Мастер</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Дата</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Цена</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Оплачено</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Статус</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium">#{order.id}</td>
                                            <td className="px-6 py-4 text-sm">{order.client?.fullName || 'Н/Д'}</td>
                                            <td className="px-6 py-4 text-sm">{order.service?.name || 'Н/Д'}</td>
                                            <td className="px-6 py-4 text-sm">{order.master?.fullName || 'Не присвоен'}</td>
                                            <td className="px-6 py-4 text-sm">{new Date(order.scheduledAt).toLocaleDateString('ru')}</td>
                                            <td className="px-6 py-4 text-sm font-semibold">₽{finalPrice(order).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm">₽{(order.paidAmount / 100).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Посмотреть
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
