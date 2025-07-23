import { expect, it } from 'vitest';
import json2ts from '../src/index';

it('json2ts', async () => {
  const expected1 = `export interface Foo {
  name: string;
  age:  number;
}

export interface Root {
  a:   number;
  b:   string;
  foo: Foo[];
}`;

  const value = await json2ts(`{
    "a": 1,
    "b": "2",
    "foo": [
        {
            "name": "aaa",
            "age": 18
        },
        {
            "name": "bbb",
            "age": 19
        }
    ]
}`);
  const expected2 = `export interface RootElement {
  a: number;
  b: string;
}

export type Root = RootElement[];`;
  const value2 = await json2ts(`[
    {
        "a": 1,
        "b": "2"
    },
    {
        "a": 1,
        "b": "2"
    },
    {
        "a": 1,
        "b": "2"
    }
]`);
  expect(value).toEqual(expected1);
  expect(value2).toEqual(expected2);
});
