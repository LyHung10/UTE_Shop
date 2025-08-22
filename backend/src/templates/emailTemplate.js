import fs from "fs";
import handlebars from "handlebars";
import path from "path";

export function renderTemplate(templateName, variables = {}) {
  const filePath = path.join(process.cwd(), "src", "templates", `${templateName}.html`);
  const templateSource = fs.readFileSync(filePath, "utf8");
  const template = handlebars.compile(templateSource);
  return template(variables);
}
