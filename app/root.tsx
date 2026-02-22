import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import type { Route } from "./+types/root";
import { getSessionUser } from "./lib/session.server";
import "./app.css";

// Create Material-UI theme
const theme = createTheme();

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getSessionUser(request);
  return { user };
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        {loaderData.user && (
          <nav className="bg-gray-800 text-white p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <a href="/" className="font-bold text-lg">
                Form Builder
              </a>
              <div className="flex items-center gap-4">
                <span>Hello, {loaderData.user.username}!</span>
                <a
                  href="/admin"
                  className="px-4 py-2 rounded text-white no-underline"
                  style={{
                    backgroundColor: "#1976d2",
                    transition: "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1565c0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#1976d2";
                  }}
                >
                  Admin-panel
                </a>
                <form method="POST" action="/auth/logout">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </nav>
        )}
        <Outlet context={{ user: loaderData.user }} />
      </div>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
