import {FcGoogle} from "react-icons/fc";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useGoogleLogin} from "@react-oauth/google";
import FormWrapper from "@/components/foms/formWrapper";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Link,
    useNavigate,
} from "@tanstack/react-router";
import {useAuth} from "@/hooks/useAuth";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";

type SignupFormValues = z.infer<typeof signupSchema>;

const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

interface SignupProps {
    heading?: string;
    subheading?: string;
    logo?: {
        url: string;
        src: string;
        alt: string;
    };
    signupText?: string;
    googleText?: string;
    loginText?: string;
    loginUrl?: string;
    redirectUrl?: string;
}

export const Signup = ({
                   heading = "Create Account",
                   subheading = "Sign up for a new account",
                   signupText = "Sign Up",
                   googleText = "Continue with Google",
                   loginText = "Already have an account?",
                   loginUrl = "/login",
                   redirectUrl = "/admin/users",
               }: SignupProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {register, socialLogin, isAuthenticated} = useAuth();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            await register(values.fullName, values.email, values.password);
            _navigate();
        } catch (error: any) {
            console.log(error);
            setError(error instanceof Error ? error.message : "Signup failed");
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
                    setError("Google signup failed, please try again.");
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
        <FormWrapper
            heading={heading}
            subheading={subheading}
            isLoading={isLoading}
            error={error}
            onErrorDismiss={() => setError(null)}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Enter your full name"
                                        disabled={isLoading}
                                        className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-red-600" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        disabled={isLoading}
                                        className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-red-600" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                        className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-red-600" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full bg-black hover:bg-gray-800 text-white font-semibold transition-colors duration-200"
                        disabled={isLoading}
                        size="lg"
                    >
                        {isLoading ? "Creating account..." : signupText}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full bg-white border border-gray-300 text-black hover:bg-gray-50 transition-colors duration-200"
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

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            {loginText}{" "}
                            <Link
                                to={loginUrl}
                                className="font-medium text-black hover:text-gray-700 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </Form>
        </FormWrapper>
    );
};