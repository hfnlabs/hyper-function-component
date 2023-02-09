export type HyperFunctionComponent<
  E extends Element = Element,
  P = HfcProps,
  MI = HfcMethods,
  MS = HfcMethods
> = ((initProps: P) => {
  methods?: MI;
  connected(container: E): void;
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
  methods?: MS /* static methods */;
};

type RSU = Record<string, unknown>;

export type HfcEventCallback<T = RSU> = (args?: T) => unknown;

export type HfcSlotCallback<E = Element, T = RSU> = (slot: {
  args?: T;
  target: E;
  changed?: () => void;
  removed?: () => void;
}) => void;

export type HfcMethod<T = RSU, P = RSU> = (args?: T) => void | P;

export type HfcProps<
  A = RSU,
  E = {
    [k: string]: HfcEventCallback;
  },
  S = {
    [k: string]: HfcSlotCallback;
  },
  O = RSU
> = {
  attrs?: A;
  events?: E;
  slots?: S;
  _?: O /* other props */;
};

export type HfcMethods = {
  [k: string]: HfcMethod;
};
