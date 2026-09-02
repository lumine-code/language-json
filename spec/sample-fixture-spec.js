const path = require("path");

// The fixture beside this file is a plain sample of the language — the file to
// open when you want to look at the highlighting rather than assert on it. This
// spec is only what stops the sample quietly rotting: the grammar still claims
// it, and it still tokenizes.

describe("JSON sample fixtures", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-json");
  });

  it("parses sample.json without error", async () => {
    const editor = await lumine.workspace.open(path.join(__dirname, "fixtures", "sample.json"));
    const languageMode = editor.getBuffer().getLanguageMode();
    await languageMode.ready;

    expect(editor.getGrammar().scopeName).toBe("source.json");
    expect(languageMode.tree.rootNode.hasError).toBe(false);
  });

  it("parses sample.jsonc without error", async () => {
    const editor = await lumine.workspace.open(path.join(__dirname, "fixtures", "sample.jsonc"));
    const languageMode = editor.getBuffer().getLanguageMode();
    await languageMode.ready;

    expect(editor.getGrammar().scopeName).toBe("source.json.jsonc");
    expect(languageMode.tree.rootNode.hasError).toBe(false);
  });

  it("parses sample.json5 without error", async () => {
    const editor = await lumine.workspace.open(path.join(__dirname, "fixtures", "sample.json5"));
    const languageMode = editor.getBuffer().getLanguageMode();
    await languageMode.ready;

    expect(editor.getGrammar().scopeName).toBe("source.json5");
    expect(languageMode.tree.rootNode.hasError).toBe(false);
    expect(editor.scopeDescriptorForBufferPosition([2, 2]).getScopesArray()).toContain(
      "constant.other.key.json5",
    );
  });
});
