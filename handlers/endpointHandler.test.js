const { sliceUrl } = require("./endpointHandler");

test("returns unchanged url", () => {
  expect(sliceUrl("/url")).toBe("/url");
});

test("returns url without question mark", () => {
  expect(sliceUrl("/url?query=test")).toBe("/url");
});

test("returns url without second slash", () => {
  expect(sliceUrl("/url/path")).toBe("/url");
});

test("returns url without second slash and question mark", () => {
  expect(sliceUrl("/url/path?query=test")).toBe("/url");
});
