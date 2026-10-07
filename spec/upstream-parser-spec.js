describe("JSON exponent parsing", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-json");
    editor = await lumine.workspace.open();
  });

  afterEach(() => editor?.destroy());

  for (const scope of ["source.json", "source.json.jsonc", "source.jupyter"]) {
    it(`parses positive and negative exponents in ${scope}`, async () => {
      editor.setGrammar(lumine.grammars.grammarForScopeName(scope));
      editor.setText("[1e10, 1e+10, 1E+10, 1e-10, 1.5e+10, -1.5E+10]");
      await editor.languageMode.ready;
      const root = editor.languageMode.tree.rootNode;
      expect(root.hasError).toBe(false);
      expect(root.descendantsOfType("number").length).toBe(6);
    });
  }
});
