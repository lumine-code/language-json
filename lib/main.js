const ROOT_SCOPES = ["source.json", "source.json.jsonc", "source.jupyter"];

exports.consumeHyperlinkInjection = (hyperlink) => {
  for (let rootScope of ROOT_SCOPES) {
    hyperlink.addInjectionPoint(rootScope, {
      types: ["comment", "string_content"],
    });
  }
  hyperlink.addInjectionPoint("source.json5", { types: ["comment", "string"] });
};

exports.consumeTodoInjection = (todo) => {
  for (let rootScope of ROOT_SCOPES) {
    todo.addInjectionPoint(rootScope, { types: ["comment"] });
  }
  todo.addInjectionPoint("source.json5", { types: ["comment"] });
};
