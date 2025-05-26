import {createFileRoute} from '@tanstack/react-router'
import {LogIn, Code, Database, Zap, Shield, Github} from 'lucide-react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {useNavigate} from '@tanstack/react-router'
import CustomButton from "@/components/custom/customButton.tsx";

function LandingPage() {
    const navigate = useNavigate()

    const handleLogin = () => {
        navigate({to: '/login'})
    }

    const handleGithubRedirect = () => {
        window.open('https://github.com/ajordanb/fastapi-fullstack-template.git', '_blank')
    }

    const features = [
        {
            icon: Code,
            title: 'TypeScript',
            description: 'Full type safety across the stack',
            color: 'text-blue-400'
        },
        {
            icon: Database,
            title: 'FastAPI',
            description: 'High-performance Python backend',
            color: 'text-cyan-400'
        },
        {
            icon: Zap,
            title: 'TanStack',
            description: 'Powerful data fetching & routing',
            color: 'text-sky-400'
        },
        {
            icon: Shield,
            title: 'Shadcn/ui',
            description: 'Beautiful, accessible components',
            color: 'text-indigo-400'
        }
    ]

    return (
        <div className="min-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-3">
            <div className="absolute inset-0"></div>
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
              <div className="text-center max-w-4xl mx-auto">
                <div className="mb-8 flex justify-center">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-2xl">
                    <Zap className="w-12 h-12 text-white"/>
                  </div>
                </div>

                <div className="mb-6">
                  <Badge variant="secondary"
                         className="bg-slate-800/50 text-slate-300 border-slate-600 px-4 py-2 text-sm">
                    Production Ready Template
                  </Badge>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Full Stack
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {" "}FastAPI
            </span>
                  <br/>
                  Template
                </h1>

                <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                  A modern, production-ready template with FastAPI, TypeScript, Shadcn/ui,
                  TanStack Query, and Router. Get started in minutes. Built with ❤️ for developers
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                  <CustomButton
                      onClick={handleLogin}
                      size="lg"
                      variant="primary"
                  >
                    <LogIn className="w-5 h-5 mr-3 group-hover:rotate-6 transition-transform"/>
                    Get Started
                  </CustomButton>

                  <CustomButton
                      onClick={handleGithubRedirect}
                      variant="outline"
                      size="lg"
                  >
                    <Github className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform"/>
                    View on GitHub
                  </CustomButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon
                    return (
                        <Card key={index}
                              className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-200 group">
                          <CardHeader className="text-center pb-3">
                            <div className="flex justify-center mb-3">
                              <IconComponent
                                  className={`w-8 h-8 ${feature.color} group-hover:scale-110 transition-transform`}/>
                            </div>
                            <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-slate-400 text-center">
                              {feature.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                    )
                  })}
                </div>
                <div className="mt-16 max-w-2xl mx-auto">
                  <Card className="bg-slate-800/20 border-slate-700/30 backdrop-blur-sm">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-semibold text-white mb-4">What's Included?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-slate-300">Authentication & Authorization</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span className="text-slate-300">Database Integration</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                          <span className="text-slate-300">API Documentation</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                          <span className="text-slate-300">Docker Configuration</span>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
        </div>
    )
}

export const Route = createFileRoute('/')({
    component: LandingPage,
})