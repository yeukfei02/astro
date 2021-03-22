
console.log('defined preact');

customElements.define('preact-island', class extends HTMLElement {
  async connectedCallback() {
    console.log('in connected');
  }
})