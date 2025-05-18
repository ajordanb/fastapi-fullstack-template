import {EmailActionForm, type EmailFormValues} from "@/components/foms/emailForm.tsx";
import {createFileRoute} from "@tanstack/react-router";
import {useApi} from "@/api/api.tsx";

export const Route = createFileRoute('/requestMagicLink')({
    component: MagicLinkRequestComponent,
})


function MagicLinkRequestComponent() {
    const api = useApi();

    const handleMagicLinkRequest = async (values: EmailFormValues) => {
        await new Promise((resolve, reject) => {
            api.user.sendMagicLink.mutate(values.email, {
                onSuccess: resolve,
                onError: reject
            });
        });
    };

    return (
        <EmailActionForm
            title="Request Magic Link"
            subheading="Enter your email to receive a login link"
            logo={{
                url: "https://www.shadcnblocks.com",
                src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
                alt: "Shadcnblocks",
            }}
            buttonText="Request Link"
            onSubmit={handleMagicLinkRequest}
            successTitle="Magic Link Sent!"
            successMessage="Check your email for the magic link. If you don't see it, please check your spam folder."
            successButtonText="Request Another Link"
        />
    );
}