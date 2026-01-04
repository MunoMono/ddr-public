import { useCallback, useState } from "react";
import { Column, Grid, Heading, Theme } from "@carbon/react";
import PageHero from "../components/PageHero/PageHero";
import MarkdownContent from "../components/MarkdownContent/MarkdownContent";
import AnchorLinks from "../components/AnchorLinks/AnchorLinks";
import useMarkdown from "../hooks/useMarkdown";

const HOME_TABS = [
  { id: "overview", label: "Overview" },
  { id: "public-workstreams", label: "Public workstreams" },
  { id: "roadmap", label: "Roadmap" },
];

const OVERVIEW_ANCHORS = [
  { id: "overview", label: "Overview" },
  { id: "linked-data-best-practice", label: "Linked data best practice" },
];

const WORKSTREAMS_ANCHORS = [
  { id: "current-projects", label: "Current projects" },
  { id: "research-themes", label: "Research themes" },
  { id: "collaborations", label: "Collaborations" },
  { id: "outputs", label: "Outputs" },
];

const ROADMAP_ANCHORS = [
  { id: "upcoming-features", label: "Upcoming features" },
  { id: "timeline", label: "Timeline" },
  { id: "priorities", label: "Priorities" },
  { id: "feedback", label: "Feedback" },
];

const Home = () => {
  const heroImage = `${import.meta.env.BASE_URL}assets/hero_shot_v2.jpg`;
  const [activeTab, setActiveTab] = useState(0);

  const overviewMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/home/overview.md`);
  const linkedDataMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/home/linked-data-best-practice.md`);
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
        eyebrow="Royal College of Art Department of Design Research"
        title="DDR public preview"
        // lead="A streamlined public interface to explore the DDR digital archive"
        style={heroStyle}
        tabs={HOME_TABS}
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
      />

      <Theme theme="g10">
        <div className="page-content">
          <section className="page-section" id="main-content">
            <Grid condensed>
              <Column lg={14} md={8} sm={4}>
                {activeTab === 0 && (
                  <>
                    <Heading type="heading-03" className="tab-lead">
                      A streamlined public interface to explore the DDR digital archive
                    </Heading>
                    <AnchorLinks links={OVERVIEW_ANCHORS} />
                    <MarkdownContent 
                      html={overviewMd.html} 
                      loading={overviewMd.loading} 
                      error={overviewMd.error} 
                    />
                    <div id="linked-data-best-practice">
                      <MarkdownContent 
                        html={linkedDataMd.html} 
                        loading={linkedDataMd.loading} 
                        error={linkedDataMd.error} 
                      />
                    </div>
                  </>
                )}
                {activeTab === 1 && (
                  <>
                    <Heading type="heading-03" className="tab-lead">
                      Current workstreams show where DDR focuses effort. Each project follows a similar workflow structure so external collaborators can build context quickly
                    </Heading>
                    <AnchorLinks links={WORKSTREAMS_ANCHORS} />
                    <MarkdownContent 
                      html={workstreamsMd.html} 
                      loading={workstreamsMd.loading} 
                      error={workstreamsMd.error} 
                    />
                  </>
                )}
                {activeTab === 2 && (
                  <>
                    <Heading type="heading-03" className="tab-lead">
                      The roadmap tracks upcoming features and improvements. Timelines remain flexible to accommodate changing research priorities
                    </Heading>
                    <AnchorLinks links={ROADMAP_ANCHORS} />
                    <MarkdownContent 
                      html={roadmapMd.html} 
                      loading={roadmapMd.loading} 
                      error={roadmapMd.error} 
                    />
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

export default Home;
