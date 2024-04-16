import { CommitResult, Header, HeaderType, SharedOptions } from "./types.js";
import { isHeaderType, isNonEmptyString, stringToHeader } from "./utils.js";

/**
 * Parses given `header` string into a Header object.
 * Basically the same as [.parse](#parse), except that
 * it only can accept a single string and returns a `Header` object.
 *
 * _The `parse*` methods are not doing any checking and validation,
 * so you may want to pass the result to `validateHeader` or `checkHeader`,
 * or to `validateHeader` with `ret` option set to `true`._
 *
 * @example
 * import { parseHeader } from 'parse-commit-message';
 *
 * const longCommitMsg = `fix: bar qux
 *
 * Awesome body!`;
 *
 * const headerObj = parseHeader(longCommitMsg);
 * console.log(headerObj);
 * // => { type: 'fix', scope: null, subject: 'bar qux' }
 *
 * @param header A header string like `'fix(foo): bar baz'`
 * @param options SharedOptions to control the header regex and case sensitivity
 * @returns A `Header` object like `{ type, scope?, subject }`
 */
export const parseHeader = (
  header: string,
  options: SharedOptions = {},
): Header => {
  if (!isNonEmptyString(header)) {
    throw new TypeError("expect `header` to be non empty string");
  }
  return stringToHeader(header.trim(), options);
};

/**
 * Receives a `header` object, validates it using `validateHeader`,
 * builds a "header" string and returns it. Method throws if problems found.
 * Basically the same as [.stringify](#stringify), except that
 * it only can accept a single `Header` object.
 *
 * @example
 * import { stringifyHeader } from 'parse-commit-message';
 *
 * const headerStr = stringifyHeader({ type: 'foo', subject: 'bar qux' });
 * console.log(headerStr); // => 'foo: bar qux'
 *
 * @param header A `Header` object like `{ type, scope?, subject }`
 * @param options SharedOptions to control the header regex and case sensitivity
 * @returns A header string like `'fix(foo): bar baz'`
 * @public
 */
export const stringifyHeader = (header: Header): string => {
  const res = validateHeader(header);

  if (res.error) {
    throw res.error;
  }

  if (res.value == null) {
    throw new TypeError("HeaderType is undefined");
  }

  const { type, scope, subject } = res.value;
  return `${type}${scope ? `(${scope})` : ""}: ${subject}`.trim();
};

/**
 * Validates given `header` object and returns `boolean`.
 * You may want to pass `ret` to return an object instead of throwing.
 * Basically the same as [.validate](#validate), except that
 * it only can accept a single `Header` object.
 *
 * @example
 * import { validateHeader } from 'parse-commit-message';
 *
 * const header = { type: 'foo', subject: 'bar qux' };
 *
 * const headerIsValid = validateHeader(header);
 * console.log(headerIsValid); // => true
 *
 * const { value } = validateHeader(header, true);
 * console.log(value);
 * // => {
 * //   header: { type: 'foo', scope: null, subject: 'bar qux' },
 * //   body: 'okey dude',
 * //   footer: null,
 * // }
 *
 * const { error } = validateHeader({
 *   type: 'bar'
 * }, true);
 *
 * console.log(error);
 * // => TypeError: header.subject should be non empty string
 *
 * @param header A `Header` object like `{ type, scope?, subject }`
 * @param options SharedOptions to control the header regex and case sensitivity
 * @returns An object like `{ value: Array<Header>, error: Error }`
 * @public
 */
export const validateHeader = (header: Header): CommitResult<HeaderType> => {
  const result: CommitResult<HeaderType> = {};

  try {
    result.value = checkHeader(header);
  } catch (err) {
    result.error = err as Error;
  }

  return result;
};

/**
 * Receives a `Header` and checks if it is valid.
 * Basically the same as [.check](#check), except that
 * it only can accept a single `Header` object.
 *
 * @example
 * import { checkHeader } from 'parse-commit-message';
 *
 * try {
 *   checkHeader({ type: 'fix' });
 * } catch(err) {
 *   console.log(err);
 *   // => TypeError: header.subject should be non empty string
 * }
 *
 * // throws because can accept only Header objects
 * checkHeader('foo bar baz');
 * checkHeader(123);
 * checkHeader([]);
 * checkHeader([{ type: 'foo', subject: 'bar' }]);
 *
 * @param header A `Header` object like `{ type, scope?, subject }`
 * @param options SharedOptions to control the header regex and case sensitivity
 * @returns The same as given if no problems, otherwise it will throw.
 */
export const checkHeader = (header: Header): HeaderType => {
  if (!isHeaderType(header)) {
    throw new TypeError("header should be of type 'HeaderType'");
  }
  if (!isNonEmptyString(header.type)) {
    throw new TypeError("header.type should be non empty string");
  }
  if (!isNonEmptyString(header.subject)) {
    throw new TypeError("header.subject should be non empty string");
  }

  const isValidScope =
    "scope" in header && header.scope !== null
      ? isNonEmptyString(header.scope)
      : true;

  if (!isValidScope) {
    throw new TypeError(
      "commit.header.scope should be non empty string when given",
    );
  }

  return header; // returns the header unmodified if valid
};
