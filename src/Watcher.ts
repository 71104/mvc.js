/// <reference path="EventEmitter.ts" />


class ExpressionWatcher {
  public constructor(
      public readonly path: string[],
      public readonly handler: EventHandler) {}
}
