import { createFileRoute } from '@tanstack/react-router'
import {EmailActionForm, type EmailFormValues} from "@/components/foms/emailForm.tsx";
import {useApi} from "@/api/api.tsx";


export const PasswordResetRoute = createFileRoute('/requestNewPassword')({
    component: PasswordResetComponent,
})

function PasswordResetComponent() {
    const api = useApi();

    const handlePasswordReset = async (values: EmailFormValues) => {
        await new Promise((resolve, reject) => {
            api.user.sendUserPasswordReset.mutate(values.email, {
                onSuccess: resolve,
                onError: reject
            });
        });
    };

    return (
        <EmailActionForm
            title="Reset Password"
            subheading="Enter your email to receive a password reset link"
            logo={{
                url: "https://www.shadcnblocks.com",
                src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
                alt: "Shadcnblocks",
            }}
            buttonText="Reset Password"
            onSubmit={handlePasswordReset}
            successTitle="Reset Link Sent!"
            successMessage="Check your email for the password reset link. If you don't see it, please check your spam folder."
            successButtonText="Request New Reset Link"
        />
    );
}
