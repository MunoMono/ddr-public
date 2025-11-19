import FooterPage from "./FooterPage";

const PRIVACY_MD = `${import.meta.env.BASE_URL}docs/footer/privacy.md`;

const Privacy = () => {
  return (
    <FooterPage
      title="Privacy"
      description="How we look after personal data inside the DDR ingestion platform."
      markdownSrc={PRIVACY_MD}
    />
  );
};

export default Privacy;
