import MarkdownPage from "../components/MarkdownPage/MarkdownPage";

const INSIGHTS_MD = `${import.meta.env.BASE_URL}docs/pages/insights.md`;

const Insights = () => {
  return (
    <MarkdownPage
      markdownSrc={INSIGHTS_MD}
      pageClassName="insights-page"
      defaultHero={{ id: "insights" }}
    />
  );
};

export default Insights;
