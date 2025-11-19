import React, { useEffect, useState } from "react";
import { Grid, Column, Heading, Button, Tag } from "@carbon/react";
import ReactMarkdown from "react-markdown";

const PRESETS = {
  tanaka: `{
  object(maker:"Ikko Tanaka", general:"poster", hasImages:true, size:12, page:1){
    id title summary date multimedia
  }
}`,
  yokoo: `{
  object(maker:"Tadanori Yokoo", general:"poster", hasImages:true, size:12){
    id title summary date multimedia
  }
}`,
  fukuda: `{
  object(maker:"Shigeo Fukuda", general:"poster", hasImages:true, size:12){
    id title summary date multimedia
  }
}`,
  kamekura: `{
  object(maker:"Yusaku Kamekura", general:"poster", hasImages:true, size:12){
    id title summary date multimedia
  }
}`,
  nagai: `{
  object(maker:"Kazumasa Nagai", general:"poster", hasImages:true, size:12){
    id title summary date multimedia
  }
}`,
};

function loadInEditor(query) {
  window.dispatchEvent(new CustomEvent("ch:loadPreset", { detail: query }));
}

export default function Snippets() {
  const [md, setMd] = useState("Loading…");
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}docs/snippets.md`);
        setMd(res.ok ? await res.text() : "Could not load snippets markdown.");
      } catch {
        setMd("Could not load snippets markdown.");
      }
    })();
  }, []);

  return (
    <>
      <div className="page-header">
        <Grid fullWidth>
          <Column lg={10} md={8} sm={4}>
            <Heading type="heading-03">Snippets</Heading>
          </Column>
        </Grid>
      </div>

      <section className="docs-panel-band">
        <div className="docs-panel-band__inner">
          <Grid fullWidth className="cds-stack">
            <Column lg={10} md={8} sm={4}>
              <div className="cds-card">
                <Tag type="cool-gray">Source: Cooper Hewitt GraphQL</Tag>
                <div className="carbon-markdown" style={{ marginTop: "1rem" }}>
                  <ReactMarkdown>{md}</ReactMarkdown>
                </div>
              </div>

              <div className="cds-card">
                <h3 className="cds-heading">Designer presets</h3>
                <p className="cds-subtle">Load directly into the editor (Try it out).</p>
                <div style={{ display: "flex", gap: "var(--cds-spacing-03)", flexWrap: "wrap" }}>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.tanaka)}>Ikko Tanaka</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.yokoo)}>Tadanori Yokoo</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.fukuda)}>Shigeo Fukuda</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.kamekura)}>Yusaku Kamekura</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.nagai)}>Kazumasa Nagai</Button>
                </div>
              </div>
            </Column>
          </Grid>
        </div>
      </section>
    </>
  );
}