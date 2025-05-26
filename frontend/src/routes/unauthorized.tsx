import { createFileRoute } from '@tanstack/react-router'
import { Shield, Home, ArrowLeft, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/unauthorized')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate({ to: '/' })
  }

  const handleGoBack = () => {
    window.history.back()
  }

  const handleLogin = () => {
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0"></div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl shadow-2xl">
              <Shield className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent leading-none">
              403
            </h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Unauthorized Access
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
            You don't have permission to access this page.
            Please check your credentials or contact an administrator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 text-lg group"
            >
              <Lock className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Login
            </Button>

            <Button
              onClick={handleGoHome}
              variant="outline"
              size="lg"
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 font-semibold px-8 py-6 text-lg group"
            >
              <Home className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Go Home
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 font-semibold px-8 py-6 text-lg group"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>
          </div>

          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-slate-400 mr-2" />
                <h3 className="text-xl font-semibold text-white">Need Access?</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  <Button
                  onClick={handleLogin}
                  className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group items-center"
                >
                  <span className="text-white font-medium block">Login</span>
                  <span className="text-slate-400 text-sm">Sign in to your account</span>
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group items-center"
                >
                  <span className="text-white font-medium block">Home</span>
                  <span className="text-slate-400 text-sm">Return to main page</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <p className="text-slate-500 text-sm">
              Error Code: 403 • Forbidden Access
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}