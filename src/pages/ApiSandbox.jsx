import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import {
  Button,
  ButtonSet,
  ClickableTile,
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
import { Save, ArrowRight, DataBase, Catalog, Image, Document } from "@carbon/icons-react";

import PageHero from "../components/PageHero/PageHero";
import AnchorLinks from "../components/AnchorLinks/AnchorLinks";

const REST_PRESETS = [
  {
    id: "recentItems",
    name: "Recent DDR items",
    description: "Fetch the most recently updated items from the DDR archive.",
    request:
      "POST https://api.ddrarchive.org/graphql",
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
      "POST https://api.ddrarchive.org/graphql",
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
      "POST https://api.ddrarchive.org/graphql",
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
      "POST https://api.ddrarchive.org/graphql",
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

const SNIPPETS_URL = `${import.meta.env.BASE_URL}docs/snippets.md`;
const PRESETS_BASE_URL = `${import.meta.env.BASE_URL}data/presets`;

const endpoint = import.meta.env.DEV
  ? "http://localhost:8000/graphql"
  : "https://api.ddrarchive.org/graphql";

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
    rights_holders
    jpg_derivatives {
      signed_url
      filename
      label
    }
    pdf_files {
      signed_url
      filename
    }
  }
}`;



const API_NAV_TABS = [
  { id: "api-getting-started", label: "Getting started" },
  { id: "api-graphql-sandbox", label: "GraphQL sandbox" },
  { id: "api-presets", label: "Presets and snippets" },
  { id: "api-glossary", label: "Glossary" },
];

const GETTING_STARTED_ANCHORS = [
  { id: "authentication", label: "Authentication" },
  { id: "request-format", label: "Request format" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "query-parameters", label: "Query parameters" },
];

const PRESETS_ANCHORS = [
  { id: "graphql-query-presets", label: "GraphQL query presets" },
  { id: "code-snippets", label: "Code snippets" },
];

const GLOSSARY_ANCHORS = [
  { id: "glam", label: "GLAM" },
  { id: "ddr", label: "DDR" },
  { id: "computer-science", label: "Computer science" },
  { id: "api-concepts", label: "API concepts" },
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
  const [activeSnippet, setActiveSnippet] = useState('curl');
  const [isDark, setIsDark] = useState(getThemePreference);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [loading, setLoading] = useState(false);
  const [json, setJson] = useState(null);
  const [error, setError] = useState(null);
  const [activePresetId, setActivePresetId] = useState(null);
  const [snippetsMd, setSnippetsMd] = useState("Loading...");

  // Helper to generate response title
  const getResponseTitle = (data) => {
    if (!data) return null;
    
    // Check for items_recent
    if (data.items_recent && Array.isArray(data.items_recent)) {
      return `Items recent (${data.items_recent.length} items)`;
    }
    
    // Check for records_v1
    if (data.records_v1 && Array.isArray(data.records_v1)) {
      return `Records (${data.records_v1.length} items)`;
    }
    
    // Check for record_v1 with images
    if (data.record_v1?.jpg_derivatives) {
      const thumbs = data.record_v1.jpg_derivatives.filter(j => j.role === 'jpg_thumb');
      if (thumbs.length > 0) {
        return `Images (${thumbs.length} items)`;
      }
    }
    
    // Check for record_v1 with media
    if (data.record_v1?.media && Array.isArray(data.record_v1.media)) {
      return `Media (${data.record_v1.media.length} items)`;
    }
    
    // Check for record_v1
    if (data.record_v1) {
      return 'Record details';
    }
    
    // Fallback to field count
    const fieldCount = Object.keys(data).length;
    return `${fieldCount} field${fieldCount !== 1 ? 's' : ''}`;
  };
  const [glossaryMd, setGlossaryMd] = useState("Loading...");
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
  
  // Load presets and snippets from JSON files
  const [recordsPresets, setRecordsPresets] = useState([]);
  const [authoritiesPresets, setAuthoritiesPresets] = useState([]);
  const [codeSnippets, setCodeSnippets] = useState([]);

  const currentSnippet = useMemo(
    () => codeSnippets.find((snippet) => snippet.id === activeSnippet) || codeSnippets[0],
    [activeSnippet, codeSnippets]
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

  // Load presets and snippets from JSON files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [recordsRes, authoritiesRes, snippetsRes] = await Promise.all([
          fetch(`${PRESETS_BASE_URL}/records.json`),
          fetch(`${PRESETS_BASE_URL}/authorities.json`),
          fetch(`${PRESETS_BASE_URL}/snippets.json`),
        ]);
        
        if (recordsRes.ok) {
          const recordsData = await recordsRes.json();
          setRecordsPresets(recordsData.presets || []);
        }
        
        if (authoritiesRes.ok) {
          const authoritiesData = await authoritiesRes.json();
          setAuthoritiesPresets(authoritiesData.presets || []);
        }
        
        if (snippetsRes.ok) {
          const snippetsData = await snippetsRes.json();
          setCodeSnippets(snippetsData.snippets || []);
          if (snippetsData.snippets?.length > 0) {
            setActiveSnippet(snippetsData.snippets[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load presets/snippets:', err);
      }
    };
    loadData();
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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}docs/api/glossary.md`);
        const text = res.ok
          ? await res.text()
          : "Could not load glossary.";
        if (active) setGlossaryMd(text);
      } catch {
        if (active) setGlossaryMd("Could not load glossary.");
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

  const selectedIndex = codeSnippets.findIndex((snippet) => snippet.id === activeSnippet);

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
                  The GraphQL sandbox below connects to <code>api.ddrarchive.org/graphql</code> for live
                  queries during development and demos.
                </p>
                <ol className="api-page__list">
                  <li>
                    <strong>Endpoint:</strong> All queries go to
                    <code> https://api.ddrarchive.org/graphql</code> via POST request.
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
                  {`curl -X POST https://api.ddrarchive.org/graphql \\
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
                        <div className="toolbar-header">
                          <Heading className="toolbar-heading">Query editor</Heading>
                          <Tag type="cool-gray" size="sm">
                            {endpoint.replace('https://', '').replace('http://', '')}
                          </Tag>
                        </div>
                        <div className="toolbar-primary">
                          <ButtonSet>
                            <Button 
                              onClick={() => runQuery()} 
                              kind="primary" 
                              disabled={loading}
                              size="md"
                            >
                              {loading ? <InlineLoading description="Running..." /> : "Run query"}
                            </Button>
                            <Button 
                              onClick={clearAll} 
                              kind="secondary" 
                              disabled={loading}
                              size="md"
                            >
                              Clear
                            </Button>
                          </ButtonSet>
                        </div>
                        <div className="toolbar-secondary">
                          <ComboBox
                            id="records-preset-picker"
                            titleText="Load preset"
                            placeholder="Select records query..."
                            size="md"
                            items={recordsPresets}
                            itemToString={(item) => (item ? item.label : '')}
                            onChange={({ selectedItem }) => {
                              if (selectedItem) {
                                setActivePresetId(selectedItem.id);
                                loadPreset(selectedItem.query);
                              }
                            }}
                          />
                          <ComboBox
                            id="authorities-preset-picker"
                            titleText=""
                            placeholder="Select authorities query..."
                            size="md"
                            items={authoritiesPresets}
                            itemToString={(item) => (item ? item.label : '')}
                            onChange={({ selectedItem }) => {
                              if (selectedItem) {
                                setActivePresetId(selectedItem.id);
                                loadPreset(selectedItem.query);
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="editor-card">
                        <div className="editor-header">
                          <span className="editor-label">GraphQL query</span>
                          {query && (
                            <Tag type="outline" size="sm">
                              {query.split('\n').filter(line => line.trim()).length} lines
                            </Tag>
                          )}
                        </div>
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
                              cursorBlinking: 'smooth',
                              cursorSmoothCaretAnimation: 'on',
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
                      <div className="results-panel-wrapper">
                        <div className="results-panel-header">
                          <div className="results-header-content">
                            <Heading className="results-heading">Response</Heading>
                            {json && (
                              <Tag type="green" size="sm">
                                {getResponseTitle(json)}
                              </Tag>
                            )}
                            {error && (
                              <Tag type="red" size="sm">Error</Tag>
                            )}
                            {loading && (
                              <Tag type="blue" size="sm">Loading...</Tag>
                            )}
                          </div>
                        </div>
                      <div className="results-wrapper">
                      <div className="cds-card results-panel">
                        {error && (
                          <InlineNotification
                            kind="error"
                            title="Query error"
                            subtitle={error}
                            lowContrast
                            hideCloseButton
                          />
                        )}
                        {!error && !json && !loading && (
                          <div className="results-empty-state">
                            <p className="cds-subtle">Run a GraphQL query to see results here.</p>
                          </div>
                        )}

                        {/* Handle DDR items_recent, records_v1, etc */}
                        {!error && json && (
                          <>
                            {(json.items_recent || json.records_v1) && (
                              <div className="cds-grid" style={{ marginTop: "var(--cds-spacing-03)" }}>
                                {(() => {
                                  // Get the items array
                                  let items = json.items_recent || json.records_v1;
                                  
                                  // Filter for "Records with PDFs" preset - only show items that have PDFs
                                  if (activePresetId === 'recordsWithPDFs') {
                                    items = items.filter(item => item.pdf_files && item.pdf_files.length > 0);
                                  }
                                  
                                  return items.map((item) => {
                                  // Extract JPG thumbnail - prefer thumb, then display, then any jpg
                                  const jpgThumb = item.jpg_derivatives?.find(d => d.role === 'jpg_thumb' || d.filename?.includes('thumb'));
                                  const jpgDisplay = item.jpg_derivatives?.find(d => d.role === 'jpg_display' || d.filename?.includes('display'));
                                  const jpg = jpgThumb || jpgDisplay || item.jpg_derivatives?.[0];
                                  
                                  // Extract first PDF from pdf_files array
                                  const pdf = item.pdf_files?.[0];
                                  
                                  // Use signed_url for links
                                  const pdfUrl = pdf?.signed_url;
                                  const imgUrl = jpg?.signed_url;
                                  
                                  const titleText = item.title || item.pid || item.id;
                                  const content = item.scope_and_content;

                                  return (
                                    <figure key={item.id || item.pid} className="cds-figure cds-card-tile">
                                      {imgUrl ? (
                                        <a
                                          href={pdfUrl || imgUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={pdf ? `View PDF: ${titleText}` : `View image: ${titleText}`}
                                          className="card-tile-link"
                                        >
                                          <img
                                            src={imgUrl}
                                            alt={titleText}
                                            className="cds-thumb"
                                            loading="lazy"
                                            onError={(e) => {
                                              console.error('Image failed to load:', imgUrl);
                                              e.target.style.display = 'none';
                                              const placeholder = document.createElement('div');
                                              placeholder.className = 'cds-thumb cds-thumb--placeholder';
                                              placeholder.textContent = 'Image unavailable';
                                              e.target.parentElement.appendChild(placeholder);
                                            }}
                                          />
                                        </a>
                                      ) : pdfUrl ? (
                                        <a
                                          href={pdfUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={`View PDF: ${titleText}`}
                                          className="card-tile-link"
                                        >
                                          <div className="cds-thumb cds-thumb--placeholder cds-thumb--pdf">
                                            <span className="pdf-icon">📄</span>
                                          </div>
                                        </a>
                                      ) : (
                                        <div className="cds-thumb cds-thumb--placeholder">No preview</div>
                                      )}
                                      <figcaption className="cds-figcaption">
                                        <strong className="card-title">{titleText}</strong>
                                        {pdfUrl && (
                                          <div className="card-link-wrapper">
                                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="card-link">
                                              <Document size={16} style={{marginRight: '0.25rem'}} /> View artefact <ArrowRight size={16} style={{marginLeft: '0.25rem'}} />
                                            </a>
                                          </div>
                                        )}
                                        {imgUrl && !pdfUrl && (
                                          <div className="card-meta">
                                            <small>Image preview</small>
                                          </div>
                                        )}
                                      </figcaption>
                                    </figure>
                                  );
                                }); // Close the .map()
                                })()}
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
                                {json.record_v1.jpg_derivatives && json.record_v1.jpg_derivatives.length > 0 && (() => {
                                  // Group images by their asset ID (extract from filename)
                                  const thumbs = json.record_v1.jpg_derivatives.filter(j => j.role === 'jpg_thumb');
                                  const displays = json.record_v1.jpg_derivatives.filter(j => j.role === 'jpg_display');
                                  
                                  // Create pairs of thumb + display for each image
                                  const imagePairs = thumbs.map((thumb, idx) => ({
                                    thumb: thumb,
                                    display: displays[idx] || thumb // Fallback to thumb if no display
                                  }));
                                  
                                  return (
                                    <>
                                      <div className="cds-grid" style={{ marginTop: "var(--cds-spacing-05)" }}>
                                        {imagePairs.map((pair, idx) => (
                                          <figure key={idx} className="cds-figure cds-card-tile">
                                            <a href={pair.display.signed_url} target="_blank" rel="noopener noreferrer" title="View hi-res image">
                                              <img src={pair.thumb.signed_url} alt={`${json.record_v1.title} - Image ${idx + 1}`} className="cds-thumb" />
                                            </a>
                                            <figcaption className="cds-figcaption">
                                              <strong>{pair.thumb.label || pair.thumb.filename?.split('/').pop().split('.')[0].replace(/_/g, ' ') || `Image ${idx + 1}`}</strong>
                                              <br/><small style={{color: '#525252', display: 'inline-flex', alignItems: 'center', gap: '0.25rem'}}><Image size={16} /> Image {idx + 1} of {imagePairs.length}</small>
                                              <br/><a 
                                                href={pair.display.signed_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{
                                                  color: '#0f62fe',
                                                  textDecoration: 'none',
                                                  fontSize: '0.875rem',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '0.25rem',
                                                  marginTop: '0.25rem'
                                                }}
                                                title="Open hi-res image in new tab"
                                              >
                                                <Document size={16} /> View artefact <ArrowRight size={16} />
                                              </a>
                                            </figcaption>
                                          </figure>
                                        ))}
                                      </div>
                                    </>
                                  );
                                })()}
                                
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
                                            <br/><a 
                                              href={pdf.signed_url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              style={{
                                                color: '#0f62fe',
                                                textDecoration: 'none',
                                                fontSize: '0.875rem',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                marginTop: '0.25rem'
                                              }}
                                            >
                                              <Document size={16} /> View artefact <ArrowRight size={16} />
                                            </a>
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
                  Load GraphQL query presets into the sandbox editor or copy code snippets for your own implementation.
                </Heading>
                <AnchorLinks links={PRESETS_ANCHORS} />
                
                {/* GraphQL Presets Section */}
                <section id="graphql-query-presets" className="presets-section">
                  <Heading as="h2" className="presets-section__header">
                    GraphQL query presets
                  </Heading>
                  <p className="presets-section__description">
                    Click any preset to load it directly into the GraphQL sandbox editor.
                  </p>

                  <div className="presets-category">
                    <div className="presets-category__header">
                      <Catalog size={20} />
                      <Heading as="h3" type="heading-compact-01">
                        Archive records
                      </Heading>
                    </div>
                    <div className="presets-category__grid">
                      {recordsPresets.filter(p => !p.disabled).map((preset) => (
                        <ClickableTile 
                          key={preset.id} 
                          className="preset-tile"
                          onClick={() => loadPreset(preset.query)}
                        >
                          <div className="preset-tile__header">
                            <strong className="preset-tile__title">{preset.label}</strong>
                            <ArrowRight size={16} className="preset-tile__arrow" />
                          </div>
                          <p className="preset-tile__description">
                            {preset.description}
                          </p>
                        </ClickableTile>
                      ))}
                    </div>
                  </div>

                  <div className="presets-category">
                    <div className="presets-category__header">
                      <DataBase size={20} />
                      <Heading as="h3" type="heading-compact-01">
                        Database authorities
                      </Heading>
                    </div>
                    <div className="presets-category__grid">
                      {authoritiesPresets.filter(p => !p.disabled).map((preset) => (
                        <ClickableTile 
                          key={preset.id} 
                          className="preset-tile"
                          onClick={() => loadPreset(preset.query)}
                        >
                          <div className="preset-tile__header">
                            <strong className="preset-tile__title">{preset.label}</strong>
                            <ArrowRight size={16} className="preset-tile__arrow" />
                          </div>
                          <p className="preset-tile__description">
                            {preset.description}
                          </p>
                        </ClickableTile>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Code Snippets Section */}
                <section id="code-snippets" className="snippets-section">
                  <Heading as="h2" className="snippets-section__header">
                    Code snippets
                  </Heading>
                  <p className="snippets-section__description">
                    Copy these code examples to integrate the DDR GraphQL API into your application.
                  </p>
                  
                  <Tabs
                    selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
                    onChange={({ selectedIndex: index }) => {
                      const nextSnippet = codeSnippets[index];
                      if (nextSnippet) {
                        setActiveSnippet(nextSnippet.id);
                      }
                    }}
                  >
                    <TabList aria-label="Code snippet examples" contained>
                      {codeSnippets.map((snippet) => (
                        <Tab key={snippet.id}>{snippet.label}</Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {codeSnippets.map((snippet) => (
                        <TabPanel key={`${snippet.id}-panel`}>
                          {snippet.description && (
                            <p className="snippet-tab-description">
                              {snippet.description}
                            </p>
                          )}
                          <CodeSnippet type="multi" wrapText feedback="Copied to clipboard">
                            {snippet.code}
                          </CodeSnippet>
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                </section>
                </>
              )}

              {activeApiTab === 3 && (
              <>
                <Heading type="heading-03" className="tab-lead">
                  Key terms and definitions for understanding the DDR Archive API, GLAM practices, and related technical concepts.
                </Heading>
                <AnchorLinks links={GLOSSARY_ANCHORS} />
                
                <div style={{ marginTop: "var(--cds-spacing-07)" }}>
                  <div className="carbon-markdown">
                    <ReactMarkdown components={mdComponents}>{glossaryMd}</ReactMarkdown>
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
