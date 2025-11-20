import MarkdownPage from "../components/MarkdownPage/MarkdownPage";

const TERMS_MD = `${import.meta.env.BASE_URL}docs/pages/terms.md`;

const Terms = () => {
  return (
    <MarkdownPage markdownSrc={TERMS_MD} pageClassName="footer-page" showTopLink />
  );
};

export default Terms;
