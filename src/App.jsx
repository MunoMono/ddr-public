import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Theme, Loading } from "@carbon/react";
import { useAuth0 } from "@auth0/auth0-react";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import "@styles/index.scss";

const App = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, error } = useAuth0();
  const navigate = useNavigate();
  
  // Bypass Auth0 in local development
  const isLocalDev = import.meta.env.DEV;

  useEffect(() => {
    // Skip auth entirely in local development
    if (isLocalDev) return;
    
    // Skip redirect if we're already handling the callback
    const searchParams = new URLSearchParams(window.location.search);
    const hasAuthParams = searchParams.has('code') || searchParams.has('error');
    
    if (!isAuthenticated && !isLoading && !hasAuthParams) {
      loginWithRedirect({ 
        appState: { returnTo: window.location.pathname } 
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, isLocalDev]);

  if (error && !isLocalDev) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <h2>Authentication Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  if (isLoading && !isLocalDev) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <Loading description="Checking session…" withOverlay={false} />
      </div>
    );
  }

  if (!isAuthenticated && !isLocalDev) return null;

  return (
    <>
      <Header />
      <Theme theme="g10">
        <main id="main-content" className="app-shell">
          <Outlet />
        </main>
      </Theme>
      <Footer />
    </>
  );
};

export default App;
