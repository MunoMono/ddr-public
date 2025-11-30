import PropTypes from "prop-types";
import { Link } from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";

import "../../styles/components/_anchor-links.scss";

const AnchorLinks = ({ heading = "", links = [], columns = 1, size = "normal", onLinkSelect }) => {
  if (!links.length) return null;

  const useGridLayout = columns > 1;
  const sizeClass = size === "small" ? "anchor-links--small" : "anchor-links--normal";
  const handleLinkClick = (event, link, index) => {
    if (typeof onLinkSelect !== "function") return;
    event.preventDefault();
    onLinkSelect(link, index);
  };

  return (
    <div
      className={`anchor-links-wrapper ${sizeClass} ${useGridLayout ? "grid-layout" : ""}`}
      style={useGridLayout ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : {}}
    >
      {heading ? <h1 className="anchor-links-heading">{heading}</h1> : null}
      <div className="anchor-links-list">
        {links.map((link, index) => (
          <div key={link.id} className="anchor-link-item">
            <ArrowRight className="anchor-arrow" size={24} />
            <Link
              href={onLinkSelect ? "#" : `#${link.id}`}
              className="anchor-link-text"
              onClick={(event) => handleLinkClick(event, link, index)}
            >
              {link.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

AnchorLinks.propTypes = {
  heading: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  columns: PropTypes.number,
  size: PropTypes.oneOf(["normal", "small"]),
  onLinkSelect: PropTypes.func,
};

export default AnchorLinks;
