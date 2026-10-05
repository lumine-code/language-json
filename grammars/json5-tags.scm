; Object keys, including JSON5's unquoted form. Keys inside arrays stay out.
(member
  name: [(identifier) (string)] @name
  (#is-not? test.descendantOfType "array")
  (#set! symbol.strip "^['\"]|['\"]$")
  (#set! symbol.prependSymbolForNode parent.parent.previousNamedSibling)
  (#set! symbol.joiner ".")) @definition.property
