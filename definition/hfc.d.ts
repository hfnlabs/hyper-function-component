// Type definitions for hyper-function-component 2.1
// Project: https://hyper-function.com/ponent
// Definitions by: terry-fei <https://github.com/terry-fei>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

type HyperFunctionComponent = ((
  container: Element,
  props: HfcProps
) => {
  methods: HfcMethods;
  changed: (props: HfcProps) => void;
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

type HfcProps = {
  attrs: { [k: string]: any };
  events: { [k: string]: (args?: { [k: string]: any }) => any };
  slots: {
    [k: string]: (
      container: Element,
      args?: { key?: string; [k: string]: any }
    ) => void;
  };
  others: { [k: string]: any };
};

type HfcMethods = {
  [k: string]: (args?: { [k: string]: any }) => Awaitable<any>;
};
