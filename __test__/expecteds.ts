export const expected1 = `export interface Foo {
  name: string;
  age:  number;
}

export interface Root {
  a:   number;
  b:   string;
  foo: Foo[];
}`;

export const expected2 = `export interface RootElement {
  a: number;
  b: string;
}

export type Root = RootElement[];`;