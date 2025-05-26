import FormWrapper from "@/components/foms/formWrapper.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import {
    useNavigate,
} from "@tanstack/react-router";
import {useCountdown} from "@/hooks/useCoundown.tsx";

const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export type EmailFormValues = z.infer<typeof emailSchema>;

export interface EmailActionFormProps {
    title: string;
    subheading: string;
    logo?: {
        url: string;
        src: string;
        alt: string;
    };
    buttonText: string;
    onSubmit: (values: EmailFormValues) => Promise<void> | void;
    successTitle?: string;
    successMessage?: string;
    successButtonText?: string;
    placeholder?: string;
    additionalContent?: ReactNode;
}

export function EmailActionForm({
    title,
    subheading,
    logo,
    buttonText,
    onSubmit,
    successTitle = "Success!",
    successMessage = "Email sent successfully! Please check your inbox and spam folder.",
    successButtonText = "Try Again",
    placeholder = "Enter your email",
    additionalContent,
}: EmailActionFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const navigate = useNavigate();
    const timeoutSeconds = 60;
    const { timeLeft, isActive, start, reset } = useCountdown(timeoutSeconds);

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    });

    const handleSubmit = async (values: EmailFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            await onSubmit(values);
            setFeedback(successMessage);
            start();
        } catch (error: any) {
            setError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFeedback(null);
        reset(); // Reset the countdown
        form.reset();
    };

    const getFeedbackMessage = () => {
        if (!feedback) return '';

        if (isActive && timeLeft > 0) {
            return `${feedback} You can request again in...`;
        } else if (timeLeft === 0) {
            return feedback;
        }

        return feedback;
    };

    return (
        <FormWrapper
            heading={title}
            subheading={subheading}
            logo={logo}
            isLoading={isLoading}
            error={error}
            onErrorDismiss={() => setError(null)}
        >
            {feedback ? (
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                            <CheckCircle className="h-8 w-8 text-white"/>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{successTitle}</h3>
                    <p className="text-slate-300">{getFeedbackMessage()}</p>

                    {isActive && timeLeft > 0 && (
                        <div className="text-xl font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            {timeLeft}s
                        </div>
                    )}

                    <Button
                        onClick={handleReset}
                        className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        disabled={isActive && timeLeft > 0}
                        size="lg"
                    >
                        {successButtonText}
                    </Button>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}
                          className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder={placeholder}
                                            disabled={isLoading}
                                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400"/>
                                </FormItem>
                            )}
                        />
                        {additionalContent}
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200"
                            disabled={isLoading}
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 w-4 h-4" />
                                    {buttonText}
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-200"
                            disabled={isLoading}
                            onClick={() => navigate({to: "/login"})}
                            type="button"
                            size="lg"
                        >
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Back to login
                        </Button>
                    </form>
                </Form>
            )}
        </FormWrapper>
    )
}