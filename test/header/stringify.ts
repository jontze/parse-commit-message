import { stringifyHeader } from "../../src/header.js";

describe("Stringify Header", () => {
  it("should return string with scope", () => {
    const header = { type: "fix", scope: "huh", subject: "yeah yeah" };
    const result = stringifyHeader(header);

    expect(result).toStrictEqual("fix(huh): yeah yeah");
  });

  it("should return string without scope", () => {
    const header = { type: "fix", subject: "yeah yeah" };
    const result = stringifyHeader(header);

    expect(result).toStrictEqual("fix: yeah yeah");
  });

  it("should throw when {value} and not valid conventional commit header", () => {
    expect(() =>
      stringifyHeader({
        value: "foo bar qux",
      }),
    ).toThrow(TypeError);
  });
});
