/** check if a Component is an Astro Component */
export function check(Component: any) {
  return Component.isAstroComponent;
}
/** Render a Component calling internal _render and passing props and children */
export async function renderToStaticMarkup(Component: any, props: any, children: string) {
  const html = await Component.__render(props, children);
  return { html };
}
