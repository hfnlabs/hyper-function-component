import { monaco } from "./monaco";

export function create(container: HTMLElement, initValue: string) {
  const editor = monaco.editor.create(container, {
    value: initValue,
    language: "html",
    theme: "vs-dark",
    bracketPairColorization: {
      enabled: true,
    },
    // @ts-ignore
    "bracketPairColorization.enabled": true,
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    lineNumbers: "off",
    minimap: {
      enabled: false,
    },

    padding: {
      top: 8,
      bottom: 8,
    },
  });
}
