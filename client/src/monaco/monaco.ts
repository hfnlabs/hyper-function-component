import "monaco-editor/esm/vs/editor/editor.all.js";

import "monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js";
import "monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js";
import "monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js";

// @ts-ignore
import { language as html } from "monaco-editor/esm/vs/basic-languages/html/html.js";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution.js";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution.js";

import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/language/css/monaco.contribution";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import "monaco-editor/esm/vs/language/html/monaco.contribution";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

html.tokenizer.otherTag.unshift([
  /(v\-|:|@)/,
  "attribute.name",
  "attrJsExpBlock",
]);

html.tokenizer.attrJsExpBlock = [
  [
    /([\w\-]+)(=")/,
    [
      "attribute.name",
      {
        token: "delimiter",
        nextEmbedded: "text/javascript",
      },
    ],
  ],
  [
    /"/,
    {
      token: "delimiter",
      next: "@pop",
      nextEmbedded: "@pop",
    },
  ],
];

const mustacheAction = [
  "",
  {
    token: "delimiter",
    next: "mustacheJsExpBlock",
    nextEmbedded: "text/javascript",
  },
];

html.tokenizer.root.unshift([/( *)({{)/, mustacheAction]);
html.tokenizer.root.unshift([/(\s*)({{)/, mustacheAction]);

html.tokenizer.mustacheJsExpBlock = [
  [
    /}}/,
    {
      token: "delimiter",
      next: "@pop",
      nextEmbedded: "@pop",
    },
  ],
];

monaco.languages.setMonarchTokensProvider("html", html);

export { monaco };
