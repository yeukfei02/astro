import { h, render } from 'preact';

customElements.define('preact-island', class PreactIsland extends HTMLElement {
  async connectedCallback() {
    const Component = await import(this.getAttribute('component'));
    render(h(Component, JSON.parse(this.getAttribute('props'))), this);
  }
});