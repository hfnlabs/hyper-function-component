export type HyperFunctionComponent<
  T extends Element = Element,
  P extends HfcProps = HfcProps,
  M extends HfcMethods = HfcMethods
> = ((initProps: P) => {
  methods?: M;
  connected(container: T): void;
  changed(props: P, partial?: boolean): void;
  disconnected(): void;
}) & {
  tag: string /* tag name */;
  hfc: string /* hfc name */;
  ver: string /* hfc version */;
  names: [
    string[],
    string[],
    string[],
    string[]
  ] /* [attr, event, slot, method] */;
  methods?: HfcMethods /* static methods */;
};

export type HfcProps = {
  attrs?: Record<string, unknown>;
  events?: Record<string, (args?: any) => unknown>;
  slots?: Record<string, (container: Element, args?: any) => void>;
  _?: Record<string, unknown>; // other props
};

export type HfcMethods = Record<string, (args?: any) => any>;
