/* Copyright 2021, Milkdown by Mirone. */

import type { Emotion, ThemeManager } from '@milkdown/core'
import {
  ThemeBorder,
  ThemeScrollbar,
  ThemeSize,
} from '@milkdown/core'
import { getPalette } from '@milkdown/design-system'
import { injectProsemirrorView } from '@milkdown/theme-pack-helper'

export const getStyle = (manager: ThemeManager, emotion: Emotion) => {
  const { injectGlobal, css } = emotion
  const palette = getPalette(manager)
  const line = palette('line')
  const highlight = palette('secondary', 0.38)

  const selection = css`
    .ProseMirror-selectednode {
      outline: ${manager.get(ThemeSize, 'lineWidth')} solid ${line};
    }
    li.ProseMirror-selectednode {
      outline: none;
    }
    li.ProseMirror-selectednode::after {
      ${manager.get(ThemeBorder, undefined)};
    }
    & ::selection {
      background: ${highlight};
    }
  `

  const footnote = css`
    .footnote-definition {
      ${manager.get(ThemeBorder, undefined)};
      border-radius: ${manager.get(ThemeSize, 'radius')};
      background-color: ${palette('background')};
      padding: 16px;
      display: flex;
      flex-direction: row;
      & > .footnote-definition_content {
        flex: 1;
        width: calc(100% - 16px);
        & > dd {
          margin-inline-start: 16px;
        }
        & > dt {
          color: ${palette('secondary')};
          font-weight: 500;
        }
      }
      & > .footnote-definition_anchor {
        width: 16px;
      }
    }
  `

  const table = css`
    /* copy from https://github.com/ProseMirror/prosemirror-tables/blob/master/style/tables.css */
    .tableWrapper {
      overflow-x: auto;
      margin: 0;
      ${manager.get(ThemeScrollbar, ['x'])}
      width: 100%;
      * {
        margin: 0;
        box-sizing: border-box;
        font-size: 16px;
      }
    }
    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      overflow: auto;
      border-radius: ${manager.get(ThemeSize, 'radius')};
    }
    tr {
      ${manager.get(ThemeBorder, 'bottom')};
    }
    td,
    th {
      padding: 0 16px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
      min-width: 100px;
      ${manager.get(ThemeBorder, undefined)};
      text-align: left;
      line-height: 3;
      height: 48px;
      vertical-align: middle;
    }
    th {
      background: ${palette('background', 0.5)};
      font-weight: 400;
    }
    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: 0;
      z-index: 20;
      pointer-events: none;
      background: ${palette('secondary')};
      width: ${manager.get(ThemeSize, 'lineWidth')};
    }
    .selectedCell {
      &::after {
        z-index: 2;
        position: absolute;
        content: "";
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: ${palette('secondary', 0.38)};
        pointer-events: none;
      }
      & ::selection {
        background: transparent;
      }
    }
  `

  injectProsemirrorView(emotion)

  injectGlobal`
        .milkdown {
            .material-icons-outlined {
                font-size: 24px;
            }
            position: relative;
            ${selection};
            .resize-cursor {
                cursor: ew-resize;
                cursor: col-resize;
            }
            .editor {
                outline: none;
                ${footnote};
                ${table}
            }
        }
    `
}
