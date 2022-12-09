import { blockquote, bulletList, codeInline, commonmarkPlugins, doc, em, hardbreak, heading, hr, link, orderedList, paragraph, strong, text } from '@milkdown/preset-commonmark'
import { footnoteDefinition, footnoteReference, strikeThrough, table } from '@milkdown/preset-gfm'
import type { AtomPlugin } from '@milkdown/utils'
import { $remark, AtomList } from '@milkdown/utils'
import remarkGFM from 'remark-gfm'

import { image } from './image'
import { hfzView } from './hfz-view'
import { listItem } from './list-item'
import { taskListItem } from './task-list-item'
import { codeFence } from './code-fence'

export const gfm: AtomList<AtomPlugin> = AtomList.create([
  doc(),
  paragraph(),
  hardbreak(),
  blockquote(),

  hfzView(),
  codeFence(),
  bulletList(),
  orderedList(),
  listItem(),
  heading(),
  hr(),
  text(),
  image(),

  // gfm nodes
  $remark(() => remarkGFM),
  table(),
  strikeThrough(),
  taskListItem(),
  footnoteReference(),
  footnoteDefinition(),

  // marks
  codeInline(),
  em(),
  strong(),
  link(),
  ...commonmarkPlugins,
])
