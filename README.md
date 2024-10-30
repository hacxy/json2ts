# Json2Ts

## Overview

Json2Ts is a code generation tool that transforms Json Data into Typescript types.

Targets Browsers and Node.js .

## Install

```bash
npm install @hacxy/json2ts --save
```

### Example

```ts
import json2ts from '@hacxy/json2ts';

json2ts(`{"id": 1, "name": "hacxy"}`, 'Root').then((code) => {
  console.log(code);
});
/**
  export interface Root {
    id: number;
    name: string;
  }
 */
```

function: `json2ts()`

> **json2ts**(`json`, `name`): `Promise`\<`string`\>

### Params

| name   | types    | default     | description      |
| :----- | :------- | :---------- | :--------------- |
| `json` | `string` | `undefined` | json data        |
| `name` | `string` | `'Root'`    | define type name |

### Returns

`Promise`\<`string`\>
