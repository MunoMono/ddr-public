import { Grid, Column, Theme } from "@carbon/react";
import { Link } from "react-router-dom";

import versionInfo from "../../versionInfo.json";
import "../../styles/components/_footer.scss";

const Footer = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Theme theme="g100">
      <footer className="global-footer">
        <div className="footer-container left-aligned">
          <Grid className="footer-grid">
            <Column sm={4} md={2} lg={2}>
              <div className="footer-nav-wrapper">
                <ul className="footer-nav">
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/research">Research</Link>
                  </li>
                  <li>
                    <Link to="/insights">Insights</Link>
                  </li>
                  <li>
                    <Link to="/api">API</Link>
                  </li>
                </ul>
              </div>
            </Column>

            <Column sm={4} md={2} lg={2}>
              <div className="footer-nav-wrapper">
                <ul className="footer-nav">
                  <li>
                    <a href="https://github.com/MunoMono" target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.rca.ac.uk/study/programme-finder/communication-mphil-phd/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      RCA
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.vam.ac.uk/info/archives#archive-of-art-design"
                      target="_blank"
                      rel="noreferrer"
                    >
                      V&amp;A East Storehouse
                    </a>
                  </li>
                </ul>
              </div>
            </Column>

            <Column sm={4} md={4} lg={4} lgOffset={2}>
              <div className="footer-meta">
                <p>
                  Last updated {formattedDate}
                  <br />
                  {versionInfo.carbonMajor} Design System {versionInfo.carbonDesignSystem}
                  <br />
                  React @carbon/react {versionInfo.carbonReact}
                </p>
              </div>
            </Column>
          </Grid>
        </div>
      </footer>
    </Theme>
  );
};

export default Footer;
