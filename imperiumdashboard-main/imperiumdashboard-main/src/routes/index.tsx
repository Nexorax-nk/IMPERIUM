import { createFileRoute } from "@tanstack/react-router";
import DashboardApp from "@/components/DashboardApp";

export const Route = createFileRoute("/")({
  component: DashboardApp,
});
