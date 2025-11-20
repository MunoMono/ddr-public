import MarkdownPage from "../components/MarkdownPage/MarkdownPage";

const HOME_MD = `${import.meta.env.BASE_URL}docs/pages/home.md`;

const Home = () => {
  const heroImage = `${import.meta.env.BASE_URL}assets/hero_shot.jpg`;

  return (
    <MarkdownPage
      markdownSrc={HOME_MD}
      pageClassName="home-page"
      defaultHero={{ id: "home" }}
      showAnchors={false}
      heroStyle={{
        backgroundImage: `linear-gradient(135deg, rgba(11, 75, 124, 0.55), rgba(5, 7, 14, 0.85)), url('${heroImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
};

export default Home;
