import { validateHeader } from "../../src/header";

describe("Validate Header", () => {
  it("should return { error }", () => {
    const res = validateHeader({ type: "fix", subject: "" });

    expect(res.error).toBeTruthy();
    expect(res.value).toBeFalsy();
    expect((res.error as Error)?.message).toMatch(
      /header\.subject should be non empty string/,
    );
  });

  it("should return { value }", () => {
    const result = validateHeader({ type: "fix", subject: "bar qux" });
    expect(result).toMatchObject({
      value: { type: "fix", subject: "bar qux" },
    });
  });
});
