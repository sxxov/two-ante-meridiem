export type CSSProperties = {
  [k in keyof CSSStyleDeclaration as string extends k ? never
  : number extends k ? never
  : symbol extends k ? never
  : k]: CSSStyleDeclaration[k] extends string | number ? CSSStyleDeclaration[k]
  : never;
} & Record<`--${string}`, string | number>;
