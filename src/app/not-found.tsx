import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Страница не найдена</h2>
                    <p className="text-gray-600 mb-6">
                        Нискаюмая страница не существует или была перенесена.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        На главную
                    </Link>
                </div>
            </div>
        </div>
    )
}
