import React, { useEffect, useState } from "react";
import { Grid, Column, Heading, Button, Tag } from "@carbon/react";
import ReactMarkdown from "react-markdown";

const PRESETS = {
  recentItems: `{
  items_recent(limit: 12) {
    pid
    title
    updated_at
    scope_and_content
    jpg_derivatives {
      signed_url
      filename
    }
  }
}`,
  allRecords: `{
  records_v1 {
    id
    pid
    title
    date_begin
    date_end
    scope_and_content
  }
}`,
  recordWithImages: `{
  record_v1(id: 71) {
    pid
    title
    scope_and_content
    jpg_derivatives {
      signed_url
      filename
      role
    }
  }
}`,
  refFonds: `{
  ref_fonds {
    id
    code
    label
    notes
  }
}`,
  refPeriods: `{
  ref_ddr_period {
    slug
    label
    description
  }
}`,
  allStaff: `{
  agents {
    staff_code
    slug
    display_name
    email
    kind
    active
  }
}`,
  ddrProjects: `{
  ddr_projects {
    job_number
    title
    funder_name
    start_year
    end_year
    project_lead_name
    researcher1_name
    researcher2_name
    ddr_period_label
  }
}`,
};

function loadInEditor(query) {
  window.dispatchEvent(new CustomEvent("ddr:loadPreset", { detail: query }));
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
                <Tag type="cool-gray">Source: DDR Archive GraphQL API</Tag>
                <div className="carbon-markdown" style={{ marginTop: "1rem" }}>
                  <ReactMarkdown>{md}</ReactMarkdown>
                </div>
              </div>

              <div className="cds-card">
                <h3 className="cds-heading">DDR Query Presets</h3>
                <p className="cds-subtle">Load directly into the editor (Try it out).</p>
                <div style={{ display: "flex", gap: "var(--cds-spacing-03)", flexWrap: "wrap" }}>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.recentItems)}>Recent Items</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.allRecords)}>All Records</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.recordWithImages)}>Record with Images</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.refFonds)}>Reference: Fonds</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.refPeriods)}>Reference: Periods</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.allStaff)}>All Staff</Button>
                  <Button kind="tertiary" onClick={() => loadInEditor(PRESETS.ddrProjects)}>DDR Projects</Button>
                </div>
              </div>
            </Column>
          </Grid>
        </div>
      </section>
    </>
  );
}