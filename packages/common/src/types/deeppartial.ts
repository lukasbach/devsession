export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U1>
    ? Array<DeepPartial<U1>>
    : T[P] extends ReadonlyArray<infer U2>
      ? ReadonlyArray<DeepPartial<U2>>
      : DeepPartial<T[P]>
};
