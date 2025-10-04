export type PartialNullable<T> = {
  [K in keyof T as undefined | null extends T[K] ? K : never]?: NonNullable<
    T[K]
  >;
} & {
  [K in keyof T as undefined | null extends T[K] ? never : K]: NonNullable<
    T[K]
  >;
};
