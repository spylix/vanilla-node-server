const { processPath } = require("./getHandler");

test("returns path to index.html when passed a slash", () => {
  expect(processPath("/", "./static/")).toBe("./static/index.html");
});

test("returns path with .html extension", () => {
  expect(processPath("/index", "./static/index")).toBe("./static/index.html");
});

test("returns path with .html extension for not existing file", () => {
  expect(processPath("/file", "./static/file")).toBe("./static/file.html");
});

test("returns path without changes", () => {
  expect(processPath("/index.html", "./static/index.html")).toBe(
    "./static/index.html"
  );
});
