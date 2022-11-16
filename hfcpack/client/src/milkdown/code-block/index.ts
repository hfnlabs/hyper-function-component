import { $prose } from "@milkdown/utils";
import { Plugin, PluginKey } from "@milkdown/prose/state";

export default $prose(() => {
  return new Plugin({
    key: new PluginKey("CODE_BLOCK_EDITOR"),
    state: {
      init(_, instance) {},
      apply: (transaction, decorationSet, oldState, state) => {
        if (state.selection.$head.parent.type.name !== "fence") return;
        console.log("active code fence");
        if (!transaction.docChanged) return;
        const code = state.selection.$head.parent.textContent;
        console.log(state.selection.$head.parent.attrs);
        const index = state.doc.content.findIndex(state.selection.$head.pos);
        let codeFenceIndex = 0;
        state.doc.content.forEach((node, _, i) => {
          if (i >= index.index) return;
          if (node.type.name === "fence") codeFenceIndex += 1;
        });

        const editorContainer = document.getElementById("monaco-editor");
        import("../../monaco").then((monaco) => {
          monaco.create(editorContainer!, code);
        });

        // setTimeout(() => {
        //   const codeEl =
        //     document.querySelectorAll<HTMLDivElement>("code div")[
        //       codeFenceIndex
        //     ];
        //   console.log(codeEl);
        //   codeEl.innerHTML = "hehe";
        // }, 100);

        // setInterval(() => {
        //   state.selection.content()
        // },1000)
        // return decorationSet.map(transaction.mapping, transaction.doc);
      },
    },
    props: {
      decorations(this: Plugin, state) {
        return this.getState(state);
      },
    },
  });
});
