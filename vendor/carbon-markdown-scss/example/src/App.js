import React, {Component} from 'react';
import {Header, HeaderName, Content} from 'carbon-components-react/es/components/UIShell';
import mdurl from './markdown/markdown-cheatsheet.md';
import Markdown from './Markdown';

class MarkdownExample extends Component {
  state = {};

  async componentDidMount() {
    const response = await fetch(mdurl);
    const mdcontent = await response.text();
    this.setState({mdcontent});
  }

  render() {
    if (this.state.mdcontent == null) {
      return <div>Loading...</div>;
    }
    return <Markdown markdown={this.state.mdcontent} />;
  }
}

export default () => (
  <>
    <Header>
      <HeaderName prefix="Carbon">Markdown Example</HeaderName>
    </Header>
    <Content>
      <MarkdownExample />
    </Content>
  </>
);
