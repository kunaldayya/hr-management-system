import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FluentProvider, webDarkTheme } from "@fluentui/react-components";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// 1. Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={webDarkTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FluentProvider>
    </QueryClientProvider>
  </React.StrictMode>
);