(string) @string.quoted.double.json5
(identifier) @constant.other.key.json5
(number) @constant.numeric.json5
(null) @constant.language.null.json5
[(true) (false)] @constant.language.boolean.json5
(comment) @comment.line.double-slash.json5

((comment) @comment.block.json5
  (#match? @comment.block.json5 "^/\\*"))
((comment) @punctuation.definition.comment.json5
  (#set! adjust.startAndEndAroundFirstMatchOf "^(?://|/\\*)"))
