import type { ComponentRenderer } from '../../@types/renderer';
import { createRenderer } from './renderer';
import type { LitElement } from 'lit';

const Lit: ComponentRenderer<LitElement> = {
  renderStatic(Element) {
    return async () => {
      return 'foo';
    };
  },
  render() {
    return `foo`;
  }
};

const renderer = createRenderer(Lit);

export const __lit_static = renderer.static;
export const __lit_load = renderer.load;
export const __lit_idle = renderer.idle;
export const __lit_visible = renderer.visible;
