import FooterPage from "./FooterPage";

const TERMS_MD = `${import.meta.env.BASE_URL}docs/footer/terms.md`;

const Terms = () => {
  return (
    <FooterPage
      title="Terms of use"
      description="Conditions for using the DDR ingestion platform and its data."
      markdownSrc={TERMS_MD}
    />
  );
};

export default Terms;
