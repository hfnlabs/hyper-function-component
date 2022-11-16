/* Copyright 2021, Milkdown by Mirone. */

import type { Icon, IconValue } from "@milkdown/design-system";

interface IconMeta {
  icon: string;
  label: string;
}

const iconMapping: Record<Icon, IconMeta> = {
  h1: {
    label: "h1",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M24.6 34.15h3v-20.3h-7.15v3h4.15ZM9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30ZM9 9v30V9Z"/></svg>`,
  },
  h2: {
    label: "h2",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M18.25 34.15h11.5v-3h-8.5V25.4h5.5q1.2 0 2.1-.9.9-.9.9-2.1v-5.55q0-1.2-.9-2.1-.9-.9-2.1-.9h-8.5v3h8.5v5.55h-5.5q-1.2 0-2.1.9-.9.9-.9 2.1ZM9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30ZM9 9v30V9Z"/></svg>`,
  },
  h3: {
    label: "h3",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M18.25 34.15h8.5q1.2 0 2.1-.9.9-.9.9-2.1V26.8q0-1.35-.725-2.125Q28.3 23.9 27.3 23.9q1 0 1.725-.675.725-.675.725-2.075v-4.3q0-1.2-.9-2.1-.9-.9-2.1-.9h-8.5v3h8.5v5.55H22.4v3h4.35v5.75h-8.5ZM9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30ZM9 9v30V9Z"/></svg>`,
  },
  loading: {
    label: "loading",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M15.8 41h16.4v-6.35q0-3.5-2.375-6.025Q27.45 26.1 24 26.1t-5.825 2.525Q15.8 31.15 15.8 34.65ZM24 21.9q3.45 0 5.825-2.525T32.2 13.3V7H15.8v6.3q0 3.55 2.375 6.075Q20.55 21.9 24 21.9ZM8 44v-3h4.8v-6.35q0-3.5 1.825-6.425T19.7 24q-3.25-1.3-5.075-4.25Q12.8 16.8 12.8 13.3V7H8V4h32v3h-4.8v6.3q0 3.5-1.825 6.45T28.3 24q3.25 1.3 5.075 4.225Q35.2 31.15 35.2 34.65V41H40v3Z"/></svg>`,
  },
  quote: {
    label: "quote",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M29 23h8v-8h-8Zm-18 0h8v-8h-8Zm20.3 11 4-8H26V12h14v14.4L36.2 34Zm-18 0 4-8H8V12h14v14.4L18.2 34ZM15 19Zm18 0Z"/></svg>`,
  },
  code: {
    label: "code",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="m16 35.9-12-12 12.1-12.1 2.15 2.15L8.3 23.9l9.85 9.85Zm15.9.1-2.15-2.15 9.95-9.95-9.85-9.85L32 11.9l12 12Z"/></svg>`,
  },
  table: {
    label: "table",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M41 41.95H9q-1.2 0-2.1-.9-.9-.9-.9-2.1V9q0-1.2.9-2.1Q7.8 6 9 6h32q1.2 0 2.1.9.9.9.9 2.1v29.95q0 1.2-.9 2.1-.9.9-2.1.9ZM9 16.05h32V9H9Zm7.5 3H9v19.9h7.5Zm17 0v19.9H41v-19.9Zm-3 0h-11v19.9h11Z"/></svg>`,
  },
  divider: {
    label: "divider",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M8 25.5v-3h32v3Z"/></svg>`,
  },
  image: {
    label: "image",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30Zm2.8-4.85h24.45l-7.35-9.8-6.6 8.55-4.65-6.35ZM9 39V9v30Z"/></svg>`,
  },
  brokenImage: {
    label: "broken image",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm2.15-15.7 8.6-8.6 8.5 8.5 8.55-8.55 2.2 2.2V9H9v15.15ZM9 39h30V24.1l-2.2-2.2-8.55 8.55-8.5-8.5-8.6 8.6L9 28.4V39Zm0 0V24.1v3V9v30Z"/></svg>`,
  },
  bulletList: {
    label: "bullet list",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M8.55 39q-1.05 0-1.8-.725T6 36.55q0-1.05.75-1.8t1.8-.75q1 0 1.725.75.725.75.725 1.8 0 1-.725 1.725Q9.55 39 8.55 39ZM16 38v-3h26v3ZM8.55 26.5q-1.05 0-1.8-.725T6 24q0-1.05.75-1.775.75-.725 1.8-.725 1 0 1.725.75Q11 23 11 24t-.725 1.75q-.725.75-1.725.75Zm7.45-1v-3h26v3ZM8.5 14q-1.05 0-1.775-.725Q6 12.55 6 11.5q0-1.05.725-1.775Q7.45 9 8.5 9q1.05 0 1.775.725Q11 10.45 11 11.5q0 1.05-.725 1.775Q9.55 14 8.5 14Zm7.5-1v-3h26v3Z"/></svg>`,
  },
  orderedList: {
    label: "ordered list",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M6 40v-1.7h4.2V37H8.1v-1.7h2.1V34H6v-1.7h5.9V40Zm10.45-2.45v-3H42v3ZM6 27.85v-1.6l3.75-4.4H6v-1.7h5.9v1.6l-3.8 4.4h3.8v1.7Zm10.45-2.45v-3H42v3ZM8.1 15.8V9.7H6V8h3.8v7.8Zm8.35-2.55v-3H42v3Z"/></svg>`,
  },
  taskList: {
    label: "task list",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M11.1 37.3 4 30.2l2.1-2.1 5 4.95 8.95-8.95 2.1 2.15Zm0-16L4 14.2l2.1-2.1 5 4.95 8.95-8.95 2.1 2.15ZM26 33.5v-3h18v3Zm0-16v-3h18v3Z"/></svg>`,
  },
  bold: {
    label: "bold",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M14 36V8h11.4q3.3 0 5.725 2.1t2.425 5.3q0 1.9-1.05 3.5t-2.8 2.45v.3q2.15.7 3.475 2.5 1.325 1.8 1.325 4.05 0 3.4-2.625 5.6Q29.25 36 25.75 36Zm4.3-16.15h6.8q1.75 0 3.025-1.15t1.275-2.9q0-1.75-1.275-2.925Q26.85 11.7 25.1 11.7h-6.8Zm0 12.35h7.2q1.9 0 3.3-1.25t1.4-3.15q0-1.85-1.4-3.1t-3.3-1.25h-7.2Z"/></svg>`,
  },
  italic: {
    label: "italic",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M10 40v-5h6.85l8.9-22H18V8h20v5h-6.85l-8.9 22H30v5Z"/></svg>`,
  },
  inlineCode: {
    label: "inline code",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="m16 35.9-12-12 12.1-12.1 2.15 2.15L8.3 23.9l9.85 9.85Zm15.9.1-2.15-2.15 9.95-9.95-9.85-9.85L32 11.9l12 12Z"/></svg>`,
  },
  strikeThrough: {
    label: "strike through",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M25.2 40q-3.9 0-7.1-2.075-3.2-2.075-4.65-5.575l3.45-1.45q1 2.4 3.25 3.85 2.25 1.45 5.05 1.45 2.6 0 4.15-1.35 1.55-1.35 1.55-3.65 0-1.15-.475-2.425T29.1 26.5h4.2q.7 1.15 1.05 2.3.35 1.15.35 2.4 0 3.9-2.65 6.35Q29.4 40 25.2 40ZM4 23.5v-3h40v3ZM23.7 7.7q3.3 0 5.85 1.55t3.75 4.3l-3.45 1.55q-.7-1.7-2.325-2.65-1.625-.95-3.825-.95-2.45 0-3.95 1.2t-1.5 3.3q0 .4.05.75t.15.75h-3.7q-.1-.4-.15-.8-.05-.4-.05-.8 0-3.65 2.55-5.925T23.7 7.7Z"/></svg>`,
  },
  link: {
    label: "link",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M22.5 34H14q-4.15 0-7.075-2.925T4 24q0-4.15 2.925-7.075T14 14h8.5v3H14q-2.9 0-4.95 2.05Q7 21.1 7 24q0 2.9 2.05 4.95Q11.1 31 14 31h8.5Zm-6.25-8.5v-3h15.5v3ZM25.5 34v-3H34q2.9 0 4.95-2.05Q41 26.9 41 24q0-2.9-2.05-4.95Q36.9 17 34 17h-8.5v-3H34q4.15 0 7.075 2.925T44 24q0 4.15-2.925 7.075T34 34Z"/></svg>`,
  },
  leftArrow: {
    label: "left arrow",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M28.05 36 16 23.95 28.05 11.9l2.15 2.15-9.9 9.9 9.9 9.9Z"/></svg>`,
  },
  rightArrow: {
    label: "right arrow",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z"/></svg>`,
  },
  upArrow: {
    label: "up arrow",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M14.15 30.75 12 28.6l12-12 12 11.95-2.15 2.15L24 20.85Z"/></svg>`,
  },
  downArrow: {
    label: "down arrow",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="m24 30.75-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z"/></svg>`,
  },
  alignLeft: {
    label: "align left",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M6 42v-3h36v3Zm0-8.25v-3h23.6v3Zm0-8.25v-3h36v3Zm0-8.25v-3h23.6v3ZM6 9V6h36v3Z"/></svg>`,
  },
  alignRight: {
    label: "align right",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M6 42v-3h36v3Zm12.45-8.25v-3H42v3ZM6 25.5v-3h36v3Zm12.45-8.25v-3H42v3ZM6 9V6h36v3Z"/></svg>`,
  },
  alignCenter: {
    label: "align center",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M6 42v-3h36v3Zm8.2-8.25v-3h19.65v3ZM6 25.5v-3h36v3Zm8.2-8.25v-3h19.65v3ZM6 9V6h36v3Z"/></svg>`,
  },
  delete: {
    label: "delete",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M13.05 42q-1.25 0-2.125-.875T10.05 39V10.5H8v-3h9.4V6h13.2v1.5H40v3h-2.05V39q0 1.2-.9 2.1-.9.9-2.1.9Zm21.9-31.5h-21.9V39h21.9Zm-16.6 24.2h3V14.75h-3Zm8.3 0h3V14.75h-3Zm-13.6-24.2V39Z"/></svg>`,
  },
  select: {
    label: "select",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39h3Zm-3-7.4v-4.15h3v4.15Zm0-8.55V21.9h3v4.15Zm0-8.5V13.4h3v4.15ZM6 9q0-1.2.9-2.1Q7.8 6 9 6v3Zm7.4 25.6V13.4h21.2v21.2Zm0 7.4v-3h4.15v3Zm0-33V6h4.15v3Zm3 22.6h15.2V16.4H16.4ZM21.95 42v-3h4.15v3Zm0-33V6h4.15v3Zm8.5 33v-3h4.15v3Zm0-33V6h4.15v3ZM39 42v-3h3q0 1.2-.9 2.1-.9.9-2.1.9Zm0-7.4v-4.15h3v4.15Zm0-8.55V21.9h3v4.15Zm0-8.5V13.4h3v4.15ZM39 9V6q1.2 0 2.1.9.9.9.9 2.1Z"/></svg>`,
  },
  unchecked: {
    label: "unchecked",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30Z"/></svg>`,
  },
  checked: {
    label: "checked",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M20.95 31.95 35.4 17.5l-2.15-2.15-12.3 12.3L15 21.7l-2.15 2.15ZM9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30ZM9 9v30V9Z"/></svg>`,
  },
  undo: {
    label: "undo",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M31 40V21.6H11.7l4.5 4.5-2.1 2.1L6 20.1l8.1-8.1 2.1 2.1-4.5 4.5H31q1.25 0 2.125.875T34 21.6V40Z"/></svg>`,
  },
  redo: {
    label: "redo",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M14 40V21.6q0-1.25.875-2.125T17 18.6h19.3l-4.5-4.5 2.1-2.1 8.1 8.1-8.1 8.1-2.1-2.1 4.5-4.5H17V40Z"/></svg>`,
  },
  liftList: {
    label: "lift list",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M6 42v-3h36v3Zm16.65-8.25v-3H42v3Zm-9.4-2.9-7.05-7 7.05-6.8Zm9.4-5.35v-3H42v3Zm0-8.25v-3H42v3ZM6 9V6h36v3Z"/></svg>`,
  },
  sinkList: {
    label: "sink list",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M6 42v-3h36v3Zm0-11.15v-13.8l7.05 6.8ZM6 9V6h36v3Zm16.65 24.75v-3H42v3Zm0-8.25v-3H42v3Zm0-8.25v-3H42v3Z"/></svg>`,
  },
  dragHandle: {
    label: "drag handle",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M17.5 40q-1.45 0-2.475-1.025Q14 37.95 14 36.5q0-1.45 1.025-2.475Q16.05 33 17.5 33q1.45 0 2.475 1.025Q21 35.05 21 36.5q0 1.45-1.025 2.475Q18.95 40 17.5 40Zm13 0q-1.45 0-2.475-1.025Q27 37.95 27 36.5q0-1.45 1.025-2.475Q29.05 33 30.5 33q1.45 0 2.475 1.025Q34 35.05 34 36.5q0 1.45-1.025 2.475Q31.95 40 30.5 40Zm-13-12.5q-1.45 0-2.475-1.025Q14 25.45 14 24q0-1.45 1.025-2.475Q16.05 20.5 17.5 20.5q1.45 0 2.475 1.025Q21 22.55 21 24q0 1.45-1.025 2.475Q18.95 27.5 17.5 27.5Zm13 0q-1.45 0-2.475-1.025Q27 25.45 27 24q0-1.45 1.025-2.475Q29.05 20.5 30.5 20.5q1.45 0 2.475 1.025Q34 22.55 34 24q0 1.45-1.025 2.475Q31.95 27.5 30.5 27.5ZM17.5 15q-1.45 0-2.475-1.025Q14 12.95 14 11.5q0-1.45 1.025-2.475Q16.05 8 17.5 8q1.45 0 2.475 1.025Q21 10.05 21 11.5q0 1.45-1.025 2.475Q18.95 15 17.5 15Zm13 0q-1.45 0-2.475-1.025Q27 12.95 27 11.5q0-1.45 1.025-2.475Q29.05 8 30.5 8q1.45 0 2.475 1.025Q34 10.05 34 11.5q0 1.45-1.025 2.475Q31.95 15 30.5 15Z"/></svg>`,
  },
  text: {
    label: "text",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 48 48"><path d="M21.5 40V13H10V8h28v5H26.5v27Z"/></svg>`,
  },
};

export const getIcon = (id: Icon): IconValue | undefined => {
  const target = iconMapping[id];
  if (!target) return;

  const icon = document.createElement("span");
  icon.className = "icon";
  icon.innerHTML = target.icon;

  return {
    dom: icon,
    label: target.label,
  };
};
