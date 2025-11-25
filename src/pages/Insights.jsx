import { useCallback, useState } from "react";
import { Column, Grid } from "@carbon/react";
import PageHero from "../components/PageHero/PageHero";
import MarkdownContent from "../components/MarkdownContent/MarkdownContent";
import useMarkdown from "../hooks/useMarkdown";

const INSIGHTS_TABS = [
  { id: "systems", label: "Systems" },
  { id: "next-up", label: "Next up" },
];

const Insights = () => {
  const [activeTab, setActiveTab] = useState(0);

  const systemsMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/insights/systems.md`);
  const nextUpMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/insights/next-up.md`);

  const handleTabSelect = useCallback((_, index) => {
    setActiveTab(index);
  }, []);

  return (
    <div className="page insights-page">
      <PageHero
        id="insights"
        eyebrow="Insights"
        title="Systems snapshot"
        lead="Placeholder analytics wiring so you can attach Carbon charts and cards just like the internal dashboard."
        tabs={INSIGHTS_TABS}
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
      />

      <div className="page-content">
        <section className="page-section" aria-label="Insights content">
          <Grid condensed>
            <Column lg={8} md={8} sm={4}>
              {activeTab === 0 && (
                <MarkdownContent 
                  html={systemsMd.html} 
                  loading={systemsMd.loading} 
                  error={systemsMd.error} 
                />
              )}
              {activeTab === 1 && (
                <MarkdownContent 
                  html={nextUpMd.html} 
                  loading={nextUpMd.loading} 
                  error={nextUpMd.error} 
                />
              )}
            </Column>
          </Grid>
        </section>
      </div>
    </div>
  );
};

export default Insights;
