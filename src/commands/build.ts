import { log } from '@x.render/render-node-utils';
import run = require('./run');
import parse = require('yargs-parser');

export = async () => {
  const command = 'build';
  process.env.NODE_ENV = 'production';
  const rawArgv = parse(process.argv.slice(3), {
    configuration: { 'strip-dashed': true },
  });
  delete rawArgv._;

  try {
    await run({
      commandArgs: { ...rawArgv },
      command,
    });
  } catch (error) {
    log.error(error.stack);
    process.exit(1);
  }
};
