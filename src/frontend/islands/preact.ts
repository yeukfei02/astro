// @ts-ignore
import { h, render } from '/_snowpack/pkg/preact.js';

customElements.define('preact-island', class extends HTMLElement {
  async connectedCallback() {
    console.log('in connected');

    const Component = await import(this.getAttribute('component') as string);
    render(h(Component, null), this);
  }
});