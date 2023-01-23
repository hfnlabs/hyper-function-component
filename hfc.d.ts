export type HyperFunctionComponent<
  T extends Element = HTMLDivElement,
  P extends HfcProps = HfcProps,
  M extends HfcMethods = HfcMethods
> = ((
  container: T,
  initProps: P
) => {
  methods?: M;
  changed: (props: P) => void;
  disconnected: () => void;
}) & {
  // tag name
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
  events: Record<string, (args?: any) => unknown>;
  slots: Record<string, (container: Element, args?: any) => void>;
  _: Record<string, unknown>; // other props
};

export type HfcMethods = Record<string, (args?: any) => any>;
