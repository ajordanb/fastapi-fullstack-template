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
import { CheckCircle } from "lucide-react";
import {
    useNavigate,
} from "@tanstack/react-router";


// Create a generic email form schema
const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export type EmailFormValues = z.infer<typeof emailSchema>;

export interface EmailActionFormProps {
    title: string;
    subheading: string;
    logo: {
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
        } catch (error: any) {
            console.error('Error:', error);
            setError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFeedback(null);
        form.reset();
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
                        <CheckCircle className="h-12 w-12 text-green-500"/>
                    </div>
                    <h3 className="text-lg font-semibold text-green-600">{successTitle}</h3>
                    <p className="text-green-600">{feedback}</p>
                    <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={handleReset}
                    >
                        {successButtonText}
                    </Button>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}
                          className="grid gap-4">
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
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {additionalContent}
                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : buttonText}
                        </Button>
                         <Button
                              variant="outline"
                            className="mt-2 w-full"
                            disabled={isLoading}
                              onClick={() => navigate({to: "/login"})}
                        >
                            Back to login
                        </Button>
                    </form>
                </Form>
            )}
        </FormWrapper>
    )
}

