'use client'

import { useUser } from '@/hooks/useUser'
import { useFetch } from '@/hooks/useFetch'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Client {
    id: number
    fullName: string
    phone: string
    role: string
}

interface PaginationInfo {
    page: number
    pageSize: number
    total: number
    totalPages: number
}

export default function ClientsPage() {
    const { user, loading: userLoading } = useUser()
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [clients, setClients] = useState<Client[]>([])
    const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

    // Fetch all clients
    const { data: clientsData, loading: clientsLoading } = useFetch<{ users: Client[] }>('/api/users?role=CLIENT')

    useEffect(() => {
        if (clientsData && clientsData.users) {
            // Filter by search term if provided
            const filtered = clientsData.users.filter((client) =>
                client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone.includes(searchTerm)
            )

            // Calculate pagination
            const total = filtered.length
            const totalPages = Math.ceil(total / pageSize)
            const startIdx = (page - 1) * pageSize
            const endIdx = startIdx + pageSize
            const paginatedClients = filtered.slice(startIdx, endIdx)

            setClients(paginatedClients)
            setPagination({
                page,
                pageSize,
                total,
                totalPages: totalPages || 1,
            })
        }
    }, [clientsData, searchTerm, page, pageSize])

    if (userLoading) return <div className="p-4">Загружаю...</div>
    if (!user) return null

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setPage(1) // Reset to first page when search term changes
    }

    return (
        <div className="space-y-6">
            {/* Заголовок */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Клиенты</h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Управляйте всеми клиентами</p>
                </div>
            </div>

            {/* Фильтры */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Поиск</h2>
                <div className="w-full">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 md:mb-2">Поиск по имени или номеру</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        placeholder="Введите имя или номер"
                    />
                </div>
            </div>

            {/* Список клиентов */}
            {clientsLoading ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Загружаю клиентов...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {clients.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-gray-600">Клиенты не найдены</p>
                        </div>
                    ) : (
                        <>
                            {/* Таблица - видна только на десктопе */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">ID</th>
                                            <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Имя</th>
                                            <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Номер телефона</th>
                                            <th className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((client) => (
                                            <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-3 sm:px-4 md:px-6 py-2 md:py-4 text-xs md:text-sm font-medium">#{client.id}</td>
                                                <td className="px-3 sm:px-4 md:px-6 py-2 md:py-4 text-xs md:text-sm">{client.fullName}</td>
                                                <td className="px-3 sm:px-4 md:px-6 py-2 md:py-4 text-xs md:text-sm">+{client.phone}</td>
                                                <td className="px-3 sm:px-4 md:px-6 py-2 md:py-4 text-xs md:text-sm">
                                                    <Link
                                                        href={`/my-orders?clientId=${client.id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Заказы
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Карточки - видны только на мобильных */}
                            <div className="md:hidden p-3 space-y-3">
                                {clients.map((client) => (
                                    <div key={client.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">ID: #{client.id}</p>
                                                <p className="text-sm font-semibold text-gray-800">{client.fullName}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-600">
                                                <span className="font-medium">Телефон:</span> +{client.phone}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/my-orders?clientId=${client.id}`}
                                            className="inline-block w-full text-center px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                                        >
                                            Заказы
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Пагинация */}
                    <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-3 md:py-4 border-t border-gray-200">
                        <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:items-center md:justify-between">
                            <div className="text-xs sm:text-sm text-gray-600 text-center md:text-left order-2 md:order-1">
                                Показано {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} из {pagination.total}
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
