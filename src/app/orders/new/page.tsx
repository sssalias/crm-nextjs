'use client'

import { useUser } from '@/hooks/useUser'
import { useFetch } from '@/hooks/useFetch'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Service {
    id: number
    name: string
    price: number
    description: string
}

interface Client {
    id: number
    fullName: string
    phone: string
}

interface Master {
    id: number
    fullName: string
}

export default function CreateOrderPage() {
    const { user, loading: userLoading } = useUser()
    const router = useRouter()

    const { data: servicesData, loading: servicesLoading } = useFetch<{ services: Service[] }>('/api/services')
    const { data: clientsData, loading: clientsLoading } = useFetch<{ users: Client[] }>('/api/users?role=CLIENT')
    const { data: mastersData, loading: mastersLoading } = useFetch<{ users: Master[] }>('/api/users?role=MASTER')
    const { execute: createOrder, loading: createLoading } = useFetch('/api/orders', {
        method: 'POST',
    })

    const [services, setServices] = useState<Service[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [masters, setMasters] = useState<Master[]>([])

    const [formData, setFormData] = useState({
        clientId: '',
        serviceId: '',
        masterId: '',
        scheduledAt: '',
        discount: '',
        extraWork: '',
    })

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (servicesData && servicesData.services) setServices(servicesData.services as Service[])
        if (clientsData && clientsData.users) setClients(clientsData.users as Client[])
        if (mastersData && mastersData.users) setMasters(mastersData.users as Master[])
    }, [servicesData, clientsData, mastersData])

    if (userLoading) return <div className="p-4">Загружаю...</div>

    if (!user || (user.role !== 'OPERATOR' && user.role !== 'ADMIN')) {
        return (
            <div className="p-4 bg-red-50 border border-red-300 rounded">
                Доступ запрещен - только операторы могут создавать заказы
            </div>
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!formData.clientId || !formData.serviceId || !formData.scheduledAt) {
            setError('Клиент, услуга и дата обязательны')
            return
        }

        const selectedService = services.find((s) => s.id === parseInt(formData.serviceId))
        if (!selectedService) {
            setError('Невалидная услуга')
            return
        }

        const payload: any = {
            clientId: parseInt(formData.clientId),
            serviceId: parseInt(formData.serviceId),
            scheduledAt: formData.scheduledAt,
        }

        if (formData.masterId) {
            payload.masterId = parseInt(formData.masterId)
        }

        if (formData.discount) {
            payload.discount = Math.round(parseFloat(formData.discount) * 100)
        }

        if (formData.extraWork) {
            payload.extraWork = Math.round(parseFloat(formData.extraWork) * 100)
        }

        const result = await createOrder({
            body: JSON.stringify(payload),
        })

        if (result?.success) {
            router.push(`/orders/${result.order.id}`)
        } else {
            setError(result?.error || 'Не удалось создать заказ')
        }
    }

    const selectedService = services.find((s) => s.id === parseInt(formData.serviceId))
    const servicePrice = selectedService ? selectedService.price / 100 : 0
    const discount = formData.discount ? parseFloat(formData.discount) : 0
    const extraWork = formData.extraWork ? parseFloat(formData.extraWork) : 0
    const finalPrice = servicePrice + extraWork - discount

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="mb-8">
                <Link href="/orders" className="text-blue-600 hover:underline mb-4 block">
                    ← Назад к заказам
                </Link>
                <h1 className="text-4xl font-bold text-gray-800">Создать новый заказ</h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Клиент *</label>
                    <select
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                    >
                        <option value="">Выберите клиента</option>
                        {clientsLoading ? (
                            <option disabled>Загружаю...</option>
                        ) : (
                            clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.fullName} ({client.phone})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Услуга *</label>
                    <select
                        name="serviceId"
                        value={formData.serviceId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                    >
                        <option value="">Выберите услугу</option>
                        {servicesLoading ? (
                            <option disabled>Загружаю...</option>
                        ) : (
                            services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name} - ${(service.price / 100).toFixed(2)}
                                </option>
                            ))
                        )}
                    </select>
                    {selectedService && (
                        <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Мастер (Необязательно)</label>
                    <select
                        name="masterId"
                        value={formData.masterId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Мастер не назначен</option>
                        {mastersLoading ? (
                            <option disabled>Загружаю...</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата планирования *</label>
                    <input
                        type="datetime-local"
                        name="scheduledAt"
                        value={formData.scheduledAt}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Скидка (₽)</label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дополнительные работы (₽)</label>
                        <input
                            type="number"
                            name="extraWork"
                            value={formData.extraWork}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Объяснение цены */}
                {selectedService && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-4">
                        <h3 className="font-bold text-gray-800 mb-3">Калкуляция цены</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Цена услуги:</span>
                                <span className="font-semibold">₽{servicePrice.toFixed(2)}</span>
                            </div>
                            {extraWork > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Дополнительные работы:</span>
                                    <span className="font-semibold text-green-600">+₽{extraWork.toFixed(2)}</span>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Скидка:</span>
                                    <span className="font-semibold text-red-600">-₽{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-300 pt-2 flex justify-between">
                                <span className="font-bold text-gray-800">Китоговая цена:</span>
                                <span className="font-bold text-lg text-gray-800">₽{finalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={createLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {createLoading ? 'Создание...' : 'Создать заказ'}
                    </button>
                    <Link
                        href="/orders"
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-center"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    )
}
