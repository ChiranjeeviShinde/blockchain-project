import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const contractPath = path.resolve(rootDir, 'contracts', 'BlockTix.sol');
const source = fs.readFileSync(contractPath, 'utf8');

function findImports(importPath) {
  try {
    let resolvedPath;
    if (importPath.startsWith('@openzeppelin/')) {
      resolvedPath = path.resolve(rootDir, 'node_modules', importPath);
    } else {
      resolvedPath = path.resolve(rootDir, 'contracts', importPath);
    }

    if (fs.existsSync(resolvedPath)) {
      return { contents: fs.readFileSync(resolvedPath, 'utf8') };
    } else {
      return { error: `File not found: ${resolvedPath}` };
    }
  } catch (err) {
    return { error: err.message };
  }
}

const input = {
  language: 'Solidity',
  sources: {
    'BlockTix.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

console.log('Compiling BlockTix.sol with solc...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

let hasError = false;
if (output.errors) {
  for (const error of output.errors) {
    if (error.severity === 'error') {
      console.error('Compilation Error:', error.formattedMessage);
      hasError = true;
    } else {
      console.warn('Compilation Warning:', error.formattedMessage);
    }
  }
}

if (hasError) {
  process.exit(1);
}

const contract = output.contracts['BlockTix.sol']['BlockTix'];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

const outDir = path.resolve(rootDir, 'src', 'contracts');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.resolve(outDir, 'BlockTixABI.json'),
  JSON.stringify(abi, null, 2)
);

fs.writeFileSync(
  path.resolve(outDir, 'BlockTixBytecode.json'),
  JSON.stringify({ bytecode }, null, 2)
);

console.log('✅ Compilation succeeded!');
console.log(`Saved ABI to: ${path.resolve(outDir, 'BlockTixABI.json')}`);
console.log(`Saved Bytecode to: ${path.resolve(outDir, 'BlockTixBytecode.json')}`);
