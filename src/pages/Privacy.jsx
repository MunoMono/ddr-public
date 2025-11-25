import MarkdownPage from "../components/MarkdownPage/MarkdownPage";

const PRIVACY_MD = `${import.meta.env.BASE_URL}docs/pages/privacy.md`;

const Privacy = () => {
  return (
    <MarkdownPage
      markdownSrc={PRIVACY_MD}
      pageClassName="footer-page"
      showTopLink
      heroMainCols={{ lg: 8, md: 8, sm: 4 }}
    />
  );
};

export default Privacy;
