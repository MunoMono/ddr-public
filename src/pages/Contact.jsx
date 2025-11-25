import MarkdownPage from "../components/MarkdownPage/MarkdownPage";

const CONTACT_MD = `${import.meta.env.BASE_URL}docs/pages/contact.md`;

const Contact = () => {
  return (
    <MarkdownPage markdownSrc={CONTACT_MD} pageClassName="footer-page" showTopLink showHeroTabs={false} />
  );
};

export default Contact;
