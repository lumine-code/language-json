const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

const HIGHLIGHTS_PATH = path.join(__dirname, "..", "grammars", "json-highlights.scm");

describe("modern JSON grammars", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-json");
  });

  it("names the commented JSON grammar JSONC", () => {
    const grammar = lumine.grammars.grammarForScopeName("source.json.jsonc");

    expect(grammar).toBeDefined();
    expect(grammar.name).toBe("JSONC");
  });

  it("owns Jupyter notebooks with a root-only Tree-sitter descriptor", async () => {
    const grammar = lumine.grammars.selectGrammar("analysis.ipynb", "");
    expect(grammar.name).toBe("Jupyter Notebook");
    expect(grammar.scopeName).toBe("source.jupyter");
    expect(grammar.constructor.name).toBe("TreeSitterGrammar");
    const descriptor = require("../grammars/jupyter.json");
    expect(Object.hasOwn(descriptor, "injectionRegex")).toBe(false);
    expect(Object.hasOwn(descriptor, "injectionNames")).toBe(false);

    const editor = await lumine.workspace.open("analysis.ipynb");
    editor.setText('{"cells": []}');
    await editor.getBuffer().getLanguageMode().ready;
    expect(editor.getBuffer().getLanguageMode().tree.rootNode.hasError).toBe(false);
  });

  it("uses the generic separator scope for object and array commas", async () => {
    const editor = await lumine.workspace.open("test.json");
    editor.setText('{"a": 1, "b": 2}\n[1, 2]');
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.json"));
    await editor.getBuffer().languageMode.ready;

    const objectCommaScopes = editor.scopeDescriptorForBufferPosition([0, 7]).getScopesArray();
    const arrayCommaScopes = editor.scopeDescriptorForBufferPosition([1, 2]).getScopesArray();

    expect(objectCommaScopes).toContain("punctuation.separator.comma.json");
    expect(objectCommaScopes).not.toContain("punctuation.separator.object.comma.json");
    expect(arrayCommaScopes).toContain("punctuation.separator.comma.json");
    expect(arrayCommaScopes).not.toContain("punctuation.separator.array.comma.json");
  });

  it("distinguishes both delimiters of an empty string", async () => {
    const editor = await lumine.workspace.open("empty-string.json");
    editor.setText('""');
    await editor.getBuffer().languageMode.ready;

    const opening = editor.scopeDescriptorForBufferPosition([0, 0]).getScopesArray();
    const closing = editor.scopeDescriptorForBufferPosition([0, 1]).getScopesArray();
    expect(opening).toContain("punctuation.definition.string.begin.json");
    expect(opening).not.toContain("punctuation.definition.string.end.json");
    expect(closing).toContain("punctuation.definition.string.end.json");
    expect(closing).not.toContain("punctuation.definition.string.begin.json");
  });

  it("highlights trailing commas as valid punctuation in JSONC", async () => {
    const editor = await lumine.workspace.open("test.jsonc");
    editor.setText('{"value": 1,}\n[1,]');
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.json.jsonc"));
    await editor.getBuffer().languageMode.ready;

    const objectCommaScopes = editor.scopeDescriptorForBufferPosition([0, 11]).getScopesArray();
    const arrayCommaScopes = editor.scopeDescriptorForBufferPosition([1, 2]).getScopesArray();

    expect(objectCommaScopes).toContain("punctuation.separator.comma.json");
    expect(objectCommaScopes).not.toContain("invalid.illegal.comma.json");
    expect(arrayCommaScopes).toContain("punctuation.separator.comma.json");
    expect(arrayCommaScopes).not.toContain("invalid.illegal.comma.json");
  });

  it("continues to mark trailing commas as invalid in strict JSON", async () => {
    const editor = await lumine.workspace.open("test.json");
    editor.setText('{"value": 1,}');
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.json"));
    await editor.getBuffer().languageMode.ready;

    const commaScopes = editor.scopeDescriptorForBufferPosition([0, 11]).getScopesArray();
    expect(commaScopes).toContain("invalid.illegal.comma.json");
  });

  it("keeps escapes local within a long soft-wrapped string", async () => {
    const querySource = fs.readFileSync(HIGHLIGHTS_PATH, "utf8");
    expect(querySource).not.toMatch(/\(string\s+\(escape_sequence\)/);
    expect(querySource).toContain("(#is? test.childOfType string)");

    const editor = await lumine.workspace.open("long-string.json");
    const escapeCount = 20000;
    const text = `"${"\\n".repeat(escapeCount)}"`;
    editor.setText(text);
    const languageMode = editor.getBuffer().languageMode;
    await languageMode.ready;
    expect(languageMode.tree.rootNode.hasError).toBe(false);

    const startColumn = 1 + escapeCount;
    expect(editor.scopeDescriptorForBufferPosition([0, startColumn]).getScopesArray()).toContain(
      "constant.character.escape.json",
    );
    const layer = languageMode.rootLanguageLayer;
    const captures = layer.queries.highlightsQuery.captures(layer.tree.rootNode, {
      startPosition: new Point(0, startColumn),
      endPosition: new Point(0, startColumn + 12),
    });
    const escapes = captures.filter(({ name }) => name === "constant.character.escape.json");
    expect(escapes.length).toBe(6);
    expect(
      escapes.every(
        ({ node }) =>
          node.startPosition.column >= startColumn && node.startPosition.column < startColumn + 12,
      ),
    ).toBe(true);
    editor.destroy();
  });
});
