/** Every throw in this repo uses one of these. `hint` tells the agent the fix. */
export class DeckError extends Error {
  constructor(
    message: string,
    readonly hint?: string,
  ) {
    super(hint ? `${message}\n  → ${hint}` : message);
    this.name = new.target.name;
  }
}
export class DeckSpecError extends DeckError {}
export class FontError extends DeckError {}
export class AssetError extends DeckError {}
export class RenderError extends DeckError {}
export class EnvError extends DeckError {}
export class CommandError extends DeckError {}
export class KubeezError extends DeckError {
  constructor(
    message: string,
    readonly status?: number,
    hint?: string,
  ) {
    super(message, hint);
  }
}
