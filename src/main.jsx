import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
    <RouterProvider router={router} />
  </StrictMode>
);
