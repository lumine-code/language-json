const path = require("node:path");

describe("json editing settings", () => {
  let editor;

  beforeEach(async () => {
    jasmine.useRealClock();
    const pack = await lumine.packages.activatePackage(path.resolve(__dirname, ".."));
    await pack.resourceLoadPromise;
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.json"));
    editor.update({ autoIndent: false });
    await editor.whenGrammarSettled();
  });

  afterEach(() => editor?.destroy());

  async function setText(text) {
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
  }

  it("uses JSON pairs for JSON, JSONC and raw notebook source", async () => {
    await lumine.packages.activatePackage("bracket-matcher");
    for (const scope of ["source.json", "source.json.jsonc", "source.jupyter"]) {
      editor.setGrammar(lumine.grammars.grammarForScopeName(scope));
      for (const [typed, expected] of [
        ["[", "[]"],
        ["{", "{}"],
        ['"', '""'],
        ["'", "'"],
        ["`", "`"],
        ["(", "("],
        ["“", "“"],
      ]) {
        await setText("");
        await editor.insertText(typed);
        await editor.whenGrammarSettled();
        expect(editor.getText())
          .withContext(scope + typed)
          .toBe(expected);
      }
    }
  });

  it("keeps JSON5 single-quoted strings without adding JavaScript-only syntax pairs", async () => {
    await lumine.packages.activatePackage("bracket-matcher");
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.json5"));
    for (const [typed, expected] of [
      ["'", "''"],
      ['"', '""'],
      ["[", "[]"],
      ["{", "{}"],
      ["(", "("],
      ["`", "`"],
    ]) {
      await setText("");
      await editor.insertText(typed);
      await editor.whenGrammarSettled();
      expect(editor.getText()).withContext(typed).toBe(expected);
    }
  });

  it("keeps explicit user pair overrides authoritative", async () => {
    await lumine.packages.activatePackage("bracket-matcher");
    lumine.config.set("bracket-matcher.autocompleteCharacters", ["''"], {
      scopeSelector: ".source.json",
    });
    try {
      await setText("");
      await editor.insertText("'");
      await editor.whenGrammarSettled();
      expect(editor.getText()).toBe("''");
    } finally {
      lumine.config.unset("bracket-matcher.autocompleteCharacters", {
        scopeSelector: ".source.json",
      });
    }
  });
});
