import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Research from "./pages/Research.jsx";
import Insights from "./pages/Insights.jsx";
import ApiSandbox from "./pages/ApiSandbox.jsx";

// Use "/" in dev, "/ddr-public" on GitHub Pages
const basename = import.meta.env.DEV ? "/" : "/ddr-public";

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