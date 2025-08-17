import { createFileRoute } from '@tanstack/react-router'
import {Signup} from "@/components/pages/signup/signup.tsx";

export const Route = createFileRoute('/register')({
  component: Signup,
})
