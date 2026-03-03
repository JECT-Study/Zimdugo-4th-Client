import { m } from "@repo/i18n";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div>
      our journey
      <h1>{m.hello()}</h1>
    </div>
  );
}
