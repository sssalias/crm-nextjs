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
    createdAt: string
    updatedAt: string // we will treat as completion date when status is COMPLETED
}

interface PaginationInfo {
    page: number
    pageSize: number
    total: number
    totalPages: number
}

export default function OrdersPage() {
    const { user, loading: userLoading } = useUser()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [masterFilter, setMasterFilter] = useState('')
    const [dateFromFilter, setDateFromFilter] = useState('')
    const [dateToFilter, setDateToFilter] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Build query string
    const queryParams = new URLSearchParams()
    if (searchTerm) queryParams.append('search', searchTerm)
    if (statusFilter) queryParams.append('status', statusFilter)
    if (masterFilter) queryParams.append('masterId', masterFilter)
    if (dateFromFilter) queryParams.append('dateFrom', dateFromFilter)
    if (dateToFilter) queryParams.append('dateTo', dateToFilter)
    queryParams.append('page', String(page))
    queryParams.append('pageSize', String(pageSize))

    const { data: ordersData, loading: ordersLoading } = useFetch<{ orders: Order[]; pagination: PaginationInfo }>(`/api/orders?${queryParams.toString()}`)
    const [orders, setOrders] = useState<Order[]>([])
    const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

    useEffect(() => {
        if (ordersData && ordersData.orders) {
            setOrders(ordersData.orders)
            if (ordersData.pagination) {
                setPagination(ordersData.pagination)
            }
        }
    }, [ordersData])

    if (userLoading) return <div className="p-4">Загружаю...</div>
    if (!user) return null

    const handleFilterChange = (callback: () => void) => {
        setPage(1) // Reset to first page when filters change
        callback()
    }

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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'Выполнен'
            case 'CANCELLED':
                return 'Отменён'
            case 'IN_PROGRESS':
                return 'В процессе'
            case 'CREATED':
                return 'Создан'
            default:
                return status
        }
    }

    const finalPrice = (order: Order) => {
        return (order.servicePrice + order.extraWork - order.discount) / 100
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Заказы</h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Управляйте всеми заказами</p>
                </div>
                {canCreateOrder && (
                    <Link href="/orders/new" className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap">
                        Создать заказ
                    </Link>
                )}
            </div>

            {/* Фильтры */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Фильтры</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 md:mb-2">Поиск</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="ID или имя"
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 md:mb-2">Статус</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleFilterChange(() => setStatusFilter(e.target.value))}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Все статусы</option>
                            <option value="CREATED">Создан</option>
                            <option value="IN_PROGRESS">В процессе</option>
                            <option value="COMPLETED">Выполнен</option>
                            <option value="CANCELLED">Отменен</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 md:mb-2">Мастер</label>
                        <input
                            type="text"
                            value={masterFilter}
                            onChange={(e) => handleFilterChange(() => setMasterFilter(e.target.value))}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="ID мастера"
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 md:mb-2">С даты</label>
                        <input
                            type="date"
                            value={dateFromFilter}
                            onChange={(e) => handleFilterChange(() => setDateFromFilter(e.target.value))}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 md:mb-2">По дату</label>
                        <input
                            type="date"
                            value={dateToFilter}
                            onChange={(e) => handleFilterChange(() => setDateToFilter(e.target.value))}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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
                            <table className="w-full min-w-max">
                                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                                    <tr>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">ID</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Клиент</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Услуга</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Мастер</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Создан</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Выполнено</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Дата</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Цена</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Оплачено</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Статус</th>
                                        <th className="px-2 sm:px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm font-medium whitespace-nowrap">#{order.id}</td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm whitespace-nowrap">{order.client?.fullName || 'Н/Д'}</td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">{order.service?.name || 'Н/Д'}</td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">{order.master?.fullName || 'Не присвоен'}</td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString('ru')}</td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm whitespace-nowrap">
                                                {order.status === 'COMPLETED' ? new Date(order.updatedAt).toLocaleDateString('ru') : '-'}
                                            </td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm whitespace-nowrap">{new Date(order.scheduledAt).toLocaleDateString('ru')}</td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm font-semibold whitespace-nowrap">₽{finalPrice(order).toFixed(2)}</td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm whitespace-nowrap">₽{(order.paidAmount / 100).toFixed(2)}</td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">
                                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-2 sm:px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">
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
                    {/* Pagination */}
                    <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-3 md:py-4 border-t border-gray-200">
                        <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:items-center md:justify-between">
                            <div className="text-xs sm:text-sm text-gray-600 text-center md:text-left order-2 md:order-1">
                                Показано {(pagination.page - 1) * pagination.pageSize + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} из {pagination.total} заказов
                            </div>
                            <div className="flex flex-wrap gap-1 justify-center md:justify-end order-1 md:order-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page <= 1}
                                    className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Пред.
                                </button>

                                {/* Page numbers */}
                                <div className="flex gap-0.5 md:gap-1 items-center">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter((p) => {
                                            // Show first page, last page, current page, and neighbors
                                            if (p === 1 || p === pagination.totalPages) return true
                                            if (p >= page - 1 && p <= page + 1) return true
                                            return false
                                        })
                                        .map((p, idx, arr) => (
                                            <div key={p}>
                                                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-0.5 md:px-1 text-gray-500 text-xs">...</span>}
                                                <button
                                                    onClick={() => setPage(p)}
                                                    className={`px-1.5 md:px-3 py-1 md:py-2 text-xs rounded ${page === p
                                                        ? 'bg-blue-600 text-white font-semibold'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            </div>
                                        ))}
                                </div>

                                <button
                                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                    disabled={page >= pagination.totalPages}
                                    className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    След. →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
