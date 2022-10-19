const codes = {
  bom: "\uFEFF",
  carriage: "\r",
  newline: "\n",
  space: " ",
  tab: "\t",
  colon: ":",
  comment: "#",
  annotation: "@",
};

const bracketMatches = [
  { value: "{", type: "leftCurly" },
  { value: "}", type: "rightCurly" },
  { value: "[", type: "leftSquare" },
  { value: "]", type: "rightSquare" },
  { value: "(", type: "leftParen" },
  { value: ")", type: "rightParen" },
];

function isVaildChar(char: string) {
  if (char === undefined) return false;

  return (
    (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z") ||
    (char >= "0" && char <= "9") ||
    char === "_" ||
    char === "."
  );
}

export function tokenizer(input: string) {
  let current = 0;
  let lineNumber = 1;
  let column = 1;
  let tokens = [];
  let str = "";
  let char;

  const len = input.length;
  while (current < len) {
    char = input[current];

    if (char === codes.newline) {
      lineNumber += 1;
      column = 1;
      current++;
      continue;
    }

    if (
      char === codes.space ||
      char === codes.carriage ||
      char === codes.tab ||
      char === codes.bom
    ) {
      column++;
      current++;
      continue;
    }

    if (char === codes.colon) {
      tokens.push({
        type: "colon",
        value: ":",
        offset: current,
        lineNumber,
        column,
      });

      column++;
      current++;
      continue;
    }

    let bracketMatched = false;
    for (const item of bracketMatches) {
      if (char === item.value) {
        bracketMatched = true;

        tokens.push({
          type: item.type,
          value: item.value,
          offset: current,
          lineNumber,
          column,
        });

        column++;
        current++;
        break;
      }
    }

    if (bracketMatched) continue;

    const isComment = char === codes.comment;
    const isAnnotation = char === codes.annotation;
    if (isComment || isAnnotation) {
      const commentColumn = column;
      const commentOffset = current;
      while (char !== codes.newline && char !== codes.carriage) {
        str += char;
        char = input[++current];
        column++;
      }

      tokens.push({
        type: isComment ? "comment" : "annotation",
        value: str.slice(1),
        offset: commentOffset,
        column: commentColumn,
        lineNumber,
      });

      str = "";
      continue;
    }

    if (isVaildChar(char)) {
      const charOffset = current;
      const charColumn = column;
      while (isVaildChar(char)) {
        str += char;
        char = input[++current];
        column++;
      }

      tokens.push({
        type: "string",
        value: str,
        offset: charOffset,
        column: charColumn,
        lineNumber,
      });

      str = "";
      continue;
    }

    return [
      {
        type: "error",
        value: char,
        offset: current,
        lineNumber,
        column,
      },
    ];
  }

  return tokens;
}

const stringToBaseType: Record<string, any> = {
  String: "#s",
  Boolean: "#b",
  Int: "#i",
  Float: "#f",
  Any: "#a",
};

export function tokensToPropTypes(tokens: ReturnType<typeof tokenizer>) {
  const types: Record<string, any> = {};
  const stack: any[] = [];

  function isArray(pos: number) {
    let isArray = false;
    if (
      tokens[pos] &&
      tokens[pos].value === "[" &&
      tokens[pos + 1] &&
      tokens[pos + 1].value === "]"
    ) {
      isArray = true;
    }

    return isArray ? 1 : undefined;
  }

  function getComment(pos: number) {
    let comments: string[] = [];
    while (pos--) {
      const token = tokens[pos];
      if (!token) break;
      if (token.type === "annotation") continue;
      if (token.type === "comment") {
        comments.unshift(token.value);
        continue;
      }
      break;
    }

    return comments.length ? comments.join("\n") : undefined;
  }

  function parseAnnotation(pos: number) {
    const meta: {
      // default
      d?: string;
      async?: boolean;
    } = {};

    while (pos--) {
      const token = tokens[pos];

      if (!token) break;

      if (token.type === "comment") continue;
      if (token.type === "annotation") {
        const chunks = token.value.split(" ");
        if (chunks[0] === "default") meta.d = chunks.slice(1).join(" ");
        if (chunks[0] === "async") meta.async = true;
        continue;
      }
      break;
    }

    return meta;
  }

  let current = 0;
  const len = tokens.length;
  while (current < len) {
    const token = tokens[current];

    if (token.value === "{") {
      const prevToken = tokens[current - 1];
      if (prevToken.value === ":") {
        // field block
        const fieldNameToken = tokens[current - 2];

        const meta = parseAnnotation(current - 2);
        const comment = getComment(current - 2);
        const fieldItem = { t: {}, c: comment, ...meta };
        const parent = stack[stack.length - 1];
        parent.t[fieldNameToken.value] = fieldItem;
        stack.push(fieldItem);
      } else {
        // type block
        if (tokens[current - 2].value !== "type") {
          throw new Error(`Line ${token.lineNumber}: fail to parse`);
        }

        const typeNameToken = tokens[current - 1];

        const typeItem: Record<string, any> = { t: {} };

        types[typeNameToken.value] = typeItem.t;
        stack.push(typeItem);
      }
      current++;
      continue;
    }

    if (token.value === "}") {
      const parent = stack.pop();
      if (stack.length) {
        parent.a = isArray(current + 1);
      }
      current++;
      continue;
    }

    if (token.value === ":") {
      const typeToken = tokens[current + 1];
      if (typeToken.value === "{") {
        current++;
        continue;
      }

      const fieldNameToken = tokens[current - 1];
      const parent = stack[stack.length - 1];

      const a = isArray(current + 2);
      const comment = getComment(current - 1);
      const meta = parseAnnotation(current - 1);

      parent.t[fieldNameToken.value] = {
        t: stringToBaseType[typeToken.value] || typeToken.value,
        a,
        c: comment,
        ...meta,
      };

      current++;
      continue;
    }

    current++;
  }

  return types;
}

export function parse(content: string) {
  const tokens = tokenizer(content);
  return tokensToPropTypes(tokens);
}

const schema = `
type Attrs {
  #hihi
  @default terry
  name: String
  # aage
  age: Int
  @h
  height: Float
}

type Events {
  # heheasljfsef
  # ashefsef
  # asefse
  @default dd ss
  d: Any
  e: String
}

type Slots {
  user: User
  us: User[]
  s: {
    a: {
      r: {
        e: {
          @s
          a: Stt
          # basefss
          # haihih
          o: {
            b: String[]
          }[]
        }
      }
    }
  }[]
}
type Methods {
  @async
  open: {
    args: {
      pos: String
    }
    result: {
      ok: Boolean
    }
  }
}
`;

// const tokens = tokenizer(schema);

// console.log(JSON.stringify(tokensToPropTypes(tokens), null, 2));
