import { checkHeader } from "../../src/header.js";

describe("Check Header", () => {
  it("should throw if header tyoe is empty string", () => {
    expect(() => checkHeader({ type: "", subject: "foo bar" })).toThrow(
      /type should be non empty string/,
    );
  });

  it("should throw if header subject is empty string", () => {
    expect(() => checkHeader({ type: "fix", subject: "" })).toThrow(
      /subject should be non empty string/,
    );
  });

  it("should header.scope be `null` when explicitly null given", () => {
    const result = checkHeader({ type: "fix", subject: "ss", scope: null });
    expect(result).toMatchObject({ type: "fix", subject: "ss", scope: null });
  });

  it("should header.scope be `null` when not given", () => {
    const result = checkHeader({ type: "aaa", subject: "quxie bar" });
    expect(result).toMatchObject({
      type: "aaa",
      subject: "quxie bar",
    });
  });

  it("should check header without scope correctly", () => {
    const result = checkHeader({
      type: "fix",
      subject: "bar qux",
    });

    expect(result).toMatchObject({
      type: "fix",
      subject: "bar qux",
    });
  });

  it("should check header with scope correctly", () => {
    const result = checkHeader({
      type: "fix",
      scope: "huh",
      subject: "yeah yeah",
    });

    expect(result).toMatchObject({
      type: "fix",
      scope: "huh",
      subject: "yeah yeah",
    });
  });
});
