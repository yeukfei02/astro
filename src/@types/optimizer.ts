import type { Script, TemplateNode } from '../compiler/interfaces';

export type VisitorFn = (node: TemplateNode) => void;

export interface NodeVisitor {
  enter?: VisitorFn;
  leave?: VisitorFn;
}

export interface Optimizer {
  visitors?: {
    module?: {
      enter: (module: Script) => void
    },
    html?: Record<string, NodeVisitor>;
    css?: Record<string, NodeVisitor>;
  };
  finalize: () => Promise<void>;
}
