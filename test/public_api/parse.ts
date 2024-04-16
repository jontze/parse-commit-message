import { parse } from "../../src/index.js";

describe("Parse Commit", () => {
  describe("wih commit string", () => {
    it("should parse", () => {
      const commitMessage = `feat(test): awesome yeah\n\nAwesome body!\nresolves #123\n\nSigned-off-by: And Footer <abc@exam.pl>`;

      const res = parse(commitMessage);

      expect(res).toEqual([
        {
          header: { type: "feat", scope: "test", subject: "awesome yeah" },
          body: `Awesome body!
resolves #123`,
          footer: "Signed-off-by: And Footer <abc@exam.pl>",
        },
      ]);
    });

    it("should parse without scope", () => {
      const commitMessage = `feat: awesome yeah\n\nAwesome body!\nresolves #123\n\nSigned-off-by: And Footer <abc@exam.pl>`;

      const res = parse(commitMessage);

      expect(res).toEqual([
        {
          header: { type: "feat", subject: "awesome yeah", scope: null },
          body: `Awesome body!
resolves #123`,
          footer: "Signed-off-by: And Footer <abc@exam.pl>",
        },
      ]);
    });

    it("should parse without body and footer", () => {
      const commitMessage = `feat: awesome yeah`;

      const res = parse(commitMessage);

      expect(res).toEqual([
        {
          header: { type: "feat", subject: "awesome yeah", scope: null },
          body: undefined,
          footer: undefined,
        },
      ]);
    });

    it("should throw on invalid commit header", () => {
      const commitMessage = "Merge Something and Commit it";

      expect(() => parse(commitMessage)).toThrow(TypeError);
      expect(() => parse(commitMessage)).toThrow(
        /<type>\[optional scope]: <description>/,
      );
    });
  });

  describe("with commit object", () => {
    it("should parse", () => {
      const commitMessage = {
        header: { type: "fix", subject: "Barry White" },
        body: "okey dude",
        foo: "possible",
      };

      const res = parse(commitMessage);

      expect(res).toEqual([
        {
          header: { type: "fix", subject: "Barry White" },
          body: "okey dude",
          foo: "possible",
        },
      ]);
    });
  });

  describe("with commit object array", () => {
    it("should parse", () => {
      const commits = [
        {
          header: { type: "fix", subject: "Barry White" },
          body: "okey dude",
          foo: "possible",
        },
        {
          header: { type: "fix", subject: "Barry White" },
          body: "okey dude",
          foo: "possible",
        },
      ];

      const res = parse(commits);

      expect(res).toEqual([
        {
          header: { type: "fix", subject: "Barry White" },
          body: "okey dude",
          foo: "possible",
        },
        {
          header: { type: "fix", subject: "Barry White" },
          body: "okey dude",
          foo: "possible",
        },
      ]);
    });
  });
});
