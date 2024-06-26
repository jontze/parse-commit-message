import { isNonEmptyString } from "./utils.js";
import { parseHeader, stringifyHeader, validateHeader } from "./header.js";
import { Commit, CommitResult, SharedOptions } from "./types.js";

/**
 * Receives a full commit message `string` and parses it into an `Commit` object
 * and returns it.
 * Basically the same as [.parse](#parse), except that
 * it only can accept single string.
 *
 * _The `parse*` methods are not doing any checking and validation,
 * so you may want to pass the result to `validateCommit` or `checkCommit`,
 * or to `validateCommit` with `ret` option set to `true`._
 *
 * @example
 * import { parseCommit } from 'parse-commit-message';
 *
 * const commitObj = parseCommit('foo: bar qux\n\nokey dude');
 * console.log(commitObj);
 * // => {
 * //   header: { type: 'foo', scope: null, subject: 'bar qux' },
 * //   body: 'okey dude',
 * //   footer: null,
 * // }
 *
 * @name  .parseCommit
 * @param {string} commit a message like `'fix(foo): bar baz\n\nSome awesome body!'`
 * @param {object} options options to control the header regex and case sensitivity
 * @param {RegExp|string} options.headerRegex string regular expression or instance of RegExp
 * @param {boolean} options.caseSensitive whether or not to be case sensitive, defaults to `false`
 * @returns {Commit} a standard object like `{ header: Header, body?, footer? }`
 * @public
 */
export const parseCommit = (commit: string, options: SharedOptions): Commit => {
  if (!isNonEmptyString(commit)) {
    throw new TypeError(`expect \`commit\` to be non empty string`);
  }

  const header = parseHeader(commit, options);
  const [body = null, footer = null] = commit.split("\n\n").slice(1);

  return { header, body: body?.trim(), footer: footer?.trim() };
};

/**
 * Receives a `Commit` object, validates it using `validateCommit`,
 * builds a "commit" string and returns it. Method throws if problems found.
 * Basically the same as [.stringify](#stringify), except that
 * it only can accept single `Commit` object.
 *
 * @example
 * import { stringifyCommit } from 'parse-commit-message';
 *
 * const commitStr = stringifyCommit({
 *   header: { type: 'foo', subject: 'bar qux' },
 *   body: 'okey dude',
 * });
 * console.log(commitStr); // => 'foo: bar qux\n\nokey dude'
 *
 * @name  .stringifyCommit
 * @param {Commit} commit a `Commit` object like `{ header: Header, body?, footer? }`
 * @param {object} options options to control the header regex and case sensitivity
 * @param {RegExp|string} options.headerRegex string regular expression or instance of RegExp
 * @param {boolean} options.caseSensitive whether or not to be case sensitive, defaults to `false`
 * @returns {string} a commit nessage stirng like `'fix(foo): bar baz'`
 * @public
 */
export const stringifyCommit = (commit: Commit): string => {
  const result = validateCommit(commit);

  if (result.error) {
    throw result.error;
  }

  const header = stringifyHeader(result.value.header);
  const EOL = "\n";

  result.value.body = result.value.body ? EOL + EOL + result.value.body : "";
  result.value.footer = result.value.footer
    ? EOL + EOL + result.value.footer
    : "";

  return `${header}${result.value.body}${result.value.footer}`;
};

/**
 * Validates given `Commit` object and returns `CommitResult`.
 * Basically the same as [.validate](#validate), except that
 * it only can accept single `Commit` object.
 *
 * @example
 * import { validateCommit } from 'parse-commit-message';
 *
 * const commit = {
 *   header: { type: 'foo', subject: 'bar qux' },
 *   body: 'okey dude',
 * };
 *
 * const commitIsValid = validateCommit(commit);
 * console.log(commitIsValid); // => true
 *
 * const { value } = validateCommit(commit, true);
 * console.log(value);
 * // => {
 * //   header: { type: 'foo', scope: null, subject: 'bar qux' },
 * //   body: 'okey dude',
 * //   footer: null,
 * // }
 *
 * @name  .validateCommit
 * @param {Commit} commit a `Commit` like `{ header: Header, body?, footer? }`
 * @param {object} options options to control the header regex and case sensitivity
 * @param {RegExp|string} options.headerRegex string regular expression or instance of RegExp
 * @param {boolean} options.caseSensitive whether or not to be case sensitive, defaults to `false`
 * @returns {CommitResult} an object like `{ value: Array<Commit>, error: Error }`
 * @public
 */
export const validateCommit = (commit: Commit): CommitResult => {
  const result: CommitResult = {};

  try {
    result.value = checkCommit(commit);
  } catch (err) {
    return { error: err };
  }

  return result;
};

/**
 * Receives a `Commit` and checks if it is valid. Method throws if problems found.
 * Basically the same as [.check](#check), except that
 * it only can accept single `Commit` object.
 *
 * @example
 * import { checkCommit } from 'parse-commit-message';
 *
 * try {
 *   checkCommit({ header: { type: 'fix' } });
 * } catch(err) {
 *   console.log(err);
 *   // => TypeError: header.subject should be non empty string
 * }
 *
 * // throws because can accept only Commit objects
 * checkCommit('foo bar baz');
 * checkCommit(123);
 * checkCommit([{ header: { type: 'foo', subject: 'bar' } }]);
 *
 * @name  .checkCommit
 * @param {Commit} commit a `Commit` like `{ header: Header, body?, footer? }`
 * @param {object} options options to control the header regex and case sensitivity
 * @param {RegExp|string} options.headerRegex string regular expression or instance of RegExp
 * @param {boolean} options.caseSensitive whether or not to be case sensitive, defaults to `false`
 * @returns {Commit} returns the same as given if no problems, otherwise it will throw.
 */
export const checkCommit = (commit: Commit): Commit => {
  const { error, value: headerObj } = validateHeader(commit.header);
  if (error) {
    throw error;
  }
  if (headerObj == null) {
    throw new TypeError("Header in commit is undefined");
  }

  if (commit.body != null && typeof commit.body !== "string") {
    throw new TypeError("commit.body should be string when given");
  }

  if (commit.footer != null && typeof commit.footer !== "string") {
    throw new TypeError("commit.footer should be string when given");
  }

  return { body: null, footer: null, ...commit, header: headerObj };
};
