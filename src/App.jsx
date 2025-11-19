import { Outlet } from "react-router-dom";
import { Theme } from "@carbon/react";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import "@styles/index.scss";

const App = () => {
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
