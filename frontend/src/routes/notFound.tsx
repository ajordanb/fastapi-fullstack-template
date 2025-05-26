import {Home, ArrowLeft, Search, AlertTriangle, LogIn} from 'lucide-react'
import {Card, CardContent} from '@/components/ui/card'
import {useNavigate} from '@tanstack/react-router'
import CustomButton from "@/components/custom/customButton.tsx";


export function NotFoundPage() {
    const navigate = useNavigate()

    const handleGoHome = () => {
        navigate({to: '/'})
    }

    const handleGoBack = () => {
        window.history.back()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-3">
            <div className="absolute inset-0"></div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="mb-8 flex justify-center">
                        <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl">
                            <AlertTriangle className="w-16 h-16 text-white"/>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                            404
                        </h1>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Page Not Found
                    </h2>

                    <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                        Sorry, we couldn't find the page you're looking for.
                        It might have been moved, deleted, or you entered the wrong URL.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <CustomButton
                            variant="primary"
                            size="lg"
                            onClick={handleGoHome}
                        >
                            <Home className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"/>
                            Go Home
                        </CustomButton>

                        <CustomButton
                            onClick={handleGoBack}
                            variant="outline"
                            size="lg"
                        >
                            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform"/>
                            Go Back
                        </CustomButton>
                    </div>

                    <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-center mb-4">
                                <Search className="w-6 h-6 text-slate-400 mr-2"/>
                                <h3 className="text-xl font-semibold text-white">Looking for something?</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <button
                                    onClick={() => navigate({to: '/'})}
                                    className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
                                >
                                    <Home
                                        className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform"/>
                                    <span className="text-white font-medium block">Home</span>
                                    <span className="text-slate-400 text-sm">Back to main page</span>
                                </button>

                                <button
                                    onClick={() => navigate({to: '/login'})}
                                    className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
                                >
                                    <LogIn
                                        className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform"/>
                                    <span className="text-white font-medium block">Login</span>
                                    <span className="text-slate-400 text-sm">Access your account</span>
                                </button>

                                <button
                                    onClick={() => window.open('https://github.com/ajordanb/fastapi-fullstack-template.git', '_blank')}
                                    className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
                                >
                                    <AlertTriangle
                                        className="w-6 h-6 text-sky-400 mx-auto mb-2 group-hover:scale-110 transition-transform"/>
                                    <span className="text-white font-medium block">Documentation</span>
                                    <span className="text-slate-400 text-sm">Check the docs</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8">
                        <p className="text-slate-500 text-sm">
                            Error Code: 404 • Page Not Found
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}