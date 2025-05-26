import {useNavigate} from "@tanstack/react-router";
import {ArrowLeft, Home, Lock, Shield} from "lucide-react";
import CustomButton from "@/components/custom/customButton.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

export function UnauthorizedRouteComponent() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-3">
      <div className="absolute inset-0"></div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl">
              <Shield className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent leading-none">
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
            <CustomButton
              onClick={handleLogin}
              variant="primary"
              size="lg"
            >
              <Lock className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Login
            </CustomButton>

            <CustomButton
              onClick={handleGoHome}
              variant="outline"
              size="lg"
            >
              <Home className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Go Home
            </CustomButton>

            <CustomButton
              onClick={handleGoBack}
              variant="outline"
              size="lg"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </CustomButton>
          </div>
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-slate-400 mr-2" />
                <h3 className="text-xl font-semibold text-white">Need Access?</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <Button
                  onClick={handleLogin}
                  className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group flex flex-col items-center justify-center h-full"
                >
                  <Lock className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium block">Login</span>
                  <span className="text-slate-400 text-sm">Sign in to your account</span>
                </Button>

                <button
                  onClick={() => navigate({ to: '/' })}
                  className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
                >
                  <Shield className="w-6 h-6 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium block">Contact Admin</span>
                  <span className="text-slate-400 text-sm">Request access</span>
                </button>

                <button
                  onClick={handleGoHome}
                  className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
                >
                  <Home className="w-6 h-6 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium block">Home</span>
                  <span className="text-slate-400 text-sm">Return to main page</span>
                </button>
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