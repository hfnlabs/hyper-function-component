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
  // tag name
  tag: string;
  // hfc name
  hfc: string;
  // hfc version
  ver: string;
  // [AttrNames, EventNames, SlotNames, MethodNames]
  names: [string[], string[], string[], string[]];
};

type RSU = Record<string, unknown>;

export type HfcProps = {
  attrs: RSU;
  events: Record<string, (args?: RSU) => unknown>;
  slots: Record<
    string,
    (container: Element, args?: RSU & { key?: string }) => void
  >;
  _: RSU; // other props
};

export type HfcMethods = Record<string, (args?: RSU) => RSU | Promise<RSU>>;
