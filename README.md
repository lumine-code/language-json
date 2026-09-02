# language-json

JSON language support.

## Features

- **Grammars**: provides Tree-sitter grammars built from [tree-sitter-json](https://github.com/tree-sitter/tree-sitter-json) and [tree-sitter-json5](https://github.com/Joakker/tree-sitter-json5).
- **Syntax highlighting**: full grammar coverage for JSON, JSONC, JSON5, and Jupyter notebook sources.
- **Comment tolerance**: comments are allowed in JSON files by default and can be disabled in settings.
- **Code folding**: collapse objects and arrays.

## Installation

To install `language-json` search for it in the Install pane of the Lumine settings, or run the command `lumine --install lumine-code/language-json`.

## Services

- `hyperlink.injection`: consumed to highlight URLs inside strings as clickable links.
- `todo.injection`: consumed to highlight `TODO`-style markers inside comments.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
