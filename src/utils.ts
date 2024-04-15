import { Commit, HeaderType, SharedOptions } from "./types.js";

export const errorMsg: string = `parse-commit-message: expect \`commit\` to follow:
<type>[optional scope]: <description>

[optional body]

[optional footer]`;

export const isNonEmptyString = (str: any): str is string => {
  return typeof str === "string" && str.length > 0;
};

export function isHeaderType(obj: any): obj is HeaderType {
  if (typeof obj.type !== "string" || typeof obj.subject !== "string") {
    return false;
  }
  // 'scope' is optional, but if it exists, it must be either a string or null
  if (
    obj.scope !== undefined &&
    obj.scope !== null &&
    typeof obj.scope !== "string"
  ) {
    return false;
  }
  // If all checks are passed, the object conforms to HeaderType
  return true;
}

/**
 * When `options.headerRegex` is passed,
 * it should have 4 capturing groups: type, scope, bang, subject!
 *
 * @param {string} val
 * @param {Options} options options to control the header regex and case sensitivity
 */
export const stringToHeader = (
  val: string,
  options: SharedOptions,
): { type: string; scope: string | null; subject: string } => {
  const opts: SharedOptions = { caseSensitive: false, ...options };

  const defaultRegex: RegExp = opts.caseSensitive
    ? /^(\w+)(?:\((.+)\))?(!)?: (.+)/
    : /^(\w+)(?:\((.+)\))?(!)?: (.+)/i;

  let regex: RegExp | null = null;

  if (opts.headerRegex && typeof opts.headerRegex === "string") {
    regex = opts.caseSensitive
      ? new RegExp(opts.headerRegex)
      : new RegExp(opts.headerRegex, "i");
  }

  if (opts.headerRegex instanceof RegExp) {
    regex = opts.headerRegex;
  }

  regex = regex || defaultRegex;

  if (!regex.test(val)) {
    throw new TypeError(errorMsg);
  }

  const matches = regex.exec(val)?.slice(1);

  if (!matches) {
    throw new Error(errorMsg);
  }
  const [type, scope = null, bang = "", subject] = matches;

  return {
    type: type + bang,
    scope,
    subject,
  };
};

export const normalizeCommit = (
  commit: Commit,
  options: SharedOptions,
): Commit => {
  const { header } = commit;
  if (header && typeof header === "object" && "value" in header) {
    return { ...commit, header: stringToHeader(header.value, options) };
  }
  return commit;
};

export const toArray = <T>(val: T | T[]): T[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
};

export const isBreakingChange = (commit: Commit): boolean => {
  const re = /^BREAKING\s+CHANGES?:\s+/;
  if (!isHeaderType(commit.header)) {
    throw new Error(`Unsupported header in commit: ${commit.header.value}`);
  }
  return (
    commit.header.type.endsWith("!") ||
    /break|breaking|major/i.test(commit.header.type) ||
    re.test(commit.header.subject) ||
    re.test(commit.body ?? "") ||
    re.test(commit.footer ?? "")
  );
};
