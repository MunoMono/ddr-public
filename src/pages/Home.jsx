import { useCallback, useState } from "react";
import { Column, Grid } from "@carbon/react";
import PageHero from "../components/PageHero/PageHero";
import MarkdownContent from "../components/MarkdownContent/MarkdownContent";
import useMarkdown from "../hooks/useMarkdown";

const HOME_TABS = [
  { id: "overview", label: "Overview" },
  { id: "public-workstreams", label: "Public workstreams" },
  { id: "roadmap", label: "Roadmap" },
];

const Home = () => {
  const heroImage = `${import.meta.env.BASE_URL}assets/hero_shot.jpg`;
  const [activeTab, setActiveTab] = useState(0);

  const overviewMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/home/overview.md`);
  const workstreamsMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/home/public-workstreams.md`);
  const roadmapMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/home/roadmap.md`);

  const handleTabSelect = useCallback((_, index) => {
    setActiveTab(index);
  }, []);

  const heroStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(11, 75, 124, 0.55), rgba(5, 7, 14, 0.85)), url('${heroImage}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="page home-page">
      <PageHero
        id="home"
        eyebrow="Department of Design Research"
        title="DDR public preview"
        lead="A lightweight frontend that mirrors the internal research shell for public collaboration."
        style={heroStyle}
        tabs={HOME_TABS}
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
      />

      <div className="page-content">
        <section className="page-section" aria-label="Home content">
          <Grid condensed>
            <Column lg={8} md={8} sm={4}>
              {activeTab === 0 && (
                <MarkdownContent 
                  html={overviewMd.html} 
                  loading={overviewMd.loading} 
                  error={overviewMd.error} 
                />
              )}
              {activeTab === 1 && (
                <MarkdownContent 
                  html={workstreamsMd.html} 
                  loading={workstreamsMd.loading} 
                  error={workstreamsMd.error} 
                />
              )}
              {activeTab === 2 && (
                <MarkdownContent 
                  html={roadmapMd.html} 
                  loading={roadmapMd.loading} 
                  error={roadmapMd.error} 
                />
              )}
            </Column>
          </Grid>
        </section>
      </div>
    </div>
  );
};

export default Home;
