
import {
    createFileRoute
} from "@tanstack/react-router";
import {Login} from "@/components/pages/login/login.tsx";


export const Route = createFileRoute("/login")({
    component: Login,
});