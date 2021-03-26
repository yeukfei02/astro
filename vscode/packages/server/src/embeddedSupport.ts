import { TextDocument, Position, LanguageService, TokenType, Range } from './languageModes';
import { parse } from 'astro/parser';
import { ImportSpecifier, parse as moduleParse } from 'es-module-lexer';

export interface LanguageRange extends Range {
  languageId: string | undefined;
  attributeValue?: boolean;
}

export interface AstroDocumentRegions {
  getEmbeddedDocument(languageId: string, ignoreAttributeValues?: boolean): TextDocument;
  getLanguageRanges(range: Range): LanguageRange[];
  getLanguageAtPosition(position: Position): string | undefined;
  getLanguagesInDocument(): string[];
  getImportedScripts(): string[];
}

export const CSS_STYLE_RULE = '__';

interface EmbeddedRegion {
  languageId: string | undefined;
  start: number;
  end: number;
}

export async function getDocumentRegions(languageService: LanguageService, document: TextDocument): Promise<AstroDocumentRegions> {
  let regions: EmbeddedRegion[] = [];
  let imports: readonly ImportSpecifier[] = [];
  let exports: readonly string[] = [];

  const { module } = parse(document.getText());

  if (module) {
    // eslint-disable-next-line prettier/prettier
    ([imports, exports] = moduleParse(module.content, document.uri));
    console.log(imports, exports);
    regions.push({ start: module.start, end: module.end, languageId: 'typescriptreact' });
  }

  return {
    getLanguageRanges: (range: Range) => getLanguageRanges(document, regions, range),
    getEmbeddedDocument: (languageId: string, ignoreAttributeValues: boolean) => getEmbeddedDocument(document, regions, languageId, ignoreAttributeValues),
    getLanguageAtPosition: (position: Position) => getLanguageAtPosition(document, regions, position),
    getLanguagesInDocument: () => getLanguagesInDocument(document, regions),
    getImportedScripts: () => [],
  };
}
function getLanguageRanges(document: TextDocument, regions: EmbeddedRegion[], range: Range): LanguageRange[] {
  let result: LanguageRange[] = [];
  let currentPos = range ? range.start : Position.create(0, 0);
  let currentOffset = range ? document.offsetAt(range.start) : 0;
  let endOffset = range ? document.offsetAt(range.end) : document.getText().length;
  for (let region of regions) {
    if (region.end > currentOffset && region.start < endOffset) {
      let start = Math.max(region.start, currentOffset);
      let startPos = document.positionAt(start);
      if (currentOffset < region.start) {
        result.push({
          start: currentPos,
          end: startPos,
          languageId: 'html',
        });
      }
      let end = Math.min(region.end, endOffset);
      let endPos = document.positionAt(end);
      if (end > region.start) {
        result.push({
          start: startPos,
          end: endPos,
          languageId: region.languageId,
          attributeValue: region.attributeValue,
        });
      }
      currentOffset = end;
      currentPos = endPos;
    }
  }
  if (currentOffset < endOffset) {
    let endPos = range ? range.end : document.positionAt(endOffset);
    result.push({
      start: currentPos,
      end: endPos,
      languageId: 'html',
    });
  }
  return result;
}

function getLanguagesInDocument(_document: TextDocument, regions: EmbeddedRegion[]): string[] {
  let result = [];
  for (let region of regions) {
    if (region.languageId && result.indexOf(region.languageId) === -1) {
      result.push(region.languageId);
      if (result.length === 3) {
        return result;
      }
    }
  }
  result.push('html');
  return result;
}

function getLanguageAtPosition(document: TextDocument, regions: EmbeddedRegion[], position: Position): string | undefined {
  let offset = document.offsetAt(position);
  for (let region of regions) {
    if (region.start <= offset) {
      if (offset <= region.end) {
        return region.languageId;
      }
    } else {
      break;
    }
  }
  return 'html';
}

function getEmbeddedDocument(document: TextDocument, contents: EmbeddedRegion[], languageId: string, ignoreAttributeValues: boolean): TextDocument {
  let currentPos = 0;
  let oldContent = document.getText();
  let result = '';
  let lastSuffix = '';
  for (let c of contents) {
    if (c.languageId === languageId && (!ignoreAttributeValues || !c.attributeValue)) {
      result = substituteWithWhitespace(result, currentPos, c.start, oldContent, lastSuffix, getPrefix(c));
      result += oldContent.substring(c.start, c.end);
      currentPos = c.end;
      lastSuffix = getSuffix(c);
    }
  }
  result = substituteWithWhitespace(result, currentPos, oldContent.length, oldContent, lastSuffix, '');
  return TextDocument.create(document.uri, languageId, document.version, result);
}

function getPrefix(c: EmbeddedRegion) {
  if (c.attributeValue) {
    switch (c.languageId) {
      case 'css':
        return CSS_STYLE_RULE + '{';
    }
  }
  return '';
}
function getSuffix(c: EmbeddedRegion) {
  if (c.attributeValue) {
    switch (c.languageId) {
      case 'css':
        return '}';
      case 'javascript':
        return ';';
    }
  }
  return '';
}

function substituteWithWhitespace(result: string, start: number, end: number, oldContent: string, before: string, after: string) {
  let accumulatedWS = 0;
  result += before;
  for (let i = start + before.length; i < end; i++) {
    let ch = oldContent[i];
    if (ch === '\n' || ch === '\r') {
      // only write new lines, skip the whitespace
      accumulatedWS = 0;
      result += ch;
    } else {
      accumulatedWS++;
    }
  }
  result = append(result, ' ', accumulatedWS - after.length);
  result += after;
  return result;
}

function append(result: string, str: string, n: number): string {
  while (n > 0) {
    if (n & 1) {
      result += str;
    }
    n >>= 1;
    str += str;
  }
  return result;
}

function getAttributeLanguage(attributeName: string): string | null {
  let match = attributeName.match(/^(style)$|^(on\w+)$/i);
  if (!match) {
    return null;
  }
  return match[1] ? 'css' : 'javascript';
}
