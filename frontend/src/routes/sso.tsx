import { createFileRoute } from "@tanstack/react-router";
import { SSOPage } from "@/components/pages/sso/sso";

type SSOSearch = {
  token?: string;
};

export const Route = createFileRoute("/sso")({
  component: SSOPage,
  validateSearch: (search: Record<string, unknown>): SSOSearch => {
    return {
      token: (search.token as string) || undefined,
    };
  },
});