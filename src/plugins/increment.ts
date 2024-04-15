import { Commit, PluginFunction } from "../types.js";
import { normalizeCommit, isBreakingChange, isHeaderType } from "../utils.js";

interface Options {
  headerRegex?: RegExp | string;
  caseSensitive?: boolean;
  normalize?: boolean;
}

/**
 * A plugin that adds `increment` property to the `commit`.
 * It is already included in the `plugins` named export,
 * and in `mappers` named export.
 *
 * **Note: Since v4 this plugin doesn't add `isBreaking` property, use the `isBreaking` plugin instead.**
 *
 * _See the [.plugins](#plugins) and [.mappers](#mappers)  examples._
 *
 * @example
 * import { mappers, plugins } from 'parse-commit-message';
 *
 * console.log(mappers.increment); // => [Function: incrementPlugin]
 * console.log(plugins[1]); // => [Function: incrementPlugin]
 *
 * @name  incrementPlugin
 * @param commit a standard `Commit` object
 * @param options options to control the header regex and case sensitivity
 * @returns {Commit} plus `{ increment: string }`
 * @public
 */
export const incrementPlugin: PluginFunction = (
  commit: Commit,
  options: Options,
): Commit => {
  const opts: Options = { normalize: true, ...options };
  const cmt: Commit = opts.normalize ? normalizeCommit(commit, opts) : commit;
  const isBreaking: boolean = isBreakingChange(cmt);
  let commitIncrement: string = "";

  if (!isHeaderType(cmt.header)) {
    throw new TypeError("Header should be of type 'HeaderType'");
  }

  if (/fix|bugfix|patch/i.test(cmt.header.type)) {
    commitIncrement = "patch";
  }
  if (/feat|feature|minor/i.test(cmt.header.type)) {
    commitIncrement = "minor";
  }
  if (isBreaking) {
    commitIncrement = "major";
  }

  return { ...commit, increment: commitIncrement };
};
