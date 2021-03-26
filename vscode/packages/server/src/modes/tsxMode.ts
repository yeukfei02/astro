import { CompletionList } from 'vscode-languageserver';
import { LanguageMode, Position, TextDocument } from '../languageModes';

export function getTSXMode(): LanguageMode {
  return {
    getId() {
      return 'tsx';
    },
    doComplete(document: TextDocument, position: Position) {
      return { isIncomplete: false, items: [] };
    },
    onDocumentRemoved(_document: TextDocument) {},
    dispose() {},
  };
}
