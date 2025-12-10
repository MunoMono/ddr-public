import React from 'react';
import marked from 'marked';

export default ({markdown}) => {
  let markdownHtml = marked(markdown);

  return (
    <div
      className="markdown-body"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: markdownHtml}}
    />
  );
};
