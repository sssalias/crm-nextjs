'use client'

import { useUser } from '@/hooks/useUser'
import { useFetch } from '@/hooks/useFetch'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Shift {
    id: number
    openedAt: string
    closedAt: string | null
    isClosed: boolean
    operatorId: number
}

export default function ShiftsPage() {
    const { user, loading: userLoading } = useUser()
    const router = useRouter()
    const { data: shiftsData, loading: shiftsLoading, execute: fetchShifts } = useFetch<{ shifts: Shift[] }>('/api/shifts')
    const { execute: openShift, loading: openLoading } = useFetch('/api/shifts/open', { method: 'POST' })
    const { execute: closeShift, loading: closeLoading } = useFetch('/api/shifts/close', { method: 'POST' })

    const [shifts, setShifts] = useState<Shift[]>([])
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        if (shiftsData && shiftsData.shifts) {
            setShifts(shiftsData.shifts)
        }
    }, [shiftsData])

    if (userLoading) return <div className="p-4">Загружаю...</div>
    if (!user || (user.role !== 'OPERATOR' && user.role !== 'ADMIN')) {
        return <div className="p-4 bg-red-50 border border-red-300 rounded">Доступ запрещён</div>
    }

    const activeShift = shifts.find((s) => !s.isClosed)

    const handleOpenShift = async () => {
        setError(null)
        setSuccessMessage(null)

        const result = await openShift({
            body: JSON.stringify({}),
        })

        if (result?.success) {
            setSuccessMessage('Shift opened successfully')
            await fetchShifts()
        } else if (result?.error) {
            setError(result.error)
        }
    }

    const handleCloseShift = async () => {
        if (!activeShift) return

        setError(null)
        setSuccessMessage(null)

        const result = await closeShift({
            body: JSON.stringify({ shiftId: activeShift.id }),
        })

        if (result?.success) {
            setSuccessMessage('Shift closed successfully')
            await fetchShifts()
        } else if (result?.error) {
            setError(result.error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Управление сменами</h1>
                <p className="text-gray-600">Уравляйте своими рабочими сменами</p>
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

            {shiftsLoading ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Загружаю смены...</p>
                </div>
            ) : (
                <>
                    {/* Активная смена */}
                    {activeShift && (
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Активная смена</h2>
                            <div className="space-y-2 mb-4">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Начала:</span> {new Date(activeShift.openedAt).toLocaleString('ru')}
                                </p>
                                <p className="text-green-600 font-semibold">Статус: Активна</p>
                            </div>
                            <button
                                onClick={handleCloseShift}
                                disabled={closeLoading}
                                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {closeLoading ? 'Закрываю...' : 'Закрыть смену'}
                            </button>
                        </div>
                    )}

                    {/* Кнопка открытия смены */}
                    {!activeShift && (
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Нет активной смены</h2>
                            <p className="text-gray-600 mb-4">Начните новую смену, чтобы начать работу</p>
                            <button
                                onClick={handleOpenShift}
                                disabled={openLoading}
                                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {openLoading ? 'Открываю...' : 'Открыть новую смену'}
                            </button>
                        </div>
                    )}

                    {/* Предыдущие смены */}
                    {shifts.some((s) => s.isClosed) && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Предыдущие смены</h2>
                            <div className="space-y-2">
                                {shifts
                                    .filter((s) => s.isClosed)
                                    .map((shift) => (
                                        <div key={shift.id} className="p-4 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-800">Смена #{shift.id}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Начала: {new Date(shift.openedAt).toLocaleString('ru')}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Закрыта: {shift.closedAt ? new Date(shift.closedAt).toLocaleString('ru') : 'Н/Д'}
                                                    </p>
                                                </div>
                                                <p className="text-gray-500 text-sm">Closed</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
