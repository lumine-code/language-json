const path = require("node:path");

describe("language-json conservative indentation", () => {
  let editor;

  beforeEach(async () => {
    const pack = await lumine.packages.activatePackage(path.resolve(__dirname, ".."));
    for (const grammar of pack.grammars) {
      if (grammar.queryPaths?.indentsQuery) await grammar.getQuery("indentsQuery");
    }
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.json5"));
    editor.update({ tabLength: 2, softTabs: true });
  });

  afterEach(() => editor?.destroy());

  async function setText(source) {
    editor.setText(source);
    expect(await editor.whenGrammarSettled()).toBe(true);
  }

  async function enter(source, expected, row = 0) {
    await setText(source);
    editor.setCursorBufferPosition([row, Infinity]);
    editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(row + 1))
      .withContext(source)
      .toBe(" ".repeat(expected));
    expect(editor.getCursorBufferPosition().column).withContext(source).toBe(expected);
  }

  it("gives JSON5 the same delimiter behavior as JSON and JSONC", async () => {
    for (const scope of ["source.json", "source.json.jsonc", "source.json5"]) {
      const grammar = lumine.grammars.grammarForScopeName(scope);
      expect(grammar).withContext(scope).toBeDefined();
      editor.setGrammar(grammar);
      for (const source of ["{", "["]) await enter(source, 2);
      for (const source of ['{"text":"{"}', "[1, 2]", "// {"]) await enter(source, 0);
    }
  });

  it("dedents a JSON5 closing delimiter typed after Enter", async () => {
    await enter("{", 2);
    editor.insertText("}", { autoIndent: true, autoDecreaseIndent: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(1)).toBe("}");
  });

  it("preserves whitespace inside multiline literals and comments when reindenting", async () => {
    const source = "{\n  /* head\n        aligned\n raw */\n  value: 1\n}";
    await setText(source);
    const before = editor.getText().split("\n");
    await editor.autoIndentBufferRows(0, editor.getLastBufferRow());
    for (const row of [2, 3]) {
      expect(editor.lineTextForBufferRow(row)).withContext(String(row)).toBe(before[row]);
    }
  });
});
