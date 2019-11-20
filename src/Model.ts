/// <reference path="EventEmitter.ts" />


class Model<Format extends {}> {
  private readonly _handlers: EventEmitter = new EventEmitter();

  public constructor(data: Format) {
    // TODO
  }
}


class Collection<ElementType> {
  private readonly _handlers: EventEmitter = new EventEmitter();

  public constructor(data: ElementType[]) {
    // TODO
  }
}
