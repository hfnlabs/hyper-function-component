/* eslint no-console: "off" */
import { describe, expect, it } from 'vitest'
import { HfcPropTypesParser } from './hfc-props-parser'

describe('generate ast', () => {
  it('single model', () => {
    const parser = new HfcPropTypesParser()
    parser.parse(`\
model M {}
`)

    expect(parser.ast.declarations.length).toBe(1)
    expect(parser.ast.declarations[0].kind).toBe('model')
    expect(parser.ast.declarations[0].name.value).toBe('M')
  })

  it('basic types', () => {
    const parser = new HfcPropTypesParser()
    parser.parse(`\
model M {
  s: String
  i: Int
  f: Float
  b: Boolean
  a: Any

  sr: String[]
  ir: Int[]
  fr: Float[]
  br: Boolean[]
  ar: Any[]

  u: User
  ur: User[]

  o: {
    s: String
  }
  or: {
    s: String
  }[]

  t: Ts @def("HTMLDivElement")
}

model User {
  age: Int
}
`)
    expect(parser.ast.declarations[0].members.length).toBe(15)
    expect(parser.ast.declarations[0].members[0].name.value).toBe('s')
    expect(parser.ast.declarations[0].members[0].type.name.value).toBe('String')
    expect(parser.ast.declarations[0].members[1].name.value).toBe('i')
    expect(parser.ast.declarations[0].members[1].type.name.value).toBe('Int')
    expect(parser.ast.declarations[0].members[2].name.value).toBe('f')
    expect(parser.ast.declarations[0].members[2].type.name.value).toBe('Float')
    expect(parser.ast.declarations[0].members[3].name.value).toBe('b')
    expect(parser.ast.declarations[0].members[3].type.name.value).toBe('Boolean')
    expect(parser.ast.declarations[0].members[4].name.value).toBe('a')
    expect(parser.ast.declarations[0].members[4].type.name.value).toBe('Any')

    expect(parser.ast.declarations[0].members[5].name.value).toBe('sr')
    expect(parser.ast.declarations[0].members[5].list).toBe(true)
    expect(parser.ast.declarations[0].members[5].type.name.value).toBe('String')
    expect(parser.ast.declarations[0].members[6].name.value).toBe('ir')
    expect(parser.ast.declarations[0].members[6].list).toBe(true)
    expect(parser.ast.declarations[0].members[6].type.name.value).toBe('Int')
    expect(parser.ast.declarations[0].members[7].name.value).toBe('fr')
    expect(parser.ast.declarations[0].members[7].list).toBe(true)
    expect(parser.ast.declarations[0].members[7].type.name.value).toBe('Float')
    expect(parser.ast.declarations[0].members[8].name.value).toBe('br')
    expect(parser.ast.declarations[0].members[8].list).toBe(true)
    expect(parser.ast.declarations[0].members[8].type.name.value).toBe('Boolean')
    expect(parser.ast.declarations[0].members[9].name.value).toBe('ar')
    expect(parser.ast.declarations[0].members[9].list).toBe(true)
    expect(parser.ast.declarations[0].members[9].type.name.value).toBe('Any')

    expect(parser.ast.declarations[0].members[10].name.value).toBe('u')
    expect(parser.ast.declarations[0].members[10].type.name.value).toBe('User')
    expect(parser.ast.declarations[0].members[11].name.value).toBe('ur')
    expect(parser.ast.declarations[0].members[11].list).toBe(true)
    expect(parser.ast.declarations[0].members[11].type.name.value).toBe('User')

    expect(parser.ast.declarations[0].members[12].name.value).toBe('o')
    expect(parser.ast.declarations[0].members[12].type.kind).toBe('modelBlock')
    expect(parser.ast.declarations[0].members[13].name.value).toBe('or')
    expect(parser.ast.declarations[0].members[13].list).toBe(true)
    expect(parser.ast.declarations[0].members[13].type.kind).toBe('modelBlock')

    expect(parser.ast.declarations[0].members[14].name.value).toBe('t')
    expect(parser.ast.declarations[0].members[14].type.name.value).toBe('Ts')
    expect(parser.ast.declarations[0].members[14].attributes[0].name).toBe('def')
    expect(parser.ast.declarations[0].members[14].attributes[0].args[0].value).toBe('HTMLDivElement')
  })

  it('model field with attribute', () => {
    const parser = new HfcPropTypesParser()
    parser.parse(`\
model M {
  s: String @enum("a", "b") @default("a")
  i: Int @enum(1, 2) @default(1)
}`)

    expect(parser.ast.declarations[0].members[0].attributes[0].name).toBe('enum')
    expect(parser.ast.declarations[0].members[0].attributes[0].args[0].value).toBe('a')
    expect(parser.ast.declarations[0].members[0].attributes[0].args[1].value).toBe('b')

    expect(parser.ast.declarations[0].members[0].attributes[1].name).toBe('default')
    expect(parser.ast.declarations[0].members[0].attributes[1].args[0].value).toBe('a')

    expect(parser.ast.declarations[0].members[1].attributes[0].name).toBe('enum')
    expect(parser.ast.declarations[0].members[1].attributes[0].args[0].value).toBe(1)
    expect(parser.ast.declarations[0].members[1].attributes[0].args[1].value).toBe(2)

    expect(parser.ast.declarations[0].members[1].attributes[1].name).toBe('default')
    expect(parser.ast.declarations[0].members[1].attributes[1].args[0].value).toBe(1)
  })

  it('model field with ref type', () => {
    const parser = new HfcPropTypesParser()
    parser.parse(`\
model M {
  user: User
}

model User {
  age: String
}`)
    expect(parser.ast.declarations[0].members[0].type.kind).toBe('typeId')
    expect(parser.ast.declarations[0].members[0].type.name.value).toBe('User')

    expect(parser.ast.declarations[1].name.value).toBe('User')
    expect(parser.ast.declarations[1].members[0].name.value).toBe('age')
  })

  it('comment', () => {
    const parser = new HfcPropTypesParser()
    parser.parse(`\
// c1
// c11
model M {
  // c2
  // c22
  s: String

  // i1
  // i2
  i: Int
}`)

    expect(parser.ast.declarations[0].kind).toBe('commentBlock')
    expect(parser.ast.declarations[0].comments[0].text).toBe('c1')
    expect(parser.ast.declarations[0].comments[1].text).toBe('c11')

    expect(parser.ast.declarations[1].members[0].comment.kind).toBe('commentBlock')
    expect(parser.ast.declarations[1].members[0].comment.comments[0].text).toBe('c2')
    expect(parser.ast.declarations[1].members[0].comment.comments[1].text).toBe('c22')

    expect(parser.ast.declarations[1].members[1].comment.kind).toBe('commentBlock')
    expect(parser.ast.declarations[1].members[1].comment.comments[0].text).toBe('i1')
    expect(parser.ast.declarations[1].members[1].comment.comments[1].text).toBe('i2')
  })

  it('nest model', () => {
    const parser = new HfcPropTypesParser()
    parser.parse(`\
model M {
  user: {
    age: Int
  }
}`)

    expect(parser.ast.declarations[0].members[0].type.members[0].name.value).toBe('age')
    expect(parser.ast.declarations[0].members[0].type.members[0].type.name.value).toBe('Int')
  })

  it('syntax error', () => {
    const parser = new HfcPropTypesParser()
    const err = parser.parse('mm')

    expect(err?.found).toBe('m')
  })
})

describe('get info from ast', () => {
  it('get prop names', () => {
    const parser = new HfcPropTypesParser()
    parser.parse(`\
model Attr {
  s: String
  i: Int
}

model Event {
  onClick: {}
  onTouch: {}
}

model Slot {
  header: {}
  footer: {}
}

model Method {
  open: {}
}
    `)

    const names = parser.propNames
    expect(JSON.stringify(names)).eq(JSON.stringify([
      ['s', 'i'],
      ['onClick', 'onTouch'],
      ['header', 'footer'],
      ['open'],
    ]))
  })

  it('get prop types', async () => {
    const parser = new HfcPropTypesParser()
    parser.parse(`\
model Attr {
  // i
  i: Int @enum(1, 2)
  // s
  // s1
  sr: String[]
  o: {
    // is
    s: String @enum("a", "b")
    o1: {
      ss: String
      o2: {
        sss: String
      }
    }
  }
  or: {
    s: String
    or1: {
      ss: String
    }[]
  }[]

  u: User
  ur: User[]

  t: Ts @def("HTMLDivElement")
}

model User {
  age: Int
}
`)

    const types = parser.propTypes
    expect(JSON.stringify(types)).toBe(JSON.stringify({
      Attr: {
        i: {
          type: 'Int',
          enums: [
            1,
            2,
          ],
          comments: [
            'i',
          ],
        },
        sr: {
          type: 'String',
          list: true,
          comments: [
            's',
            's1',
          ],
        },
        o: {
          type: {
            s: {
              type: 'String',
              enums: [
                'a',
                'b',
              ],
              comments: [
                'is',
              ],
            },
            o1: {
              type: {
                ss: {
                  type: 'String',
                },
                o2: {
                  type: {
                    sss: {
                      type: 'String',
                    },
                  },
                },
              },
            },
          },
        },
        or: {
          type: {
            s: {
              type: 'String',
            },
            or1: {
              type: {
                ss: {
                  type: 'String',
                },
              },
              list: true,
            },
          },
          list: true,
        },
        u: {
          type: 'User',
        },
        ur: {
          type: 'User',
          list: true,
        },
        t: {
          type: 'Ts',
          def: 'HTMLDivElement',
        },
      },
      User: {
        age: {
          type: 'Int',
        },
      },
    }))
  })
})

describe('check types', () => {
  it('check types', () => {
    const parser = new HfcPropTypesParser()
    parser.parse(`\
model Attr {
  s: Str
  i: Int
  o: {
    b: Bool
  }
  u: Userr
  uu: User
}

model User {
  age: Int
}`)

    const { unkonwType, typePos } = parser.checkTypes()
    expect(JSON.stringify(unkonwType)).toBe(JSON.stringify({
      Str: {
        start: { offset: 18, line: 2, column: 6 },
        end: { offset: 21, line: 2, column: 9 },
      },
      Bool: {
        start: { offset: 45, line: 5, column: 8 },
        end: { offset: 49, line: 5, column: 12 },
      },
      Userr: {
        start: { offset: 59, line: 7, column: 6 },
        end: { offset: 64, line: 7, column: 11 },
      },
    }))

    expect(JSON.stringify(typePos)).toBe(JSON.stringify({
      Attr: {
        start: { offset: 0, line: 1, column: 1 },
        end: { offset: 77, line: 9, column: 2 },
      },
      User: {
        start: { offset: 79, line: 11, column: 1 },
        end: { offset: 104, line: 13, column: 2 },
      },
    }))
  })
})
