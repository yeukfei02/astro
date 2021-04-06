import type { TemplateNode } from '../parser/interfaces';
import type { CompileOptions } from './compiler';

export type VisitorFn = (node: TemplateNode, parent: TemplateNode, type: string, index: number) => void;

export interface NodeVisitor {
  enter?: VisitorFn;
  leave?: VisitorFn;
}

export interface Transformer {
  visitors?: {
    html?: Record<string, NodeVisitor>;
    css?: Record<string, NodeVisitor>;
  };
  finalize: () => Promise<void>;
}

export interface TransformOptions {
  compileOptions: CompileOptions;
  filename: string;
  fileID: string;
}
