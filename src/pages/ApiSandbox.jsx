import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import {
  Button,
  ButtonSet,
  CodeSnippet,
  Column,
  ComboBox,
  Grid,
  Heading,
  InlineLoading,
  InlineNotification,
  Loading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Theme,
  Tile,
  ToastNotification,
} from "@carbon/react";
import { Save } from "@carbon/icons-react";

import PageHero from "../components/PageHero/PageHero";
import AnchorLinks from "../components/AnchorLinks/AnchorLinks";

const REST_PRESETS = [
  {
    id: "recentItems",
    name: "Recent DDR items",
    description: "Fetch the most recently updated items from the DDR archive.",
    request:
      "POST https://ddrarchive.org/graphql",
    response: `{
  "data": {
    "items_recent": [
      {
        "pid": "347814935048",
        "title": "Design Research Documentation",
        "updated_at": "2024-11-28T10:30:00"
      }
    ]
  }
}`,
  },
  {
    id: "allRecords",
    name: "All archive records",
    description: "Query all records in the DDR archive with metadata.",
    request:
      "POST https://ddrarchive.org/graphql",
    response: `{
  "data": {
    "records_v1": [
      {
        "id": "71",
        "pid": "347814935048",
        "title": "Research Project Alpha",
        "date_begin": "1972-01-01"
      }
    ]
  }
}`,
  },
  {
    id: "refData",
    name: "Reference data",
    description: "Fetch DDR taxonomy reference data like fonds and periods.",
    request:
      "POST https://ddrarchive.org/graphql",
    response: `{
  "data": {
    "ref_fonds": [
      {
        "id": "1",
        "code": "DDR",
        "label": "Design Research"
      }
    ]
  }
}`,
  },
  {
    id: "singleRecord",
    name: "Single record detail",
    description: "Get detailed information for a specific archive record by ID.",
    request:
      "POST https://ddrarchive.org/graphql",
    response: `{
  "data": {
    "record_v1": {
      "id": "71",
      "pid": "347814935048",
      "title": "Research Documentation",
      "scope_and_content": "Detailed research materials..."
    }
  }
}`,
  },
];

const SNIPPETS = [
  {
    id: "curl",
    label: "cURL",
    code: `curl -X POST https://ddrarchive.org/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{ items_recent(limit: 10) { pid title } }"}'`
  },
  {
    id: "js",
    label: "JavaScript fetch",
    code: `const response = await fetch("https://ddrarchive.org/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: \`{
      items_recent(limit: 10) {
        pid
        title
        jpg_derivatives { signed_url }
      }
    }\`
  })
});
const data = await response.json();`,
  },
  {
    id: "python",
    label: "Python requests",
    code: `import requests

query = """
{
  records_v1 {
    pid
    title
    jpg_derivatives {
      signed_url
      filename
    }
  }
}
"""

response = requests.post(
    "https://ddrarchive.org/graphql",
    json={"query": query}
)
data = response.json()`,
  },
];

const SNIPPETS_URL = `${import.meta.env.BASE_URL}docs/snippets.md`;

const endpoint = import.meta.env.DEV
  ? "http://localhost:8000/graphql"
  : "https://ddrarchive.org/graphql";

const displayEndpoint = import.meta.env.DEV
  ? "localhost:8000/graphql"
  : "ddrarchive.org/graphql";

const DEFAULT_QUERY = `# Recent DDR Archive items
{
  items_recent(limit: 12) {
    pid
    title
    scope_and_content
    copyright_holder
    jpg_derivatives {
      signed_url
      filename
    }
    pdf_files {
      signed_url
      filename
    }
  }
}`;

const DESIGNER_PRESETS = {
  recentItems: `# Recent DDR items with Linked Data endpoints
{
  items_recent(limit: 12) {
    pid
    title
    scope_and_content
    project_theme
    extent_unit
    creatorcorporate_id
    ddr_period
    fonds_code
    access_level
    copyright_holder
    date_begin
    date_end
    reference_code
    project_team_staff
    jpg_derivatives {
      signed_url
      filename
    }
    pdf_files {
      signed_url
      filename
    }
    linked_art_jsonld_url
    linked_art_turtle_url
    linked_art_rdfxml_url
  }
}`,
  allRecords: `# All records (both S3 media items and postgres records)
{
  items_recent(limit: 50) {
    pid
    title
    scope_and_content
    project_theme
    extent_unit
    creatorcorporate_id
    ddr_period
    fonds_code
    access_level
    copyright_holder
    date_begin
    date_end
    reference_code
    jpg_derivatives {
      signed_url
      filename
    }
    pdf_files {
      signed_url
      filename
    }
    linked_art_jsonld_url
    linked_art_turtle_url
    linked_art_rdfxml_url
  }
}`,
  recordsWithImages: `# Records with images
{
  records_v1 {
    id
    pid
    title
    date_begin
    copyright_holder
    jpg_derivatives {
      signed_url
      filename
    }
    linked_art_jsonld_url
    linked_art_turtle_url
    linked_art_rdfxml_url
  }
}`,
  recordsWithPDFs: `# Records with PDF files
{
  items_recent(limit: 50) {
    pid
    title
    scope_and_content
    copyright_holder
    jpg_derivatives {
      signed_url
      filename
    }
    pdf_files {
      signed_url
      filename
    }
    linked_art_jsonld_url
    linked_art_turtle_url
    linked_art_rdfxml_url
  }
}`,
  singleRecord: `# Single record with attached media + Linked Data
{
  record_v1(id: "19") {
    pid
    title
    payload
    copyright_holder
    linked_art_jsonld_url
    linked_art_turtle_url
    linked_art_rdfxml_url
    attached_media {
      pid
      title
      copyright_holder
      pdf_files {
        signed_url
        filename
      }
      jpg_derivatives {
        signed_url
        filename
      }
      linked_art_jsonld_url
      linked_art_turtle_url
      linked_art_rdfxml_url
    }
  }
}`,
  refFonds: `# Reference: Fonds
{
  ref_fonds {
    id
    code
    label
    notes
  }
}`,
  refPeriods: `# Reference: DDR Periods
{
  ref_ddr_period {
    slug
    label
    description
  }
}`,
  ddrPeople: `# DDR People
{
  agents {
    staff_code
    slug
    display_name
  }
}`,
  ddrProjects: `# DDR Projects
{
  ddr_projects {
    job_number
    title
    funder_name
    start_year
    end_year
    duration_text
    project_lead_name
    researcher1_name
    researcher2_name
    ddr_period_label
  }
}`,
  // Authority presets - showcasing database authorities
  authDdrStaff: `# DDR Staff (Core Agent)
{
  ref_ddr_staff {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authJobList: `# DDR Job List (Project Register)
{
  ref_job_title {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authBeneficiaryAudience: `# Beneficiary Audience
{
  ref_beneficiary_audience {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authDdrPeriod: `# DDR Period
{
  ref_ddr_period {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authDepartment: `# DDR Department (Department Unit)
{
  ref_department_unit {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authEpistemicStance: `# Epistemic Stance
{
  ref_epistemic_stance {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authArtefactType: `# Artefact Type (Extent Unit)
{
  ref_extent_unit {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authFonds: `# Fonds
{
  ref_fonds {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authMethodology: `# Methodology
{
  ref_methodology {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authProjectOutcome: `# Project Outcome
{
  ref_project_outcome {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authProjectTheme: `# Project Theme
{
  ref_project_theme {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authPublicationType: `# Publication Type
{
  ref_publication_type {
    id
    code
    label
    slug
    description
    notes
  }
}`,
  authCategory: `# Category (Series Category)
{
  ref_series_category {
    id
    code
    label
    slug
    description
    notes
  }
}`,
};

const API_NAV_TABS = [
  { id: "api-getting-started", label: "Getting started" },
  { id: "api-graphql-sandbox", label: "GraphQL sandbox" },
  { id: "api-presets", label: "Presets and snippets" },
];

const GETTING_STARTED_ANCHORS = [
  { id: "authentication", label: "Authentication" },
  { id: "request-format", label: "Request format" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "query-parameters", label: "Query parameters" },
];

const PRESETS_ANCHORS = [
  { id: "rest-examples", label: "REST examples" },
  { id: "graphql-presets", label: "GraphQL presets" },
  { id: "code-snippets", label: "Code snippets" },
  { id: "response-formats", label: "Response formats" },
];

const getThemePreference = () => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return (
    root.classList.contains("cds-theme-g90") ||
    root.classList.contains("cds-theme-g100")
  );
};

const ApiSandbox = () => {
  const [selectedPreset, setSelectedPreset] = useState(REST_PRESETS[0]);
  const [activeSnippet, setActiveSnippet] = useState(SNIPPETS[0].id);
  const [isDark, setIsDark] = useState(getThemePreference);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [loading, setLoading] = useState(false);
  const [json, setJson] = useState(null);
  const [error, setError] = useState(null);
  const [snippetsMd, setSnippetsMd] = useState("Loading...");
  const sandboxRef = useRef(null);
  const [activeApiTab, setActiveApiTab] = useState(0);
  const [variables, setVariables] = useState('{}');
  const [resultPct, setResultPct] = useState(40);
  const [showResults, setShowResults] = useState(true);
  const [presetLoadedNotification, setPresetLoadedNotification] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [savedQueries, setSavedQueries] = useState(() => {
    try {
      const saved = localStorage.getItem('ddr-graphql-saved-queries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentSnippet = useMemo(
    () => SNIPPETS.find((snippet) => snippet.id === activeSnippet) || SNIPPETS[0],
    [activeSnippet]
  );

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const observer = new MutationObserver(() => setIsDark(getThemePreference()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const monacoTheme = isDark ? "vs-dark" : "vs-light";

  const loadPreset = useCallback((preset) => {
    if (!preset) return;
    setQuery(preset);
    setJson(null);
    setError(null);
    // ensure user sees the GraphQL sandbox panel when loading a preset
    setActiveApiTab(1);
    sandboxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setPresetLoadedNotification(true);
    setTimeout(() => setPresetLoadedNotification(false), 3000);
  }, []);

  useEffect(() => {
    function onLoadPreset(e) {
      const preset = e?.detail;
      if (!preset) return;
      loadPreset(preset);
      sandboxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.addEventListener("ch:loadPreset", onLoadPreset);
    return () => window.removeEventListener("ch:loadPreset", onLoadPreset);
  }, [loadPreset]);

  const handleHeroTabSelect = useCallback((_, index) => {
    setActiveApiTab(index);
  }, []);

  const runQuery = useCallback(
    async (nextQuery) => {
      if (loading) return;
      const payload = nextQuery ?? query;
      if (!payload?.trim()) return;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: payload }),
        });
        const payloadJson = await res.json();
        if (payloadJson.errors)
          throw new Error(payloadJson.errors.map((e) => e.message).join("\n"));
        setJson(payloadJson.data);
        // Add to query history
        setQueryHistory((prev) => [
          { query: payload, timestamp: Date.now(), id: Date.now() },
          ...prev.slice(0, 9)
        ]);
      } catch (err) {
        setJson(null);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    },
    [loading, query]
  );

  const clearAll = useCallback(() => {
    if (loading) return;
    setQuery(DEFAULT_QUERY);
    setJson(null);
    setError(null);
  }, [loading]);

  const saveQuery = useCallback(() => {
    const name = prompt('Name this query:');
    if (!name) return;
    const newSaved = [...savedQueries, { id: Date.now(), name, query }];
    setSavedQueries(newSaved);
    try {
      localStorage.setItem('ddr-graphql-saved-queries', JSON.stringify(newSaved));
    } catch (e) {
      console.error('Failed to save query:', e);
    }
  }, [query, savedQueries]);

  const loadSavedQuery = useCallback((saved) => {
    setQuery(saved.query);
  }, []);

  const deleteSavedQuery = useCallback((id) => {
    const newSaved = savedQueries.filter((q) => q.id !== id);
    setSavedQueries(newSaved);
    try {
      localStorage.setItem('ddr-graphql-saved-queries', JSON.stringify(newSaved));
    } catch (e) {
      console.error('Failed to delete query:', e);
    }
  }, [savedQueries]);

  const saveSnippet = useCallback(() => {
    const ts = new Date().toISOString().replace(/[:]/g, "-");
    const filename = `snippet-${ts}.txt`;
    const blob = new Blob([query ?? ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [query]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(SNIPPETS_URL);
        const text = res.ok
          ? await res.text()
          : "Could not load snippets markdown.";
        if (active) setSnippetsMd(text);
      } catch {
        if (active) setSnippetsMd("Could not load snippets markdown.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const mdComponents = useMemo(
    () => ({
      pre: ({ children }) => <>{children}</>,
      code: ({ inline, className, children }) => {
        const text = String(children).replace(/\n$/, "");
        if (inline) {
          return <code className={className}>{text}</code>;
        }
        return (
          <div style={{ margin: "var(--cds-spacing-05) 0" }}>
            <CodeSnippet
              type="multi"
              wrapText
              feedback="Copied!"
              copyButtonDescription="Copy code"
              aria-label="Code snippet"
            >
              {text}
            </CodeSnippet>
          </div>
        );
      },
    }),
    []
  );

  function extractImage(o) {
    let src = o?.multimedia?.preview?.location;
    if (!src && o?.multimedia) {
      try {
        const mm =
          typeof o.multimedia === "string"
            ? JSON.parse(o.multimedia)
            : o.multimedia;

        if (Array.isArray(mm)) {
          const m0 = mm[0];
          if (m0?.preview) {
            src =
              typeof m0.preview === "string"
                ? m0.preview
                : m0.preview.url || m0.preview.location;
          }
          if (!src && m0?.large) {
            src =
              typeof m0.large === "string"
                ? m0.large
                : m0.large.url || m0.large.location;
          }
        }

        if (!src && mm && typeof mm === "object") {
          if (mm.preview) {
            src =
              typeof mm.preview === "string"
                ? mm.preview
                : mm.preview.url || mm.preview.location;
          }
          if (!src && mm.large) {
            src =
              typeof mm.large === "string"
                ? mm.large
                : mm.large.url || mm.large.location;
          }
          if (!src && mm.url) src = mm.url;
          if (!src && mm.image) src = mm.image;
        }
      } catch {
        // ignore JSON issues so the UI keeps working
      }
    }
    return src;
  }

  const selectedIndex = SNIPPETS.findIndex((snippet) => snippet.id === activeSnippet);

  return (
    <div className="page api-page">
      <PageHero
        id="api"
        eyebrow="API"
        title="DDR API landing"
        lead="Carbon-native tabs keep the narrative intact while the DDR GraphQL sandbox runs live queries for demos and workshops."
        tabs={API_NAV_TABS}
        tabAriaLabel="API sections"
        activeTab={activeApiTab}
        onTabSelect={handleHeroTabSelect}
      />

      <Theme theme="g10">
        <div className="page-content">
          <section className="page-section" id="main-content">
            <Grid condensed>
              <Column lg={14} md={8} sm={4}>
              {activeApiTab === 0 && (
                <>
                  <Heading type="heading-03" className="tab-lead">
                    DDR's API uses GraphQL and REST endpoints. The GraphQL sandbox connects to the DDR archive for live queries during development and demos. Follow these steps to get started with authentication and rate limits.
                  </Heading>
                  <AnchorLinks links={GETTING_STARTED_ANCHORS} />
                <h2>Three simple steps</h2>
                <p>
                  The DDR Archive API uses GraphQL to query archival records, items, and reference data.
                  The GraphQL sandbox below connects to <code>ddrarchive.org/graphql</code> for live
                  queries during development and demos.
                </p>
                <ol className="api-page__list">
                  <li>
                    <strong>Endpoint:</strong> All queries go to
                    <code> https://ddrarchive.org/graphql</code> via POST request.
                  </li>
                  <li>
                    <strong>Authentication:</strong> Currently open for development. Production deployments
                    will require Auth0 tokens via Authorization header.
                  </li>
                  <li>
                    <strong>Response format:</strong> All responses return JSON with a
                    <code> data</code> field containing your query results.
                  </li>
                </ol>
                <p>
                  The API exposes archival records, digital items, reference data (fonds, series, periods),
                  and presigned URLs for media derivatives. Use the sandbox to explore the schema or check
                  the GraphQL introspection for full field documentation.
                </p>

                <h3 style={{ marginTop: "var(--cds-spacing-07)" }}>Available queries</h3>
                <p className="cds-subtle">Use these GraphQL queries to retrieve DDR data:</p>
                <ul className="api-page__list">
                  <li><code>items_recent(limit: Int!)</code> — Fetch recently updated items with metadata and images</li>
                  <li><code>records_v1(status: String)</code> — Retrieve archival records (fonds, series, items)</li>
                  <li><code>record_v1(id: Int!)</code> — Get a single record by database ID</li>
                  <li><code>ref_fonds</code>, <code>ref_ddr_period</code>, <code>ref_series</code> — Reference data lists</li>
                  <li><code>jpg_derivatives</code> — Presigned URLs for image thumbnails and previews</li>
                </ul>

                <h3 style={{ marginTop: "var(--cds-spacing-07)" }}>Example request</h3>
                <CodeSnippet type="multi" wrapText>
                  {`curl -X POST https://ddrarchive.org/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{ items_recent(limit: 5) { pid title } }"}'`}
                </CodeSnippet>

                <h3 style={{ marginTop: "var(--cds-spacing-05)" }}>Example response</h3>
                <CodeSnippet type="multi" wrapText>
                  {`{
  "data": {
    "items_recent": [
      {
        "pid": "347814935048",
        "title": "Design Research Documentation"
      }
    ]
  }
}`}
                </CodeSnippet>
                </>
              )}

              {activeApiTab === 1 && (
              <>
                {/* No tab-lead or anchor links for GraphQL Sandbox */}
            <div style={{ marginTop: "var(--cds-spacing-05)" }}>
            <Theme theme={isDark ? "g90" : "g10"}>
              <section ref={sandboxRef} className="graphql-sandbox">
                <div className="sandbox-inner">
                  <Loading active={loading} withOverlay description="Querying DDR API..." />
                  <Grid fullWidth className="sandbox-grid">
                    {/* Editor & Controls Column - Compact for max results space */}
                    <Column lg={6} md={4} sm={4} className="sandbox-editor-column">
                      <div className="sandbox-toolbar-wrapper">
                        <div className="toolbar-primary">
                          <ButtonSet>
                            <Button 
                              onClick={() => runQuery()} 
                              kind="primary" 
                              disabled={loading}
                            >
                              {loading ? <InlineLoading description="Running..." /> : "Run query"}
                            </Button>
                            <Button 
                              onClick={clearAll} 
                              kind="secondary" 
                              disabled={loading}
                            >
                              Clear
                            </Button>
                          </ButtonSet>
                        </div>
                        <div className="toolbar-secondary">
                          <ComboBox
                            id="records-preset-picker"
                            titleText=""
                            placeholder="Records..."
                            size="md"
                            light
                            items={[
                              { id: 'recentItems', label: 'Recent items', query: DESIGNER_PRESETS.recentItems },
                              { id: 'allRecords', label: 'All records', query: DESIGNER_PRESETS.allRecords },
                              { id: 'recordsWithImages', label: 'Records with images', query: DESIGNER_PRESETS.recordsWithImages },
                              { id: 'recordsWithPDFs', label: 'Records with PDFs', query: DESIGNER_PRESETS.recordsWithPDFs },
                              { id: 'singleRecord', label: 'Single record', query: DESIGNER_PRESETS.singleRecord },
                              { id: 'refFonds', label: 'Reference: Fonds', query: DESIGNER_PRESETS.refFonds },
                              { id: 'refPeriods', label: 'Reference: Periods', query: DESIGNER_PRESETS.refPeriods },
                              { id: 'ddrPeople', label: 'DDR People', query: DESIGNER_PRESETS.ddrPeople },
                              { id: 'ddrProjects', label: 'DDR Projects', query: DESIGNER_PRESETS.ddrProjects },
                            ]}
                            itemToString={(item) => (item ? item.label : '')}
                            onChange={({ selectedItem }) => selectedItem && loadPreset(selectedItem.query)}
                          />
                          <ComboBox
                            id="authorities-preset-picker"
                            titleText=""
                            placeholder="DB Authorities..."
                            size="md"
                            light
                            items={[
                              { id: 'authDdrStaff', label: 'DDR Staff (core agent)', query: DESIGNER_PRESETS.authDdrStaff },
                              { id: 'authJobList', label: 'DDR Job List (project register)', query: DESIGNER_PRESETS.authJobList },
                              { id: 'authBeneficiaryAudience', label: 'Beneficiary Audience', query: DESIGNER_PRESETS.authBeneficiaryAudience },
                              { id: 'authDdrPeriod', label: 'DDR Period', query: DESIGNER_PRESETS.authDdrPeriod },
                              { id: 'authDepartment', label: 'DDR Department (department unit)', query: DESIGNER_PRESETS.authDepartment },
                              { id: 'authEpistemicStance', label: 'Epistemic Stance', query: DESIGNER_PRESETS.authEpistemicStance },
                              { id: 'authArtefactType', label: 'Artefact Type (extent unit)', query: DESIGNER_PRESETS.authArtefactType },
                              { id: 'authFonds', label: 'Fonds', query: DESIGNER_PRESETS.authFonds },
                              { id: 'authMethodology', label: 'Methodology', query: DESIGNER_PRESETS.authMethodology },
                              { id: 'authProjectOutcome', label: 'Project Outcome', query: DESIGNER_PRESETS.authProjectOutcome },
                              { id: 'authProjectTheme', label: 'Project Theme', query: DESIGNER_PRESETS.authProjectTheme },
                              { id: 'authPublicationType', label: 'Publication Type', query: DESIGNER_PRESETS.authPublicationType },
                              { id: 'authCategory', label: 'Category (series category)', query: DESIGNER_PRESETS.authCategory },
                            ]}
                            itemToString={(item) => (item ? item.label : '')}
                            onChange={({ selectedItem }) => selectedItem && loadPreset(selectedItem.query)}
                          />
                        </div>
                      </div>

                      <div className="editor-card">
                        <div className="editor-container">
                          <Editor
                            height="100%"
                            defaultLanguage="graphql"
                            value={query}
                            theme={monacoTheme}
                            onChange={(value) => !loading && setQuery(value ?? "")}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              lineHeight: 20,
                              tabSize: 2,
                              automaticLayout: true,
                              readOnly: loading,
                              scrollBeyondLastLine: false,
                              renderLineHighlight: 'all',
                            }}
                          />
                        </div>
                      </div>

                      <div className="history-card">
                        <ButtonSet stacked={false}>
                          <Button 
                            kind="ghost" 
                            size="sm" 
                            renderIcon={Save} 
                            onClick={saveQuery}
                          >
                            Save query
                          </Button>
                          <Button 
                            kind="ghost" 
                            size="sm" 
                            renderIcon={Save} 
                            onClick={saveSnippet}
                          >
                            Download snippet
                          </Button>
                        </ButtonSet>

                        {savedQueries.length > 0 && (
                          <div className="history-section">
                            <h5 className="history-heading">Saved queries</h5>
                            <div className="history-list">
                              {savedQueries.map((sq) => (
                                <Tile key={sq.id} className="history-tile" light>
                                  <div className="tile-content">
                                    <button
                                      onClick={() => loadSavedQuery(sq)}
                                      className="tile-button"
                                    >
                                      {sq.name}
                                    </button>
                                    <Button 
                                      kind="ghost" 
                                      size="sm" 
                                      hasIconOnly 
                                      iconDescription="Delete"
                                      onClick={() => deleteSavedQuery(sq.id)}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                </Tile>
                              ))}
                            </div>
                          </div>
                        )}

                        {queryHistory.length > 0 && (
                          <div className="history-section">
                            <h5 className="history-heading">Recent queries</h5>
                            <div className="history-list">
                              {queryHistory.slice(0, 5).map((qh) => (
                                <Tile 
                                  key={qh.id}
                                  className="history-tile clickable"
                                  light
                                  onClick={() => setQuery(qh.query)}
                                >
                                  <code className="history-preview">
                                    {qh.query.trim().split('\n')[0].substring(0, 60)}
                                  </code>
                                  <span className="history-timestamp">
                                    {new Date(qh.timestamp).toLocaleTimeString()}
                                  </span>
                                </Tile>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Column>

                    {/* Results Column - Maximized for TIFF/PDF display */}
                    <Column lg={10} md={4} sm={4} className="sandbox-results-column">
                      <div className="sandbox-toolbar-wrapper">
                      <div className="results-wrapper">
                      <div className="cds-card results-panel">
                        <h3 className="cds-heading">Results</h3>
                        {error && (
                          <p style={{ color: "var(--cds-support-error)" }}>{error}</p>
                        )}
                        {!error && !json && !loading && (
                          <p className="cds-subtle">Run a query to see results.</p>
                        )}

                        {/* Handle DDR items_recent, records_v1, etc */}
                        {!error && json && (
                          <>
                            {(json.items_recent || json.records_v1) && (
                              <div className="cds-grid" style={{ marginTop: "var(--cds-spacing-03)" }}>
                                {(json.items_recent || json.records_v1)?.map((item) => {
                                  // Extract JPG thumbnail - prefer thumb, then display, then any jpg
                                  const jpgThumb = item.jpg_derivatives?.find(d => d.role === 'jpg_thumb' || d.filename?.includes('thumb'));
                                  const jpgDisplay = item.jpg_derivatives?.find(d => d.role === 'jpg_display' || d.filename?.includes('display'));
                                  const jpg = jpgThumb || jpgDisplay || item.jpg_derivatives?.[0];
                                  
                                  // Extract first PDF from pdf_files array
                                  const pdf = item.pdf_files?.[0];
                                  
                                  // Determine link target (PDF if available, otherwise JPG)
                                  const linkUrl = pdf?.signed_url || jpg?.signed_url;
                                  const thumbUrl = jpg?.signed_url;
                                  
                                  const titleText = item.title || item.pid || item.id;
                                  const content = item.scope_and_content;

                                  return (
                                    <figure key={item.id || item.pid} className="cds-figure cds-card-tile">
                                      {thumbUrl ? (
                                        <a
                                          href={linkUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={pdf ? `View PDF: ${titleText}` : `View image: ${titleText}`}
                                        >
                                          <img
                                            src={thumbUrl}
                                            alt={titleText}
                                            className="cds-thumb"
                                          />
                                        </a>
                                      ) : pdf ? (
                                        <a
                                          href={pdf.signed_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={`View PDF: ${titleText}`}
                                        >
                                          <div className="cds-thumb cds-thumb--placeholder" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '3rem',
                                            color: '#525252'
                                          }}>
                                            📄
                                          </div>
                                        </a>
                                      ) : (
                                        <div className="cds-thumb cds-thumb--placeholder">no image</div>
                                      )}
                                      <figcaption className="cds-figcaption">
                                        <strong>{titleText}</strong>
                                        {pdf && <><br/><div style={{marginTop: '0.5rem'}}><a href={pdf.signed_url} target="_blank" rel="noopener noreferrer" style={{color: '#0f62fe', textDecoration: 'none'}}>📄 View artefact</a></div></>}
                                        {jpg && !pdf && <><br/><div style={{marginTop: '0.5rem'}}><small style={{color: '#525252'}}>View image</small></div></>}
                                      </figcaption>
                                    </figure>
                                  );
                                })}
                              </div>
                            )}

                            {/* Handle single record_v1 with attached_media */}
                            {json.record_v1 && (
                              <div style={{ marginTop: "var(--cds-spacing-05)" }}>
                                <h4 style={{ marginBottom: "var(--cds-spacing-03)" }}>
                                  {json.record_v1.title}
                                </h4>
                                
                                {/* Show attached media if available */}
                                {json.record_v1.attached_media && json.record_v1.attached_media.length > 0 && (
                                  <>
                                    <h5 style={{ marginTop: "var(--cds-spacing-05)", marginBottom: "var(--cds-spacing-03)" }}>
                                      Attached Media
                                    </h5>
                                    <div className="cds-grid">
                                      {json.record_v1.attached_media.map((media, idx) => {
                                        const jpg = media.jpg_derivatives?.[0];
                                        const pdf = media.pdf_files?.[0];
                                        const linkUrl = pdf?.signed_url || jpg?.signed_url;
                                        const thumbUrl = jpg?.signed_url;
                                        
                                        return (
                                          <figure key={idx} className="cds-figure cds-card-tile">
                                            {thumbUrl ? (
                                              <a href={linkUrl} target="_blank" rel="noopener noreferrer" title={`View ${pdf ? 'PDF' : 'image'}: ${media.title}`}>
                                                <img src={thumbUrl} alt={media.title} className="cds-thumb" />
                                              </a>
                                            ) : pdf ? (
                                              <a href={pdf.signed_url} target="_blank" rel="noopener noreferrer" title={`View PDF: ${media.title}`}>
                                                <div className="cds-thumb cds-thumb--placeholder" style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  fontSize: '3rem',
                                                  color: '#525252'
                                                }}>
                                                  📄
                                                </div>
                                              </a>
                                            ) : null}
                                            <figcaption className="cds-figcaption">
                                              <strong>{media.title}</strong>
                                              {pdf && <><br/><small style={{color: '#525252'}}>📄 {pdf.filename}</small></>}
                                              {jpg && !pdf && <><br/><small>{jpg.filename}</small></>}
                                            </figcaption>
                                          </figure>
                                        );
                                      })}
                                    </div>
                                  </>
                                )}
                                
                                {/* Show record's own jpg_derivatives if available */}
                                {json.record_v1.jpg_derivatives && json.record_v1.jpg_derivatives.length > 0 && (
                                  <>
                                    <h5 style={{ marginTop: "var(--cds-spacing-05)", marginBottom: "var(--cds-spacing-03)" }}>
                                      Images
                                    </h5>
                                    <div className="cds-grid">
                                      {json.record_v1.jpg_derivatives.map((jpg, idx) => (
                                        <figure key={idx} className="cds-figure cds-card-tile">
                                          <a href={jpg.signed_url} target="_blank" rel="noopener noreferrer">
                                            <img src={jpg.signed_url} alt={json.record_v1.title} className="cds-thumb" />
                                          </a>
                                          <figcaption className="cds-figcaption">
                                            <strong>{json.record_v1.title}</strong>
                                            <br/><small>{jpg.filename}</small>
                                          </figcaption>
                                        </figure>
                                      ))}
                                    </div>
                                  </>
                                )}
                                
                                {/* Show record's own pdf_files if available */}
                                {json.record_v1.pdf_files && json.record_v1.pdf_files.length > 0 && (
                                  <>
                                    <h5 style={{ marginTop: "var(--cds-spacing-05)", marginBottom: "var(--cds-spacing-03)" }}>
                                      PDF Files
                                    </h5>
                                    <div className="cds-grid">
                                      {json.record_v1.pdf_files.map((pdf, idx) => (
                                        <figure key={`pdf-${idx}`} className="cds-figure cds-card-tile">
                                          <a href={pdf.signed_url} target="_blank" rel="noopener noreferrer">
                                            <div className="cds-thumb cds-thumb--placeholder" style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '3rem',
                                              color: '#525252'
                                            }}>
                                              📄
                                            </div>
                                          </a>
                                          <figcaption className="cds-figcaption">
                                            <strong>{json.record_v1.title}</strong>
                                            <br/><small style={{color: '#525252'}}>📄 {pdf.filename}</small>
                                          </figcaption>
                                        </figure>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Show message if no visual results */}
                            {!json.items_recent && !json.records_v1 && !json.record_v1 && (
                              <p className="cds-subtle">
                                Query returned data. Check Raw JSON below for details.
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {showResults && (
                        <div className="cds-card">
                          <h3 className="cds-heading">Raw JSON</h3>
                          <pre className="cds-json">{json ? JSON.stringify(json, null, 2) : "{}"}</pre>
                        </div>
                      )}
                      </div>
                      </div>
                    </Column>
                  </Grid>
                </div>
              </section>
            </Theme>
            </div>
              </>
              )}

              {activeApiTab === 2 && (
              <>
                <Heading type="heading-03" className="tab-lead">
                  Example REST endpoints for reference. DDR's production API follows similar patterns with authentication and structured responses. Load GraphQL presets directly into the sandbox editor.
                </Heading>
                <AnchorLinks links={PRESETS_ANCHORS} />
                <h2>Presets</h2>
                <p>
                  Example REST endpoints for reference. DDR's production API will follow similar patterns
                  with authentication and structured responses.
                </p>
                <ComboBox
                  id="preset-picker"
                  titleText="Choose a preset"
                  helperText={selectedPreset.description}
                  items={REST_PRESETS}
                  itemToString={(item) => (item ? item.name : "")}
                  selectedItem={selectedPreset}
                  onChange={({ selectedItem }) => selectedItem && setSelectedPreset(selectedItem)}
                />
                <p className="eyebrow">Request</p>
                <CodeSnippet type="multi" wrapText>
                  {selectedPreset.request}
                </CodeSnippet>
                <p className="eyebrow">Sample response</p>
                <CodeSnippet type="multi" wrapText>
                  {selectedPreset.response}
                </CodeSnippet>

                <div style={{ marginTop: "var(--cds-spacing-07)" }}>
                  <div className="cds-card">
                    <h3 className="cds-heading">DDR query presets</h3>
                    <p className="cds-subtle">Load directly into the GraphQL editor.</p>
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--cds-spacing-03)",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.recentItems)}>
                        Recent Items
                      </Button>
                      <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.allRecords)}>
                        All Records
                      </Button>
                      <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.recordsWithPDFs)}>
                        Records with PDFs
                      </Button>
                      <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.singleRecord)}>
                        Single Record
                      </Button>
                      <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.refFonds)}>
                        Reference: Fonds
                      </Button>
                      <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.refPeriods)}>
                        Reference: Periods
                      </Button>
                    </div>
                  </div>
                </div>

                <h2 style={{ marginTop: "var(--cds-spacing-09)" }}>Snippets</h2>
                <p>Use these quick copies when you need a cURL test, a fetch helper, or DDR GraphQL.</p>
                <Tabs
                  selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
                  onChange={({ selectedIndex: index }) => {
                    const nextSnippet = SNIPPETS[index];
                    if (nextSnippet) {
                      setActiveSnippet(nextSnippet.id);
                    }
                  }}
                >
                  <TabList aria-label="Snippets">
                    {SNIPPETS.map((snippet) => (
                      <Tab key={snippet.id}>{snippet.label}</Tab>
                    ))}
                  </TabList>
                  <TabPanels>
                    {SNIPPETS.map((snippet) => (
                      <TabPanel key={`${snippet.id}-panel`}>
                        <CodeSnippet type="multi" wrapText>
                          {snippet.code}
                        </CodeSnippet>
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>

                <div style={{ marginTop: "var(--cds-spacing-07)" }}>
                  <div className="cds-card">
                    <Tag type="cool-gray">Source: DDR GraphQL Examples</Tag>
                    <div className="carbon-markdown" style={{ marginTop: "1rem" }}>
                      <ReactMarkdown components={mdComponents}>{snippetsMd}</ReactMarkdown>
                    </div>
                  </div>
                </div>
                </>
              )}
              </Column>
            </Grid>
          </section>
        </div>
      </Theme>
    </div>
  );
};

export default ApiSandbox;
