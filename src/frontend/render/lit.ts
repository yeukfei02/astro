import type { ComponentRenderer } from '../../@types/renderer';
import { createRenderer } from './renderer';
import {renderModule} from '@lit-labs/ssr/lib/render-module.js';
// Execute the above `renderTemplate` in a sandboxed VM with a minimal DOM shim

const Lit: ComponentRenderer<string> = {
  renderStatic(componentUrl, rendererUrl) {
    return async (props) => {
      const ssrResult = await (renderModule(
        rendererUrl,  // Module to load in SSR sandbox
        import.meta.url,         // Referrer URL for module
        'renderTemplate',        // Function to call
        [componentUrl.toString(), props]         // Arguments to function
      ) as Promise<Iterable<unknown>>);

      let out = '';
      for(let text of ssrResult) {
        out += text;
      }
      return out;
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
