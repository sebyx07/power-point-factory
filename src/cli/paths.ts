import { isAbsolute, resolve } from "node:path";

/**
 * bin/* shims cd to the repo root (for .env + tsconfig). Relative paths the USER typed must still
 * resolve against where they ran the command: the shim exports DECK_CWD for that.
 */
export const userCwd = () => process.env.DECK_CWD ?? process.cwd();
export const userPath = (p: string) => (isAbsolute(p) ? p : resolve(userCwd(), p));

/** a deck-relative or absolute asset path */
export const resolveFrom = (base: string, p: string) => (isAbsolute(p) ? p : resolve(base, p));
