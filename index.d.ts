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
  attrs: { [k: string]: any };
  events: { [k: string]: (args?: { [k: string]: any }) => Awaitable<any> };
  slots: {
    [k: string]: (
      container: Element,
      args?: { key?: string; [k: string]: any }
    ) => void;
  };
  // all props
  _: { [k: string]: any };
};

export type HfcMethods = {
  [k: string]: (args?: { [k: string]: any }) => Awaitable<any>;
};
