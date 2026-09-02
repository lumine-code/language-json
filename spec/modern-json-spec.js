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
});
