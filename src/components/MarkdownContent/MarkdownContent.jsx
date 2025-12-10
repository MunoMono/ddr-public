import PropTypes from "prop-types";
import { InlineLoading } from "@carbon/react";

import "../../styles/components/_carbon-markdown.scss";

const MarkdownContent = ({ html, loading, error }) => {
  if (loading) {
    return (
      <div style={{ padding: "0.5rem 0" }}>
        <InlineLoading description="Loading content..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sg-callout sg-callout--error">
        <h4>Could not load content</h4>
        <p>{String(error?.message || error)}</p>
      </div>
    );
  }

  if (!html) {
    return null;
  }

  return <div className="markdown-body carbon-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
};

MarkdownContent.propTypes = {
  html: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.bool]),
};

export default MarkdownContent;
