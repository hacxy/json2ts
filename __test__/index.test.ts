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
  expect(value).toEqual(expected1);
});
