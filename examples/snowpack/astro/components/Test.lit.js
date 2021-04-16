import { LitElement, html } from 'lit';

export default class TestEl extends LitElement {
  static is = 'my-element';

  render() {
    return html`
      <div>Hello world</div>
    `;
  }
}

customElements.define(TestEl.is, TestEl);