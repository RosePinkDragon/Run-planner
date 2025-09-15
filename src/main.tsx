import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "@/components/ui/provider";
import { RunsProvider } from "@/store/runs";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <RunsProvider>
        <App />
      </RunsProvider>
    </Provider>
  </StrictMode>
);
