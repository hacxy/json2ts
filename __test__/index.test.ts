import { expect, it } from 'vitest';
import json2ts from '../src/index';
import { expected1, expected2 } from './expecteds';
import { input1, input2 } from './inputs';

it('json2ts', async () => {
  const value = await json2ts(input1);
  expect(value).toEqual(expected1);

  const value2 = await json2ts(input2);
  expect(value2).toEqual(expected2);
});