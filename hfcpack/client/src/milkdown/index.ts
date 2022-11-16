import { defaultValueCtx, Editor, rootCtx } from "@milkdown/core";
import { history } from "@milkdown/plugin-history";
import { trailing } from "@milkdown/plugin-trailing";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { tooltip } from "@milkdown/plugin-tooltip";
import { slash } from "@milkdown/plugin-slash";
import { codeFence, gfm, heading } from "@milkdown/preset-gfm";
import { block } from "@milkdown/plugin-block";
import { emoji } from "@milkdown/plugin-emoji";
import { indent } from "@milkdown/plugin-indent";
import { cursor } from "@milkdown/plugin-cursor";
import { prismPlugin } from "@milkdown/plugin-prism";
import { clipboard } from "@milkdown/plugin-clipboard";
import { refractor } from "refractor/lib/common";
refractor.alias("html", "hfz");
refractor.alias("html", "hfz-render");

import { nord } from "./theme";
import codeBlock from "./code-block";

gfm
  .configure(heading, {
    displayHashtag: false,
  })
  .configure(codeFence, {
    languageList: [
      "",
      "hfz-render",
      "hfz",
      "typescript",
      "javascript",
      "html",
      "css",
      "python",
      "java",
      "php",
      "go",
      "rust",
    ],
  });

export async function showReadme(container: string) {
  const editor = await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, container);
      ctx.set(
        defaultValueCtx,
        `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4

\`\`\`javascript
function hi() {
  if (a > 0) {
    console.log('okok');
  }
}
\`\`\`
\`\`\`hfz-render
<template
  :data="{
    a: 1,
    b: 2,
    c: 'abcdee',
    d: 'efwaae',
    e: 'asefse',
    f: 'urgwefoi',
    g: 'efhbasdfsdf',
  }"
  hfz
  import:awa-btn="dev"
  import:flex-box="1.3.2"
>
  {{ a }} - {{ b }} - {{ c }} - 13
  <span v-if="a === 2">baba</span>
  <!-- <flex-box justify="center">
    <awa-btn name="awa" :c="c" @click="hello">{{ a }} 1</awa-btn> aaaavvvvvvvzzzzzzzzeeeeeeeee
  </flex-box> -->
  <awa-btn name="awa" :c="c" @click="hello">{{ a }} 1</awa-btn>
  <div #default></div>

  <script>
    export default {
      data() {
        return { a: 1, b: 2, c: "cc" };
      },
      created() {
        setInterval(() => {
          this.a += 1;
        }, 1000);
      },
      methods: {
        hello() {
          this.a += 1;
          console.log("hello");
        },
      },
    };
  </script>
</template>
\`\`\`
`
      );

      ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
        console.log("change");
        const output = doc.toJSON();
        console.log(output);
      });
    })
    .use(gfm)
    .use(nord)
    .use(slash)
    .use(block)
    .use(emoji)
    .use(indent)
    .use(cursor)
    .use(history)
    .use(tooltip)
    .use(trailing)
    .use(clipboard)
    .use(codeBlock)
    .use(
      prismPlugin({
        configureRefractor: () => refractor,
      })
    )
    .use(listener)
    .create();
}
