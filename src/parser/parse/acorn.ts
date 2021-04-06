import type { Node } from 'acorn';
import type { BaseNode } from '../interfaces';
import { parseExpression } from '@babel/parser';
import parseAstro from './index.js';
// import acorn from 'acorn';
// // @ts-ignore
// import jsx from 'acorn-jsx';
// const acornJsx = acorn.Parser.extend(jsx());

export interface Expression {
  type: 'Expression';
  start: number;
  end: number;
  codeStart: string;
  codeEnd: string;
  children: BaseNode[];
}

interface ParseState {
  source: string;
  start: number;
  index: number;
  curlyCount: number;
  bracketCount: number;
  root: Expression;
}

function peek_char(state: ParseState) {
  return state.source[state.index + 1];
}

function next_char(state: ParseState) {
  return state.source[state.index++];
}

function in_bounds(state: ParseState) {
  return state.index < state.source.length;
}

function consume_string(state: ParseState, stringChar: string) {
  let inEscape;
  do {
    const char = next_char(state);

    if(inEscape) {
      inEscape = false;
    } else if(char === '\\') {
      inEscape = true;
    } else if(char === stringChar) {
      break;
    }
  } while(in_bounds(state));
}

const voidElements = new Set(['area', 'base', 'br', 'col', 'command', 'embed', 
  'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 
  'track', 'wbr']);

function consume_tag(state: ParseState) {
  const start = state.index - 1;
  let tagName = '';
  let inTag = false;
  let selfClosed = false;

  let bracketCount = 1;
  let bracketIndex = 1;
  do {
    const char = next_char(state);

    switch(char) {
      case '\'':
      case '"': {
        consume_string(state, char);
        break;
      }
      case '<': {
        inTag = false;
        tagName = '';
        bracketCount++;
        bracketIndex++;
        break;
      }
      case '>': {
        bracketCount++;
        bracketIndex--;

        if(selfClosed || voidElements.has(tagName.toLowerCase())) {
          bracketCount = bracketCount + 2;
        }

        inTag = false;
        selfClosed = false;
        break;
      }
      case ' ': {
        inTag = true;
        break;
      }
      case '/': {
        if(inTag) {
          selfClosed = true;
        }
        break;
      }
      default: {
        if(!inTag) {
          tagName += char;
        }
        break;
      }
    }

    // Unclosed tags
    if(state.curlyCount <= 0) {
      break;
    }

    // Tag closed
    if(bracketIndex === 0 && bracketCount % 4 === 0) {
      break;
    }
  } while(in_bounds(state));

  const source = state.source.substring(start, state.index);


  const ast = parseAstro(source);
  const fragment = ast.html;

  return fragment;
}

function consume_expression(source: string, start: number): Expression {
  const expr: Expression = {
    type: 'Expression',
    start,
    end: Number.NaN,
    codeStart: '',
    codeEnd: '',
    children: []
  };

  let codeEndStart: number = 0;
  const state: ParseState = {
    source, start, index: start,
    curlyCount: 1,
    bracketCount: 0,
    root: expr
  };

  do {
    const char = next_char(state);
    
    switch(char) {
      case '{': {
        state.curlyCount++;
        break;
      }
      case '}': {
        state.curlyCount--;
        break;
      }
      case '<': {
        expr.codeStart = source.substring(start, state.index - 1);
        const tag = consume_tag(state);
        expr.children.push(tag);
        codeEndStart = state.index;
        break;
      }
      case '\'':
      case '"':
      case '`': {
        consume_string(state, char);
        break;
      }
      case '/': {
        switch(peek_char(state)) {
          case '/': {
            throw new Error('Comments not supported');
            break;
          }
          case '*': {
            throw new Error('Comments not supported');
            break;
          }
        }
      }
    }
  } while(in_bounds(state) && state.curlyCount > 0);

  expr.end = state.index - 1;

  if(codeEndStart) {
    expr.codeEnd = source.substring(codeEndStart, expr.end);
  } else {
    expr.codeStart = source.substring(start, expr.end);
  }

  return expr;
}

export const parse = (source: string): Node => {
  throw new Error('No longer used.');
  // acorn.parse(source, {
  //   sourceType: 'module',
  //   ecmaVersion: 2020,
  //   locations: true,
  // });
};

export const parse_expression_at = (source: string, index: number): number => {
  /*const expression = consume_expression(source, index);

  return expression;*/
  
  // TODO: Clean up after acorn -> @babel/parser move
  try {
    // First, try to parse the expression. Unlike acorn, @babel/parser isn't relaxed
    // enough to just stop after the first expression, so we almost always expect a
    // parser error here instead. This is expected, so handle it.
    parseExpression(source.slice(index), {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    throw new Error('Parse error.'); // Expected to fail.
  } catch (err) {
    if (err.message.startsWith('Unexpected token') && source[index + err.pos] === '}') {
      return index + err.pos;
    }
    if (err.pos) {
      err.pos = index + err.pos;
    }
    throw err;
  }
};
// acornJsx.parseExpressionAt(source, index, {
//   sourceType: 'module',
//   ecmaVersion: 2020,
//   locations: true,
// });
