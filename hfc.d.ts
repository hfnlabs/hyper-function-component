export type HyperFunctionComponent = ((initProps: HfcProps) => {
  methods?: HfcMethods;
  connected(container: Element): void;
  changed(props: HfcProps, partial?: boolean): void;
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

type RSU = Record<string, unknown>;

export type HfcProps = {
  attrs?: RSU;
  events?: Record<string, (args?: RSU) => unknown>;
  slots?: Record<
    string,
    (slot: {
      args?: RSU;
      target: Element;
      changed?: () => void;
      removed?: () => void;
    }) => void
  >;
  _?: RSU /* other props */;
};

export type HfcMethods = Record<string, (args?: RSU) => any>;
