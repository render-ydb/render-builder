#!/usr/bin/env node

import { program } from 'commander';
import path = require('path');
import { log, checkNodeVersion } from '@x.render/render-node-utils';
import fse = require('fs-extra');
import build = require('./build');
import bootstrap = require('./bootstrap');
import test = require('./test');

const pkgInfo: Record<string, any> = fse.readJsonSync(
  path.resolve(__dirname, '../../package.json')
);

const registerCommand = () => {
  program.version('render-builder').usage('<command> [options]');

  program
    .command('build')
    .description('build project')
    .allowUnknownOption()
    .option(
      '--config <config>',
      'specify the configuration file path used by render-builder'
    )
    .action(build);

  program
    .command('start')
    .description('start server')
    .allowUnknownOption()
    .option(
      '--config <config>',
      'specify the configuration file path used by render-builder'
    )
    .option('-h, --host <host>', 'dev server host', '0.0.0.0')
    .option('-p, --port <port>', 'dev server port')
    .action(bootstrap);

  program
    .command('test')
    .description('run tests with jest')
    .allowUnknownOption() // allow jest config
    .option('--config <config>', 'use custom config')
    .action(test);

  program.parse(process.argv);
};

try {
  log.info(`render-builder ${pkgInfo.version}`);
  checkNodeVersion(pkgInfo.engines.node);
  registerCommand();
} catch (error) {
  log.error(error.stack);
  process.exit(1);
}
