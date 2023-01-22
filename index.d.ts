export type HyperFunctionComponent<
  T extends Element = HTMLDivElement,
  P = HfcProps,
  M = HfcMethods
> = ((
  container: T,
  initProps: P
) => {
  methods?: M;
  changed: (props: P) => void;
  disconnected: () => void;
}) & {
  // container tag name
  tag: string;
  // hfc name
  hfc: string;
  // hfc version
  ver: string;
  // [AttrNames, EventNames, SlotNames, MethodNames]
  names: [string[], string[], string[], string[]];
};

export type HfcProps = {
  attrs: Record<string, unknown>;
  events: Record<string, (args?: Record<string, unknown>) => any>;
  slots: Record<
    string,
    (container: Element, args?: { key?: string; [k: string]: unknown }) => void
  >;
  // other props
  _: Record<string, unknown>;
};

export type HfcMethods = Record<
  string,
  <T = Record<string, unknown>>(args?: Record<string, unknown>) => Awaitable<T>
>;
