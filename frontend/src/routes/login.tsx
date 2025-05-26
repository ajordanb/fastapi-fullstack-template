import {FcGoogle, FcLink} from "react-icons/fc";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {useGoogleLogin} from "@react-oauth/google";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Shield} from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    createFileRoute, Link,
    useNavigate,
} from "@tanstack/react-router";
import {useAuth} from "@/hooks/useAuth";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean(),
});

interface LoginProps {
    heading?: string;
    subheading?: string;
    logo?: {
        url: string;
        src: string;
        alt: string;
    };
    loginText?: string;
    googleText?: string;
    signupText?: string;
    signupUrl?: string;
    redirectUrl?: string;
}

const Login = ({
                   heading = "Welcome Back",
                   subheading = "Sign in to your account",
                   loginText = "Sign In",
                   googleText = "Continue with Google",
                   signupText = "Don't have an account?",
                   signupUrl = "#",
                   redirectUrl = "/admin/users",
               }: LoginProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {basicLogin, socialLogin, isAuthenticated} = useAuth();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            await basicLogin(values.email, values.password);
            _navigate();
        } catch (error: any) {
            console.log(error);
            setError(error instanceof Error ? error.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const googleLogin = useGoogleLogin(
        {
            onSuccess: async (tokenResponse) => {
                setIsLoading(true);
                try {
                    await socialLogin({provider: "google", data: tokenResponse});
                    _navigate();
                } catch (error) {
                    setError("Google login failed, please try again.");
                } finally {
                    setIsLoading(false);
                }
            },

            onError: () => {
                setError("OAuth error, please try again.");
                setIsLoading(false);
            },
            onNonOAuthError: () => {
                setError("Non-OAuth error, please try again.");
                setIsLoading(false);
            },
            scope: "openid email profile",
        });

    const _navigate = (overrideUrl: string = redirectUrl) => {
        setTimeout(() => {
            navigate({to: overrideUrl, replace: true});
        }, 100);
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate({to: redirectUrl});
        }
    }, [isAuthenticated, navigate, redirectUrl]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="absolute inset-0"></div>
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                <div className="w-full max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-2xl">
                                <Shield className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <Badge variant="secondary" className="bg-slate-800/50 text-slate-300 border-slate-600 px-3 py-1 text-xs">
                                Secure Login
                            </Badge>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {heading}
                        </h1>
                        <p className="text-lg text-slate-300">
                            {subheading}
                        </p>
                    </div>

                    <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm shadow-2xl">
                        <CardHeader className="space-y-1 pb-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-red-400 text-sm text-center">{error}</p>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-300">Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        disabled={isLoading}
                                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-400" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-300">Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Enter your password"
                                                        disabled={isLoading}
                                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-400" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-between items-center">
                                        <FormField
                                            control={form.control}
                                            name="rememberMe"
                                            render={({field}) => (
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            id="remember"
                                                            className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormLabel
                                                        htmlFor="remember"
                                                        className="text-sm text-slate-300 font-medium cursor-pointer"
                                                    >
                                                        Remember me
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        <Link
                                            to={'/requestNewPassword'}
                                            className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200"
                                        disabled={isLoading}
                                        size="lg"
                                    >
                                        {isLoading ? "Signing in..." : loginText}
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-slate-600" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-slate-800/30 px-2 text-slate-400">Or continue with</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-slate-700/50 border border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-200"
                                        disabled={isLoading}
                                        onClick={() => {
                                            _navigate("/requestMagicLink")
                                        }}
                                        type="button"
                                        size="lg"
                                    >
                                        <FcLink className="mr-2 size-5"/>
                                        Magic Link
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-200"
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => {
                                            googleLogin();
                                        }}
                                        size="lg"
                                    >
                                        <FcGoogle className="mr-2 size-5"/>
                                        {googleText}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    <div className="mt-6 text-center">
                        <p className="text-slate-400">
                            {signupText}{" "}
                            <a
                                href={signupUrl}
                                className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                            >
                                Sign up
                            </a>
                        </p>
                    </div>
                    <div className="mt-4 text-center">
                        <Link
                            to="/"
                            className="text-sm text-slate-500 hover:text-slate-400 hover:underline"
                        >
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Route = createFileRoute("/login")({
    component: Login,
});