import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/safety")({
  beforeLoad: () => {
    throw redirect({
      to: "/safety-driver",
    });
  },
  component: () => null,
});
