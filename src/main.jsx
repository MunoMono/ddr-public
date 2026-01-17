import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Research from "./pages/Research.jsx";
import Insights from "./pages/Insights.jsx";
import ApiSandbox from "./pages/ApiSandbox.jsx";
import Contact from "./pages/Contact.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";

// Respect Vite's configured base so dev/prod behave the same
const basename = import.meta.env.BASE_URL || "/";

// Auth0 configuration - uses environment variables for flexibility
// Ensure redirect_uri matches the actual app location (origin + basename)
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || "dev-i4m880asz7y6j5sk.us.auth0.com",
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "1tKb110HavDT3KsqC5P894JEOZ3fQXMm",
  authorizationParams: {
    redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || `${window.location.origin}${basename}`,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE || "https://api.ddrarchive.org",
  },
};

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Home /> },
        { path: "research", element: <Research /> },
        { path: "insights", element: <Insights /> },
        { path: "api", element: <ApiSandbox /> },
        { path: "contact", element: <Contact /> },
        { path: "privacy", element: <Privacy /> },
        { path: "terms", element: <Terms /> },
      ],
    },
  ],
  { basename }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider {...auth0Config}>
      <RouterProvider router={router} />
    </Auth0Provider>
  </StrictMode>
);
