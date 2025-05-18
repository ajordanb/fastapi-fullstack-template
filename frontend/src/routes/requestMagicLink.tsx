import {createFileRoute} from '@tanstack/react-router'
import FormWrapper from "@/components/foms/formWrapper.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useApi} from "@/api/api.tsx";
import {CheckCircle} from "lucide-react";

export const Route = createFileRoute('/requestMagicLink')({
    component: RouteComponent,
})

type MagicFormValues = z.infer<typeof magicSchema>;

const magicSchema = z.object({
    email: z.string().email("Invalid email address"),
});

function RouteComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const api = useApi()

    const form = useForm<z.infer<typeof magicSchema>>({
        resolver: zodResolver(magicSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: MagicFormValues) => {
        setIsLoading(true);
        setError(null);
        api.user.sendMagicLink.mutate(values.email, {
            onSuccess: () => {
                setFeedback('Magic link sent successfully! Please check your email. If you don\'t see the email,\n' +
                    '                        please check your spam folder');
                setIsLoading(false);
            },
            onError: (error) => {
                console.error('Error sending magic link:', error);
                setError(error.message || 'Failed to send magic link');
                setIsLoading(false);
            },
        });
    };

    const handleRequestAnother = () => {
        setFeedback(null);
        form.reset();
    };

    return (
        <FormWrapper
            heading="Request Magic Link"
            subheading="Enter your email to receive a login link"
            logo={{
                url: "https://www.shadcnblocks.com",
                src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
                alt: "Shadcnblocks",
            }}
            isLoading={isLoading}
            error={error}
            onErrorDismiss={() => setError(null)}
        >
            {feedback ? (
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <CheckCircle className="h-12 w-12 text-green-500"/>
                    </div>
                    <p className="text-green-600 font-medium">{feedback}</p>
                    <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={handleRequestAnother}
                    >
                        Request Another Link
                    </Button>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                          className="grid gap-4">
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
                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            disabled={isLoading}
                        >
                            Request Link
                        </Button>
                    </form>
                </Form>
            )}
        </FormWrapper>
    )
}