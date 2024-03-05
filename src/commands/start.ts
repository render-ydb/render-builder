import run = require('./run');
import parse = require('yargs-parser');
import detect = require('detect-port');
import inquirer = require('inquirer');
import { log } from '@x.render/render-node-utils';

const rawArgv = parse(process.argv.slice(3), {
  configuration: { 'strip-dashed': true },
});

const DEFAULT_PORT = rawArgv.port || process.env.PORT;

const defaultPort = parseInt(DEFAULT_PORT || 3333, 10);

(async () => {
  const command = 'start';
  process.env.NODE_ENV = 'development';

  let newPort: number | null = await detect(defaultPort);
  if (newPort !== defaultPort) {
    const questions = [
      {
        type: 'confirm',
        name: 'shouldChangePort',
        message: `port ${defaultPort} is already in use, do you want to start on port ${newPort} instead?`,
        default: true,
      },
    ];
    const answer = await (inquirer as any).prompt(questions);
    if (!answer.shouldChangePort) {
      newPort = null;
    }
    if (newPort === null) {
      process.exit(1);
    }
  }
  rawArgv.port = newPort;
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
})();
