import { Commit, Mention, PluginFunction } from "../types.js";
import { isHeaderType, normalizeCommit } from "../utils.js";

/**
 * Compatible twitter mentions regex, not only of course!
 *
 * @param  {Boolean} `dot` if `true` it will allow to match dots
 */
const mentionsRegex = (dot: boolean): RegExp => {
  if (dot) {
    // e.g. @google.com will match `google.com`
    return /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/_.]{1,15})(?:\b(?!@|＠)|$)/;
  }
  // e.g. @google.com will match `google`
  return /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/_]{1,15})(?:\b(?!@|＠)|$)/;
};

/**
 * > Collect all mentions from string. Returns array of objects
 * with properties `{ handle, mention, index }`.
 *
 * **Example**
 *
 * ```js
 * import collectMentions from 'collect-mentions';
 *
 * const mentions = collectMentions('foo @tunnckoCore and yeah @bar, right?')
 *
 * console.log(mentions)
 * // => [
 * //   { handle: '@tunnckoCore', mention: 'tunnckoCore', index: 3 },
 * //   { handle: '@bar', mention: 'bar', index: 25 },
 * // ]
 *
 * // If `dot` boolean is `true`
 * console.log(collectMentions('some @ok.bar yeah', true))
 * // => [{ handle: '@ok.bar', mention: 'ok.bar', index: 4 }]
 * ```
 *
 * @name  collectMentions
 * @param {String} `str` string to collect mentions from
 * @param {Boolean} `dot` if it is `true`, it will support mentions including dot
 */

const getMentions = (str: string, dot = false): Mention[] => {
  const result = [];
  const regex = new RegExp(mentionsRegex(dot), "g");
  let m = null;

  /* eslint-disable no-cond-assign */
  while ((m = regex.exec(str))) {
    result.push({ handle: m[0].trim(), mention: m[1], index: m.index });
  }

  return result;
};

interface Options {
  headerRegex?: RegExp | string;
  caseSensitive?: boolean;
  normalize?: boolean;
}

/**
 * A plugin that adds `mentions` array property to the `commit`.
 * It is already included in the `plugins` named export,
 * and in `mappers` named export.
 * Basically each entry in that array is an object,
 * directly returned from the [collect-mentions][].
 *
 * _See the [.plugins](#plugins) and [.mappers](#mappers)  examples._
 *
 * @example
 * import { mappers, plugins } from 'parse-commit-message';
 *
 * console.log(mappers.mentions); // => [Function: mentionsPlugin]
 * console.log(plugins[0]); // => [Function: mentionsPlugin]
 *
 * @param commit a standard `Commit` object
 * @param options options to control the header regex and case sensitivity
 * @returns {Commit} plus `{ mentions: Array<Mention> }`
 * @public
 */
export const mentionsPlugin: PluginFunction = (
  commit: Commit,
  options: Options,
): Commit => {
  const opts = { normalize: true, ...options };
  const cmt = opts.normalize ? normalizeCommit(commit, opts) : commit;

  if (!isHeaderType(cmt.header)) {
    throw new TypeError(
      "mentionsPlugin: commit.header is not of type 'HeaderTye'",
    );
  }

  // Flatten and concatenate mentions from header, body, and footer
  const commitMentions: Mention[] = [getMentions(cmt.header.subject ?? "")]
    .flat()
    .concat(getMentions(cmt.body ?? ""))
    .concat(getMentions(cmt.footer ?? ""));

  return { ...commit, mentions: commitMentions };
};
