'use client'

import { useUser } from '@/hooks/useUser'
import { useFetch } from '@/hooks/useFetch'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
    completionComment?: string
    createdAt: string
    updatedAt: string
    client?: { id: number; fullName: string; phone: string }
    service?: { id: number; name: string; price: number }
    master?: { id: number; fullName: string }
    operator?: { id: number; fullName: string }
    operations?: Array<{
        id: number
        type: string
        amount: number
        reason?: string
        createdBy?: { fullName: string }
        createdAt: string
    }>
}

export default function OrderDetailPage() {
    const { user, loading: userLoading } = useUser()
    const router = useRouter()
    const params = useParams()
    const orderId = params.id as string

    const { data: orderData, loading: orderLoading } = useFetch<{ order: Order }>(`/api/orders/${orderId}`)
    const { execute: cancelOrder, loading: cancelLoading } = useFetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
    })
    const { execute: completeOrder, loading: completeLoading } = useFetch(`/api/orders/${orderId}/complete`, {
        method: 'POST',
    })
    const { execute: markInProgress, loading: inProgressLoading } = useFetch(`/api/orders/${orderId}/in-progress`, {
        method: 'POST',
    })
    const { execute: payOrder, loading: payLoading } = useFetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
    })

    const [order, setOrder] = useState<Order | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [completionComment, setCompletionComment] = useState('')

    useEffect(() => {
        if (orderData && orderData.order) {
            setOrder(orderData.order)
        }
    }, [orderData])

    if (userLoading || orderLoading) return <div className="p-4">Загружаю...</div>
    if (!user || !order) return null

    const finalPrice = (order.servicePrice + order.extraWork - order.discount) / 100
    const remainingAmount = finalPrice - order.paidAmount / 100
    const isMaster = user.role === 'MASTER' && user.id === order.masterId
    const isOperator = user.role === 'OPERATOR' || user.role === 'ADMIN'

    const handleCancel = async () => {
        setError(null)
        const result = await cancelOrder({ body: JSON.stringify({ cancelReason: 'Отменен оператором' }) })
        if (result?.success) {
            setSuccessMessage('Заказ успешно отменен')
            setTimeout(() => router.push('/orders'), 1500)
        } else {
            setError(result?.error || 'Не удалось отменить заказ')
        }
    }

    const handleMarkInProgress = async () => {
        setError(null)
        const result = await markInProgress({ body: JSON.stringify({}) })
        if (result?.success) {
            setSuccessMessage('Заказ отмечен как в процессе')
            setOrder({ ...order, status: 'IN_PROGRESS' })
        } else {
            setError(result?.error || 'Не удалось оновить статус заказа')
        }
    }

    const handleComplete = async () => {
        setError(null)
        const finalPriceCents = (order.servicePrice || 0) + (order.extraWork || 0) - (order.discount || 0)
        const result = await completeOrder({
            body: JSON.stringify({ finalPrice: finalPriceCents, completionComment }),
        })
        if (result?.success) {
            setSuccessMessage('Order completed successfully')
            setTimeout(() => router.push('/orders'), 1500)
        } else {
            setError(result?.error || 'Failed to complete order')
        }
    }

    const handlePayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            setError('Пожалуйста, введите велидную сумму')
            return
        }

        setError(null)
        const amountInCents = Math.round(parseFloat(paymentAmount) * 100)
        const result = await payOrder({
            body: JSON.stringify({ amount: amountInCents }),
        })
        if (result?.success) {
            setSuccessMessage('Наружу зарегистрировано')
            setPaymentAmount('')
            setOrder({ ...order, paidAmount: result.paidAmount })
        } else {
            setError(result?.error || 'Не удалось регистрар͚ платеж')
        }
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <Link href="/orders" className="text-blue-600 hover:underline mb-4 block">
                    ← Назад к заказам
                </Link>
                <h1 className="text-4xl font-bold text-gray-800">Заказ #{order.id}</h1>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Информация о заказе</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Статус:</span>
                                <span className="font-bold text-gray-800">{order.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Создан:</span>
                                <span className="font-bold text-gray-800">
                                    {new Date(order.createdAt).toLocaleString('ru')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Планируемая дата:</span>
                                <span className="font-bold text-gray-800">
                                    {new Date(order.scheduledAt).toLocaleString('ru')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Дата выполнения:</span>
                                <span className="font-bold text-gray-800">
                                    {order.status === 'COMPLETED' ? new Date(order.updatedAt).toLocaleString('ru') : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Клиент:</span>
                                <span className="font-bold text-gray-800">
                                    {order.client?.fullName} ({order.client?.phone})
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Услуга:</span>
                                <span className="font-bold text-gray-800">{order.service?.name}</span>
                            </div>
                            {order.master && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Мастер:</span>
                                    <span className="font-bold text-gray-800">{order.master.fullName}</span>
                                </div>
                            )}
                            {order.operator && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Оператор:</span>
                                    <span className="font-bold text-gray-800">{order.operator.fullName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Финансовые подробности */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Финансовые подробности</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Цена услуги:</span>
                                <span className="font-bold text-gray-800">
                                    ₽{(order.servicePrice / 100).toFixed(2)}
                                </span>
                            </div>
                            {order.extraWork > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Дополнительные работы:</span>
                                    <span className="font-bold text-green-600">
                                        +₽{(order.extraWork / 100).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            {order.discount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Скидка:</span>
                                    <span className="font-bold text-red-600">
                                        -₽{(order.discount / 100).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-3 flex justify-between">
                                <span className="font-semibold text-gray-800">Итоговая цена:</span>
                                <span className="font-bold text-lg text-gray-800">
                                    ₽{finalPrice.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Оплачено:</span>
                                <span className="font-bold text-gray-800">
                                    ₽{(order.paidAmount / 100).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Осталось:</span>
                                <span
                                    className={`font-bold ${remainingAmount <= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}
                                >
                                    ₽{remainingAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Действия */}
                    {(isMaster || isOperator) && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Действия</h2>
                            <div className="space-y-3">
                                {order.status === 'CREATED' && isMaster && (
                                    <button
                                        onClick={handleMarkInProgress}
                                        disabled={inProgressLoading}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {inProgressLoading ? 'Обновление...' : 'Отметить как в процессе'}
                                    </button>
                                )}

                                {order.status === 'IN_PROGRESS' && (
                                    <div className="space-y-3">
                                        {isMaster && (
                                            <textarea
                                                value={completionComment}
                                                onChange={(e) => setCompletionComment(e.target.value)}
                                                placeholder="Комментарий (необъзательно)"
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                            />
                                        )}
                                        {(isMaster || isOperator) && (
                                            <button
                                                onClick={handleComplete}
                                                disabled={completeLoading}
                                                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {completeLoading ? 'Завершение...' : 'Выполнить заказ'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {order.status !== 'COMPLETED' && isOperator && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelLoading}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {cancelLoading ? 'Отмена...' : 'Отменить заказ'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Платеж */}
                    {isOperator && order.status === 'IN_PROGRESS' && remainingAmount > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Рекорд платеж</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Сумма к оплате (₽{remainingAmount.toFixed(2)} осталось)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={remainingAmount}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Введите сумму"
                                    />
                                </div>
                                <button
                                    onClick={handlePayment}
                                    disabled={payLoading || !paymentAmount}
                                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {payLoading ? 'Обработка...' : 'Рекорд платеж'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Лог трансакций */}
                    {order.operations && order.operations.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Лог операций</h2>
                            <div className="space-y-2">
                                {order.operations.map((op) => (
                                    <div key={op.id} className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                                        <p className="font-semibold text-gray-800">{op.type}</p>
                                        <p className="text-gray-600">₽{(op.amount / 100).toFixed(2)}</p>
                                        {op.reason && <p className="text-gray-500">{op.reason}</p>}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(op.createdAt).toLocaleString('ru')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
