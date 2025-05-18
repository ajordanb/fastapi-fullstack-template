import {FcGoogle, FcLink} from "react-icons/fc";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {useGoogleLogin} from "@react-oauth/google";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    createFileRoute,
    useNavigate,
} from "@tanstack/react-router";
import {useAuth} from "@/hooks/useAuth";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import FormWrapper from "@/components/foms/formWrapper.tsx";

type LoginFormValues = z.infer<typeof loginSchema>;

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean(),
});

interface LoginProps {
    heading?: string;
    subheading?: string;
    logo: {
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
                   heading = "Login",
                   subheading = "Welcome back",
                   logo = {
                       url: "https://www.shadcnblocks.com",
                       src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
                       alt: "Shadcnblocks",
                   },
                   loginText = "Log in",
                   googleText = "Log in with Google",
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
                setIsLoading(false); // Reset loading state on error
            },
            onNonOAuthError: () => {
                setError("Non-OAuth error, please try again.");
                setIsLoading(false); // Reset loading state on non-OAuth error
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
            logo={{
                url: logo.url,
                src: logo.src,
                alt: logo.alt
            }}
            isLoading={isLoading}
            error={error}
            onErrorDismiss={() => setError(null)}
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid gap-4"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-between">
                        <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({field}) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            id="remember"
                                            className="border-muted-foreground"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormLabel
                                        htmlFor="remember"
                                        className="text-sm leading-none font-medium cursor-pointer"
                                    >
                                        Remember me
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                        <a href="#" className="text-sm text-primary hover:underline">
                            Forgot password
                        </a>
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : loginText}
                    </Button>
                    <Button
                        className="mt-2 w-full"
                        disabled={isLoading}
                        onClick={() => {
                            _navigate("/requestMagicLink")
                        }}
                    >
                        <FcLink className="mr-2 size-5"/>
                        Magic Link
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                            googleLogin();
                        }}
                    >
                        <FcGoogle className="mr-2"/>
                        {googleText}
                    </Button>
                </form>
            </Form>

            <div className="mx-auto mt-8 flex justify-center gap-1 text-sm text-muted-foreground">
                <p>{signupText}</p>
                <a href={signupUrl} className="font-medium text-primary">
                    Sign up
                </a>
            </div>
        </FormWrapper>
    );
};

export const Route = createFileRoute("/login")({
    component: Login,
});