#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const meow = require('meow');

const { transform } = require('./transform');
const { SCALAR } = require('./scalar');

const cli = meow(
  `
  Usage
    $ skm_ts ./*.gql -s Json:object -o ./src/skm.ts

  Options
    --scalar, -s  Define Graphql scalar type to TS type.(eg: Json:object)
    --output, -o  The output typescript file path
    --help        Print this help
`,
  {
    flags: {
      help: { type: 'boolean' },
      output: { type: 'string', alias: 'o' },
      scalar: {
        type: 'string',
        alias: 's',
      },
    },
  },
);

if (cli.input.length === 0) {
  cli.showHelp();
  process.exit(0);
}

cli.flags.scalar = []
  .concat(cli.flags.scalar)
  .filter(v => v)
  .forEach(kv => {
    let [k, v] = kv.split(':');
    if (!k || !v) {
      console.error(new Error('Wrong scalar definition. See --help:'));
      cli.showHelp();
      process.exit(1);
    }
    SCALAR[k] = v;
  });

function run(source_file_paths) {
  source_file_paths = source_file_paths.map(file_path => path.relative(process.cwd(), file_path));
  let ts_source = source_file_paths.map(path => `// ${path}\n${transform(fs.readFileSync(path, 'utf8'))}`).join('\n\n\n');
  if (cli.flags.output) {
    fs.writeFileSync(cli.flags.output, ts_source, { encoding: 'utf8' });
  } else {
    console.log(ts_source);
  }
}

run(cli.input);
