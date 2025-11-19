import { useEffect, useState } from "react";
import { Grid, Column, InlineLoading, Button } from "@carbon/react";
import { UpToTop } from "@carbon/react/icons";

import PageHero from "../components/PageHero/PageHero";
import "../styles/components/_carbon-markdown.scss";

function scrollToTop() {
  const main = document.getElementById("main-content");
  if (main) {
    main.scrollIntoView({ behavior: "smooth", block: "start" });
    main.focus?.();
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function useMarkdown(src) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(src, { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${src}`);

        const text = await res.text();
        if (!alive) return;

        const [{ marked }, DOMPurifyMod] = await Promise.all([import("marked"), import("dompurify")]);
        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: true,
          mangle: false,
        });

        const dirty = marked.parse(text);
        const DOMPurify = DOMPurifyMod.default || DOMPurifyMod;
        const clean = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });

        if (alive) {
          setHtml(clean);
        }
      } catch (err) {
        if (alive) {
          setError(err);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [src]);

  return { html, loading, error };
}

const MarkdownSection = ({ src }) => {
  const { html, loading, error } = useMarkdown(src);

  if (loading) {
    return (
      <div style={{ padding: "0.5rem 0" }}>
        <InlineLoading description="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sg-callout sg-callout--error">
        <h4>Could not load content</h4>
        <p>{String(error.message || error)}</p>
      </div>
    );
  }

  return (
    <div className="carbon-markdown" dangerouslySetInnerHTML={{ __html: html }} />
  );
};

const FooterPage = ({ title, description, markdownSrc }) => {
  const heroId = title ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-hero` : "footer-hero";

  return (
    <div className="page footer-page">
      <PageHero id={heroId} title={title} lead={description} />

      <div className="page-content">
        <section className="page-section" aria-label={title}>
          <Grid condensed>
            <Column lg={8} md={8} sm={4}>
              <MarkdownSection src={markdownSrc} />
              <Button kind="ghost" size="sm" renderIcon={UpToTop} iconDescription="Top" onClick={scrollToTop}>
                Top
              </Button>
            </Column>
          </Grid>
        </section>
      </div>
    </div>
  );
};

export default FooterPage;
