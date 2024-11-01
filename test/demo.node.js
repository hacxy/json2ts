import json2ts from '../dist/index.js';
json2ts(`{"name": "John", "age": 30}`, 'Root', { indentation: false }).then(console.log);
