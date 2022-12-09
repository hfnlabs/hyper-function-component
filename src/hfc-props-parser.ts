import * as parser from '../hfc-props-peg.js'

type Model = Record<string, Field>
interface Field {
  type: 'String' | 'Int' | 'Float' | 'Boolean' | 'Any' | 'Ts' | string | Model
  def?: string
  list?: boolean
  enums?: string[]
  comments?: string[]
}

export type PropTypes = {
  Attr?: Model
  Event?: Model
  Slot?: Model
  Method?: Model
} & Record<string, Model>

export type PropNames = [string[], string[], string[], string[]]

export class HfcPropTypesParser {
  ast: any
  propTypes: PropTypes = {}
  public propNames: PropNames = [[], [], [], []]

  parse(text: string) {
    let ast
    try {
      ast = parser.parse(text)
    }
    catch (error: any) {
      return {
        errmsg: error.message as string,
        found: error.found as string,
        location: error.location as {
          start: { offset: number; line: number; column: number }
          end: { offset: number; line: number; column: number }
        },
      }
    }
    this.ast = ast
    this.parsePropTypes()
  }

  private parsePropTypes() {
    for (const decl of this.ast.declarations) {
      if (decl.kind !== 'model')
        continue

      const name = decl.name.value
      this.propTypes[name] = parseMembers(decl.members)

      if (name === 'Attr')
        this.propNames[0] = Object.keys(this.propTypes[name])
      else if (name === 'Event')
        this.propNames[1] = Object.keys(this.propTypes[name])
      else if (name === 'Slot')
        this.propNames[2] = Object.keys(this.propTypes[name])
      else if (name === 'Method')
        this.propNames[3] = Object.keys(this.propTypes[name])
    }
  }

  checkTypes() {
    const typePos: Record<string, { start: { offset: number; line: number; column: number }; end: { offset: number; line: number; column: number } }> = {}
    const unkonwType: Record<string, { start: { offset: number; line: number; column: number }; end: { offset: number; line: number; column: number } }> = {}

    const checkMemberType = (members: any) => {
      for (const member of members) {
        if (member.type.kind === 'typeId') {
          const type = member.type.name.value
          if (['String', 'Int', 'Float', 'Boolean', 'Any', 'Ts'].includes(type))
            continue
          if (this.propTypes[type])
            continue

          unkonwType[type] = {
            start: member.type.name.location.start,
            end: member.type.name.location.end,
          }
        }

        else { checkMemberType(member.type.members) }
      }
    }
    for (const decl of this.ast.declarations) {
      if (decl.kind !== 'model')
        continue

      typePos[decl.name.value] = {
        start: decl.location.start,
        end: decl.location.end,
      }

      checkMemberType(decl.members)
    }

    return { typePos, unkonwType }
  }
}

function parseMembers(members: any) {
  const obj: Record<string, Field> = {}

  for (const member of members) {
    let type
    if (member.type.kind === 'typeId')
      type = member.type.name.value

    else
      type = parseMembers(member.type.members)

    let enums = []
    let tsDef = ''
    for (const attr of member.attributes) {
      if (attr.name === 'enum' && (type === 'String' || type === 'Int' || type === 'Float'))
        enums = attr.args.map((v: any) => v.value)
      else if (attr.name === 'def' && type === 'Ts')
        tsDef = attr.args[0].value
    }

    obj[member.name.value] = {
      type,
      def: tsDef || undefined,
      list: member.list ? true : undefined,
      enums: enums.length ? enums : undefined,
      comments: member.comment ? member.comment.comments.map((c: any) => c.text) : undefined,
    }
  }

  return obj
}
