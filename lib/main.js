const ROOT_SCOPES = ["source.json", "source.json.jsonc", "source.jupyter"];

exports.consumeHyperlinkInjection = (hyperlink) => {
  const registrations = [];
  for (let rootScope of ROOT_SCOPES) {
    registrations.push(
      hyperlink.addInjectionPoint(rootScope, {
        types: ["comment", "string_content"],
      }),
    );
  }
  registrations.push(hyperlink.addInjectionPoint("source.json5", { types: ["comment", "string"] }));
  return {
    dispose() {
      for (const registration of registrations.splice(0)) registration.dispose();
    },
  };
};

exports.consumeTodoInjection = (todo) => {
  const registrations = [];
  for (let rootScope of ROOT_SCOPES) {
    registrations.push(todo.addInjectionPoint(rootScope, { types: ["comment"] }));
  }
  registrations.push(todo.addInjectionPoint("source.json5", { types: ["comment"] }));
  return {
    dispose() {
      for (const registration of registrations.splice(0)) registration.dispose();
    },
  };
};
