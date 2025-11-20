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
} from "@carbon/react";
import { Save } from "@carbon/icons-react";

import PageHero from "../components/PageHero/PageHero";

const REST_PRESETS = [
  {
    id: "objects",
    name: "Get a random object",
    description: "Pull a random item from the Cooper Hewitt collection.",
    request:
      "https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.objects.getRandom&access_token=REPLACE_ME",
    response: `{
  "stat": "ok",
  "object": {
    "title": "Square textile, 1910–20",
    "woe:country_id": "23424977"
  }
}`,
  },
  {
    id: "departments",
    name: "List departments",
    description: "Return the Cooper Hewitt departmental directory.",
    request:
      "https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.departments.getList&access_token=REPLACE_ME",
    response: `{
  "stat": "ok",
  "departments": [
    { "name": "Drawings, Prints, and Graphic Design" },
    { "name": "Textiles" }
  ]
}`,
  },
  {
    id: "people",
    name: "Look up a person",
    description: "Fetch a single designer profile by person_id.",
    request:
      "https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.people.getInfo&person_id=18046367&access_token=REPLACE_ME",
    response: `{
  "stat": "ok",
  "person": {
    "display_name": "Florence Knoll",
    "nationality": "United States"
  }
}`,
  },
];

const SNIPPETS = [
  {
    id: "curl",
    label: "cURL",
    code: `curl -X GET "https://api.collection.cooperhewitt.org/rest/\\
?method=cooperhewitt.objects.getRandom&access_token=$COOPER_TOKEN"`,
  },
  {
    id: "js",
    label: "JavaScript fetch",
    code: `const response = await fetch("https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.departments.getList&access_token=${"{token}"}");
const body = await response.json();`,
  },
  {
    id: "graphql",
    label: "GraphQL (DDR)",
    code: `fetch("https://api.ddr-public.org/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.VITE_DDR_API_KEY
  },
  body: JSON.stringify({ query, variables })
});`,
  },
];

const SNIPPETS_URL = `${import.meta.env.BASE_URL}docs/snippets.md`;

const endpoint = import.meta.env.DEV
  ? "/ch-graphql/"
  : "https://proud-hat-1ce4.gnhkfc.workers.dev/ch-graphql/";

const displayEndpoint = "https://api.cooperhewitt.org/";

const DEFAULT_QUERY = `{
  object(hasImages:true, size:12, page:1) {
    id
    title
    summary
    date
    multimedia
  }
}`;

const DESIGNER_PRESETS = {
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

const API_NAV_TABS = [
  { id: "api-getting-started", label: "Getting started" },
  { id: "api-graphql-sandbox", label: "GraphQL sandbox" },
  { id: "api-presets", label: "Presets & snippets" },
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
        lead="Carbon-native tabs keep the narrative intact while the Cooper Hewitt GraphQL sandbox runs live queries for demos and workshops."
        tabs={API_NAV_TABS}
        tabAriaLabel="API sections"
        activeTab={activeApiTab}
        onTabSelect={handleHeroTabSelect}
      />

      <div className="page-content">
        <section className="page-section" id="api-content">
          <Tabs selectedIndex={activeApiTab} onChange={({ selectedIndex }) => setActiveApiTab(selectedIndex)}>
            <TabList aria-label="API content">
              {API_NAV_TABS.map((tab) => (
                <Tab key={tab.id}>{tab.label}</Tab>
              ))}
            </TabList>

            <TabPanels>
              <TabPanel>
            <Grid condensed className="api-page__panel">
              <Column lg={8} md={8} sm={4}>
                <h2>Three simple steps</h2>
                <p>
                  Cooper Hewitt’s API is REST-based. Sign up for a personal access token at{" "}
                  <Button
                    kind="ghost"
                    size="sm"
                    href="https://collection.cooperhewitt.org/api"
                    target="_blank"
                    rel="noreferrer"
                  >
                    collection.cooperhewitt.org/api
                  </Button>{" "}
                  and keep the token private.
                </p>
                <ol className="api-page__list">
                  <li>
                    <strong>Access token:</strong> Apply once, receive an email with your
                    <code> access_token</code>.
                  </li>
                  <li>
                    <strong>Request format:</strong> Use the REST endpoint
                    <code> https://api.collection.cooperhewitt.org/rest/</code> with a
                    <code> method</code> parameter like
                    <code> cooperhewitt.objects.getRandom</code> plus your token.
                  </li>
                  <li>
                    <strong>Rate limits:</strong> 5,000 calls per day, per token. Follow the
                    terms of service and attribute the museum if you publish anything.
                  </li>
                </ol>
                <p>
                  Everything runs over HTTPS, returns JSON, and mirrors the documentation at{" "}
                  <a href="https://apidocs.cooperhewitt.org/the-api/" target="_blank" rel="noreferrer">
                    apidocs.cooperhewitt.org
                  </a>
                  . DDR’s own REST hooks follow the same approach so the learning transfers.
                </p>
              </Column>
              <Column lg={8} md={8} sm={4}>
                <Tile>
                  <p className="eyebrow">Example request</p>
                  <CodeSnippet type="multi" wrapText>
                    {
                      "https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.objects.getRandom&access_token=YOUR_TOKEN"
                    }
                  </CodeSnippet>
                </Tile>
                <Tile>
                  <p className="eyebrow">Example JSON</p>
                  <CodeSnippet type="multi" wrapText>
                    {`{
  "stat": "ok",
  "object": {
    "title": "Square textile, 1910–20",
    "description": "Silk; block-printed"
  }
}`}
                  </CodeSnippet>
                </Tile>
              </Column>
            </Grid>
              </TabPanel>

              <TabPanel>
            <Theme theme={isDark ? "g90" : "g10"}>
              <section ref={sandboxRef} className="docs-panel-band">
                <div className="docs-panel-band__inner">
                  <Loading active={loading} withOverlay description="Querying Cooper Hewitt..." />
                  <Grid condensed fullWidth className="cds-stack" style={{ marginTop: "1rem" }}>
                    <Column lg={8} md={8} sm={4}>
                      <div className="cds-card">
                        <div className="cds-actions">
                          <ButtonSet>
                            <Button onClick={() => runQuery()} kind="primary" disabled={loading}>
                              {loading ? <InlineLoading description="Running..." /> : "Execute query"}
                            </Button>
                            <Button onClick={clearAll} kind="secondary" disabled={loading}>
                              Clear
                            </Button>
                          </ButtonSet>
                          <Tag type="cool-gray">POST {displayEndpoint}</Tag>
                        </div>
                      </div>

                      <div className="cds-card">
                        <div className="cds-editor">
                          <Editor
                            height="100%"
                            defaultLanguage="graphql"
                            value={query}
                            theme={monacoTheme}
                            onChange={(value) => !loading && setQuery(value ?? "")}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              tabSize: 2,
                              automaticLayout: true,
                              readOnly: loading,
                            }}
                          />
                        </div>
                      </div>

                      <div className="cds-card" style={{ padding: "var(--cds-spacing-03)" }}>
                        <Button kind="tertiary" size="sm" renderIcon={Save} onClick={saveSnippet}>
                          Save snippet (.txt)
                        </Button>
                      </div>
                    </Column>

                    <Column lg={8} md={8} sm={4}>
                      <div className="cds-card">
                        <h3 className="cds-heading">Results</h3>
                        {error && (
                          <p style={{ color: "var(--cds-support-error)" }}>{error}</p>
                        )}
                        {!error && !json && !loading && (
                          <p className="cds-subtle">Run a query to see results.</p>
                        )}
                        {!error && json?.object?.length === 0 && (
                          <p className="cds-subtle">No results.</p>
                        )}

                        {json?.object && (
                          <div className="cds-grid" style={{ marginTop: "var(--cds-spacing-03)" }}>
                            {json.object.map((o) => {
                              const src = extractImage(o);
                              const titleText =
                                o?.summary?.title ??
                                (Array.isArray(o?.title) ? o.title[0]?.value : o?.title) ??
                                o?.id;
                              const yearText =
                                Array.isArray(o?.date) && o.date[0]?.value
                                  ? `, ${o.date[0].value}`
                                  : o?.date
                                  ? `, ${o?.date}`
                                  : "";

                              return (
                                <figure key={o.id} className="cds-figure cds-card-tile">
                                  {src ? (
                                    <a
                                      href={
                                        Array.isArray(o.multimedia) && o.multimedia[0]?.large?.url
                                          ? o.multimedia[0].large.url
                                          : src
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <img
                                        src={src.startsWith("http") ? src : `https:${src}`}
                                        alt={titleText}
                                        className="cds-thumb"
                                      />
                                    </a>
                                  ) : (
                                    <div className="cds-thumb cds-thumb--placeholder">no image</div>
                                  )}
                                  <figcaption className="cds-figcaption">
                                    {titleText}
                                    {yearText}
                                  </figcaption>
                                </figure>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="cds-card">
                        <h3 className="cds-heading">Raw JSON</h3>
                        <pre className="cds-json">{json ? JSON.stringify(json, null, 2) : "{}"}</pre>
                      </div>
                    </Column>
                  </Grid>
                </div>
              </section>
            </Theme>

            <section className="docs-panel-band" style={{ marginTop: "2rem" }}>
              <div className="docs-panel-band__inner">
                <Grid fullWidth className="cds-stack">
                  <Column lg={10} md={8} sm={4}>
                    <div className="cds-card">
                      <Tag type="cool-gray">Source: Cooper Hewitt GraphQL</Tag>
                      <div className="carbon-markdown" style={{ marginTop: "1rem" }}>
                        <ReactMarkdown components={mdComponents}>{snippetsMd}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="cds-card">
                      <h3 className="cds-heading">Designer presets</h3>
                      <p className="cds-subtle">Load directly into the editor.</p>
                      <div
                        style={{
                          display: "flex",
                          gap: "var(--cds-spacing-03)",
                          flexWrap: "wrap",
                        }}
                      >
                        <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.tanaka)}>
                          Ikko Tanaka
                        </Button>
                        <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.yokoo)}>
                          Tadanori Yokoo
                        </Button>
                        <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.fukuda)}>
                          Shigeo Fukuda
                        </Button>
                        <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.kamekura)}>
                          Yusaku Kamekura
                        </Button>
                        <Button kind="tertiary" onClick={() => loadPreset(DESIGNER_PRESETS.nagai)}>
                          Kazumasa Nagai
                        </Button>
                      </div>
                    </div>
                  </Column>
                </Grid>
              </div>
            </section>
              </TabPanel>

              <TabPanel>
            <Grid condensed className="api-page__panel">
              <Column lg={8} md={8} sm={4}>
                <h2>Presets</h2>
                <p>
                  Borrowing directly from the Cooper Hewitt console, pick a preset and swap the
                  token for your value. DDR REST routes follow the same structure.
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
              </Column>

              <Column lg={8} md={8} sm={4}>
                <h2>Snippets</h2>
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
                <InlineNotification
                  className="api-page__hint"
                  lowContrast
                  kind="info"
                  title="Preset loaded"
                  subtitle={`${currentSnippet.label} preset ready to paste anywhere.`}
                />
              </Column>
            </Grid>
              </TabPanel>
            </TabPanels>
      </Tabs>
        </section>
      </div>
    </div>
  );
};

export default ApiSandbox;
