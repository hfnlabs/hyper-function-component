export type HyperFunctionComponent<
  T extends Element = Element,
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
  // [Attr, Event, Slot, Method]
  names: [string[], string[], string[], string[]];
  // static methods
  methods?: HfcMethods;
};

export type HfcProps = {
  attrs: Record<string, unknown>;
  events: Record<string, (args?: any) => unknown>;
  slots: Record<string, (container: Element, args?: any) => void>;
  _: Record<string, unknown>; // other props
};

export type HfcMethods = Record<string, (args?: any) => any>;
