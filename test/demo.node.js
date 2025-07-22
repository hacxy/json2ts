import json2ts from '../dist/index.js';
json2ts(`{"name": "John", "age": 30}`, 'Root', { indentation: false }).then(console.log);
json2ts(
  `
[
{"a": 1, 
"b": {"foo": "", "bar": ""}
}
]
`
).then(console.log);
