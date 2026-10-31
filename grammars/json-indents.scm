; Existing literal and comment contents are user data, including whitespace.
([(string) (comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

["{" "["] @indent

["}" "]"] @dedent
