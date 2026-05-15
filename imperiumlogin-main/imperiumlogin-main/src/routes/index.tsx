import { createFileRoute } from "@tanstack/react-router";
import RemixedPage from "@/components/RemixedPage";

export const Route = createFileRoute("/")({
  component: RemixedPage,
});
