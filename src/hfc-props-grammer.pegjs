{
  function buildList(head, tail, index) {
    return [head].concat(extractList(tail, index));
  }

  function extractList(list, index) {
    return list.map(function(element) { return element[index]; });
  }

  function optionalList(value) {
    return value !== null ? value : [];
  }
}

schema = WS body:declarations? WS
{ return { kind: "schema", declarations: optionalList(body) }; }

declarations = head:declaration tail:(WS declaration)*
{ return buildList(head, tail, 1); }

declaration = model_declaration / comment_block

model_declaration = kind:("model") __ name:type_name __ block:model_block
{ return { kind, name, members: block.members, location: location() }; }

model_block = "{" WS members:model_declaration_members? WS "}"
{ return { kind: "modelBlock", members: optionalList(members) } }

model_declaration_members = head:model_declaration_member tail:(WS model_declaration_member)*
{ return buildList(head, tail, 1); }

model_declaration_member = field_declaration

// Field Type

field_declaration = comment:comment_block? WS? name:name __ ":" __ type:field_type __ list:"[]"? __ attributes:field_attributes? __ "\n"
{ return { kind: "field", name, type, attributes: optionalList(attributes), list: !!list, comment, location: location() }; }

field_type = base_type / model_block

base_type =  name:type_name
{ return { kind: "typeId", name }; }

// Attributes

field_attribute = "@" __ name:identifier __ args:arguments_list?
{ return { kind: "fieldAttribute", name, args: optionalList(args), location: location() }; }

field_attributes = head:field_attribute tail:(__ field_attribute)*
{ return buildList(head, tail, 1); }

// Arguments

arguments_list = "(" __ args:arguments? __ ","? __ ")"
{ return optionalList(args); }

arguments = head:argument __ tail:("," __ argument)*
{ return buildList(head, tail, 2); }

argument = named_argument / expression

named_argument = name:name __ ":" __ expression:expression
{ return { kind: "namedArgument", name, expression }; }

// Comments

comment_block = head:comment tail:(WS comment)*
{ return { kind: "commentBlock", comments: buildList(head, tail, 1) }; }

comment = "//" __ text:doc_content
{ return { kind: "comment", text, location: location() }; }

doc_content = (!EOL .)*
{ return text(); }

// Shared building blocks

name = id:identifier
{ return { kind: "name", value: id, location: location() }; }

type_name = head:[A-Z] tail:[0-9a-z]i*
{ return { kind: "name", value: head + tail.join(""), location: location() }; }

path = head:identifier __ tail:("." __ identifier)*
{ return { kind: "path", value: buildList(head, tail, 2), location: location() }; }

identifier = head:[a-z]i tail:[0-9a-z]i*
{ return head + tail.join(""); }

// Expressions & Functions

function_call = path:path __ args:arguments_list
{ return { kind: "functionCall", path, args }; }

array_expression = "[" __ items:expression_list? __ "]"
{ return { kind: "array", items: optionalList(items) }; }

expression_list = head:expression __ tail:("," __ expression)*
{ return buildList(head, tail, 2); }

expression
  = function_call
  / array_expression
  / boolean_literal
  / numeric_literal
  / string_literal
  / path

// Literals / Values

boolean_literal = ("false" / "true")
{ return { kind: "literal", value: text() === "true" }; }

numeric_literal = "-"? [0-9]+ ("." [0-9]+)?
{ return { kind: "literal", value: parseInt(text()) }; }

string_literal = '"' value:string_content '"'
{ return { kind: "literal", value }; }

string_content = ("\\" . / [^\0-\x1F"])*
{ return text(); }

__ "horizontal whitespace" = [ \t]*

WS "any whitespace" = [ \t\n\r]*

EOL "end of line" = [\n\r]
