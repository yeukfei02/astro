import {render} from '@lit-labs/ssr/lib/render-lit-html.js';
import {html} from 'lit';

export async function renderTemplate(url: string, props: Record<any, any>) {
  const {default: Element} = await import(url);
  const tagName = Element.is;
  const attrs = Object.entries(props).map(([p,v]) => `${p}="${v}"`).join(' ');
  const raw = `<${tagName}${attrs ? ' ' + attrs : ''}></${tagName}>`;

  const strings = [raw] as unknown as TemplateStringsArray;
  Object.defineProperty(strings, 'raw', {
    writable: false,
    value: strings
  });

  debugger;
  html`<div>test</div>`;
  return render(html(strings));
}