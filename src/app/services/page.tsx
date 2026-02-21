'use client'

import { useUser } from '@/hooks/useUser'
import { useFetch } from '@/hooks/useFetch'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Service {
    id: number
    name: string
    description: string
    price: number
    isActive: boolean
}

interface Master {
    id: number
    fullName: string
}

export default function ServicesPage() {
    const { user, loading: userLoading } = useUser()
    const router = useRouter()

    const { data: servicesData, loading: servicesLoading } = useFetch<{ services: Service[] }>('/api/services')
    const { data: mastersData, loading: mastersLoading } = useFetch<{ users: Master[] }>('/api/users?role=MASTER')
    const { execute: createOrder, loading: createLoading } = useFetch('/api/orders', {
        method: 'POST',
    })

    const [services, setServices] = useState<Service[]>([])
    const [masters, setMasters] = useState<Master[]>([])
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedMaster, setSelectedMaster] = useState<string>('')
    const [scheduledAt, setScheduledAt] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        if (servicesData && servicesData.services) {
            setServices(servicesData.services)
        }
    }, [servicesData])

    useEffect(() => {
        if (mastersData && mastersData.users) {
            setMasters(mastersData.users)
        }
    }, [mastersData])

    if (userLoading) return <div className="p-4">Загружаю...</div>

    if (!user || user.role !== 'CLIENT') {
        return (
            <div className="p-4 bg-red-50 border border-red-300 rounded">
                Только клиенты могут бровать и купать услуги
            </div>
        )
    }

    const handleOrderClick = (service: Service) => {
        setSelectedService(service)
        setError(null)
        setSuccessMessage(null)
    }

    const handleCreateOrder = async () => {
        if (!selectedService || !scheduledAt) {
            setError('Пожалуйста, выберите услугу и дату')
            return
        }

        setError(null)

        const payload = {
            clientId: user.id,
            serviceId: selectedService.id,
            scheduledAt,
        }

        if (selectedMaster) {
            (payload as any).masterId = parseInt(selectedMaster)
        }

        const result = await createOrder({
            body: JSON.stringify(payload),
        })

        if (result?.order) {
            setSuccessMessage('Order created successfully!')
            setSelectedService(null)
            setSelectedMaster('')
            setScheduledAt('')
            setTimeout(() => {
                router.push(`/orders/${result.order.id}`)
            }, 1500)
        } else if (result?.error) {
            setError(result.error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Обзор услуг</h1>
                <p className="text-gray-600">Бровайте доступные услуги и создавайте заказы</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">
                    {successMessage}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesLoading ? (
                    <div className="col-span-full text-center text-gray-600">Загружаю услуги...</div>
                ) : services.length === 0 ? (
                    <div className="col-span-full text-center text-gray-600">Нет доступных услуг</div>
                ) : (
                    services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-2xl font-bold text-blue-600">
                                        ₽{(service.price / 100).toFixed(2)}
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        Доступна
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleOrderClick(service)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Ордер
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Модал заказ */}
            {selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Заказ {selectedService.name}</h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Цена
                                </label>
                                <div className="text-2xl font-bold text-blue-600">
                                    ₽{(selectedService.price / 100).toFixed(2)}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Предпочитаемый мастер (Необязательно)
                                </label>
                                <select
                                    value={selectedMaster}
                                    onChange={(e) => setSelectedMaster(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Любой доступный мастер</option>
                                    {mastersLoading ? (
                                        <option disabled>Загружаю мастеров...</option>
                                    ) : (
                                        masters.map((master) => (
                                            <option key={master.id} value={master.id}>
                                                {master.fullName}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Предпочитаемая дата и время *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateOrder}
                                disabled={createLoading || !scheduledAt}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {createLoading ? 'Создание...' : 'Подтвердить заказ'}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedService(null)
                                    setSelectedMaster('')
                                    setScheduledAt('')
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ссылка на мои заказы */}
            <div className="text-center mt-8">
                <Link href="/my-orders" className="text-blue-600 hover:underline">
                    Посмотреть мои заказы →
                </Link>
            </div>
        </div>
    )
}
