import MarkdownPage from "../components/MarkdownPage/MarkdownPage";

const TERMS_MD = `${import.meta.env.BASE_URL}docs/pages/terms.md`;

const Terms = () => {
  return (
    <MarkdownPage
      markdownSrc={TERMS_MD}
      pageClassName="footer-page"
      showTopLink
      showHeroTabs={false}
      heroMainCols={{ lg: 8, md: 8, sm: 4 }}
    />
  );
};

export default Terms;
