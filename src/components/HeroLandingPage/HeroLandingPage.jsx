import PropTypes from "prop-types";
import { Button, Tag } from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";

import "../../styles/components/_hero-landing-page.scss";

const HeroLandingPage = ({ eyebrow, title, lead, actions = [], tags = [], backgroundImage, variant = "default" }) => {
  const classes = ["hero-landing-page"];
  if (variant === "minimal") classes.push("hero-landing-page--minimal");

  return (
    <section className={classes.join(" ")} aria-label={title || "Hero"}>
      <div className="hero-landing-page__media" aria-hidden="true">
        <div
          className="hero-landing-page__image"
          style={backgroundImage ? { backgroundImage: backgroundImage } : undefined}
        />
        <div className="hero-landing-page__halftone" />
      </div>

      <div className="hero-landing-page__content">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {title ? <h1>{title}</h1> : null}
        {lead ? <p className="lead">{lead}</p> : null}

        {actions.length ? (
          <div className="hero-landing-page__actions">
            {actions.map((action) => (
              <Button
                key={action.label}
                size={action.size || "lg"}
                kind={action.kind || "primary"}
                renderIcon={action.icon === "arrow" ? ArrowRight : undefined}
                href={action.href}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}

        {tags.length ? (
          <div className="hero-landing-page__tags">
            {tags.map((tag) => (
              <Tag key={tag.label} type={tag.type || "cool-gray"}>
                {tag.label}
              </Tag>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

HeroLandingPage.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  lead: PropTypes.string,
  actions: PropTypes.array,
  tags: PropTypes.array,
  backgroundImage: PropTypes.string,
  variant: PropTypes.oneOf(["default", "minimal"]),
};

export default HeroLandingPage;
