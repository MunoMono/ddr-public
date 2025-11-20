import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { Button, Column, Grid, Tag } from "@carbon/react";
import { UpToTop } from "@carbon/react/icons";

import AnchorLinks from "../AnchorLinks/AnchorLinks";
import PageHero from "../PageHero/PageHero";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import useMarkdown from "../../hooks/useMarkdown";

const slugify = (value, fallback = "page") => {
  if (!value) return fallback;
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || fallback;
};

const scrollToTop = () => {
  const main = document.getElementById("main-content");
  if (main) {
    main.scrollIntoView({ behavior: "smooth", block: "start" });
    main.focus?.();
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const dedupeById = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const MarkdownPage = ({
  markdownSrc,
  pageClassName = "",
  anchorHeading = "On this page",
  defaultHero = {},
  anchorColumns = 2,
  showTopLink = false,
  topLinkLabel = "Top",
  renderHero,
  heroStyle,
  showAnchors = false,
}) => {
  const { html, meta, headings, loading, error } = useMarkdown(markdownSrc);
  const [heroTabIndex, setHeroTabIndex] = useState(0);

  const hero = { ...defaultHero, ...(meta.hero || {}) };
  const heroTitle = hero.title || defaultHero.title || "";
  const heroLead = hero.lead ?? hero.description ?? defaultHero.lead ?? defaultHero.description ?? "";
  const heroEyebrow = hero.eyebrow || defaultHero.eyebrow || "";
  const heroId = hero.id || slugify(heroTitle || pageClassName || "page-hero");

  const anchorHeadingLabel = meta.anchorHeading || anchorHeading;
  const anchorCols = Number(meta.anchorColumns) || anchorColumns;
  const anchors =
    meta.anchors ||
    headings
      .filter((heading) => heading.depth === 2)
      .map((heading) => ({ id: heading.id, label: heading.label }));
  const anchorLinks = dedupeById(anchors);
  const heroTabs = useMemo(() => anchorLinks.map(({ id, label }) => ({ id, label })), [anchorLinks]);
  const topLabel = meta.topLinkLabel || topLinkLabel;
  const resolvedHeroTabIndex = heroTabs.length ? Math.min(heroTabIndex, heroTabs.length - 1) : 0;

  const handleHeroTabSelect = (tab, index) => {
    setHeroTabIndex(index);
    if (!tab?.id) return;
    const target = document.getElementById(tab.id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const actions = Array.isArray(meta.actions) ? meta.actions : Array.isArray(defaultHero.actions) ? defaultHero.actions : [];
  const tags = Array.isArray(meta.tags) ? meta.tags : Array.isArray(defaultHero.tags) ? defaultHero.tags : [];

  const heroProps = {
    id: heroId,
    eyebrow: heroEyebrow,
    title: heroTitle,
    lead: heroLead,
    anchorLinks,
    anchorHeading: anchorHeadingLabel,
    anchorColumns: anchorCols,
    actions,
    tags,
    heroTabs,
    heroTabIndex,
    onHeroTabSelect: handleHeroTabSelect,
    heroStyle,
  };

  const heroNode =
    typeof renderHero === "function" ? (
      renderHero(heroProps)
    ) : (
      <PageHero
        id={heroId}
        eyebrow={heroEyebrow}
        title={heroTitle}
        lead={heroLead}
        style={heroStyle}
        aside={
          showAnchors && anchorLinks.length ? (
            <AnchorLinks heading={anchorHeadingLabel} links={anchorLinks} columns={anchorCols} />
          ) : null
        }
        tabs={heroTabs}
        activeTab={heroTabs.length ? resolvedHeroTabIndex : undefined}
        onTabSelect={handleHeroTabSelect}
      >
        {actions.length ? (
          <div className="page-header__actions">
            {actions.map((action) => (
              <Button
                key={`${action.label}-${action.href}`}
                kind={action.kind || "primary"}
                size={action.size || "lg"}
                href={action.href}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}

        {tags.length ? (
          <div className="tag-row">
            {tags.map((tag) => (
              <Tag key={`${tag.label}-${tag.type}`} type={tag.type || "gray"}>
                {tag.label}
              </Tag>
            ))}
          </div>
        ) : null}
      </PageHero>
    );

  return (
    <div className={`page ${pageClassName}`.trim()}>
      {heroNode}

      <div className="page-content">
        <section className="page-section" aria-label={heroTitle || heroId}>
          <Grid condensed>
            <Column lg={8} md={8} sm={4}>
              <MarkdownContent html={html} loading={loading} error={error} />
              {showTopLink ? (
                <Button kind="ghost" size="sm" renderIcon={UpToTop} iconDescription={topLabel} onClick={scrollToTop}>
                  {topLabel}
                </Button>
              ) : null}
            </Column>
          </Grid>
        </section>
      </div>
    </div>
  );
};

MarkdownPage.propTypes = {
  markdownSrc: PropTypes.string.isRequired,
  pageClassName: PropTypes.string,
  anchorHeading: PropTypes.string,
  defaultHero: PropTypes.shape({
    id: PropTypes.string,
    eyebrow: PropTypes.string,
    title: PropTypes.string,
    lead: PropTypes.string,
    description: PropTypes.string,
    actions: PropTypes.array,
    tags: PropTypes.array,
  }),
  anchorColumns: PropTypes.number,
  showTopLink: PropTypes.bool,
  topLinkLabel: PropTypes.string,
  renderHero: PropTypes.func,
  heroStyle: PropTypes.object,
  showAnchors: PropTypes.bool,
};

export default MarkdownPage;
