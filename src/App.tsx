import { Outlet } from 'react-router-dom'

function App() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <header className="p-4 border-b border-gray-800">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Portfolio V2
                </h1>
            </header>
            <main className="flex-grow flex items-center justify-center">
                <Outlet />
            </main>
            <footer className="p-4 text-center text-gray-500 text-sm">
                © 2024 Portfolio V2.0 - Foundation Phase
            </footer>
        </div>
    )
}

export default App
