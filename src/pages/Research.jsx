import MarkdownPage from "../components/MarkdownPage/MarkdownPage";

const RESEARCH_MD = `${import.meta.env.BASE_URL}docs/pages/research.md`;

const Research = () => {
  return (
    <MarkdownPage
      markdownSrc={RESEARCH_MD}
      pageClassName="research-page"
      defaultHero={{ id: "research" }}
    />
  );
};

export default Research;
