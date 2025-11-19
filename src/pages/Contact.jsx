import FooterPage from "./FooterPage";

const CONTACT_MD = `${import.meta.env.BASE_URL}docs/footer/contact.md`;

const Contact = () => {
  return (
    <FooterPage
      title="Contact"
      description="Get in touch with the DDR ingestion team for support, incidents, or feedback."
      markdownSrc={CONTACT_MD}
    />
  );
};

export default Contact;
