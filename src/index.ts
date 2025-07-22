import { InputData, jsonInputForTargetLanguage, quicktype } from 'quicktype-core';
import { analyzeAndSortTypeScript } from './utils';

export interface Json2TsOptions {
  indentation?: number
}

async function json2ts(json: string, name: string = 'Root', options: Json2TsOptions = {}) {
  const { indentation = 2 } = options;
  let isArray = false;
  try {
    isArray = Array.isArray(JSON.parse(json));
  }
  catch (err) {
    throw new Error(String(err));
  }

  const jsonInput = jsonInputForTargetLanguage('typescript');
  await jsonInput.addSource({
    name: isArray ? `${name}Element` : name,
    samples: [json]
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);
  const { lines } = await quicktype({
    inputData,
    lang: 'typescript',
    rendererOptions: {
      'just-types': true
    },

    indentation: ' '.repeat(indentation)
  });

  let tsCode = lines.join('\n');

  if (isArray) {
    tsCode = `${tsCode}\nexport type ${name} = ${name}Element[];`;
  }
  const { sortedCode } = analyzeAndSortTypeScript(tsCode);

  return sortedCode;
}

export default json2ts;