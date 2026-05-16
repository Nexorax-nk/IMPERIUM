import { createFileRoute } from "@tanstack/react-router";
import ImperiumIntro from "@/components/ImperiumIntro";

export const Route = createFileRoute("/")({
  component: ImperiumIntro,
});
