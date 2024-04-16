import { parseHeader } from "../../src/header.js";

describe("Parse Header", () => {
  it("should throw when invalid conventional commits", () => {
    expect(() => parseHeader("fix bar qux")).toThrow(Error);
    expect(() => parseHeader("fix bar qux")).toThrow(
      /<type>\[optional scope]: <description>/,
    );
  });

  it("should NOT throw when header is valid by conventional commits", () => {
    const one = parseHeader("fix: zzz qux");
    const two = parseHeader("fix(cli): aaaa qux");
    const res = parseHeader("fix(cli): qqqqq qux\n\nSome awesome body");

    expect(one && typeof one === "object").toBe(true);
    expect(two && typeof two === "object").toBe(true);
    expect(res && typeof res === "object").toBe(true);
  });

  it("should parse header string without scope", () => {
    const result = parseHeader("fix: bar qux");

    expect(result).toMatchObject({
      type: "fix",
      scope: null,
      subject: "bar qux",
    });
  });

  it("should parse header string with scope", () => {
    expect(parseHeader("fix(cli): bar qux")).toMatchObject({
      type: "fix",
      scope: "cli",
      subject: "bar qux",
    });
  });
});
