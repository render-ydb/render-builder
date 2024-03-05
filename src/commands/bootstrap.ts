import { fork, ChildProcess } from 'child_process';
import parse = require('yargs-parser');
import path = require('path');
import chokidar = require('chokidar');
import fg = require('fast-glob');
import { log } from '@x.render/render-node-utils';
import { BUILDER_CONFIG_FILE_TYPE, CWD_PATH } from '../const';

let child: ChildProcess = null;
const rawArgv = parse(process.argv.slice(2));
const scriptPath = require.resolve('./start.js');

const [defaultBuildConfig] = fg.sync(BUILDER_CONFIG_FILE_TYPE, {
  cwd: CWD_PATH,
  absolute: true,
});

const configPath = [
  path.resolve(rawArgv.config || defaultBuildConfig),
  path.resolve(CWD_PATH, 'package.json'),
  path.resolve(CWD_PATH, 'src/schema.json'),
  path.resolve(CWD_PATH, 'src/app.json'),
  path.resolve(CWD_PATH, 'src/mock.json'),
];

const restartProcess = () => {
  (async () => {
    const nProcessArgv = process.argv.slice(2);
    child = fork(scriptPath, nProcessArgv);
    child.on('message', (data) => {
      if (process.send) {
        process.send(data);
      }
    });

    child.on('exit', (code: number) => {
      if (code) {
        process.exit(code);
      }
    });
  })();
};

const onUserChange = (filepath: string) => {
  const configFileName = path.basename(filepath);
  console.log('\n');
  log.info(`${configFileName} has been changed`);
  log.info('restart dev server');
  child.kill();
  restartProcess();
};

export = async () => {
  restartProcess();
  const watcher = chokidar.watch(configPath, {
    ignoreInitial: true,
  });
  watcher.on('change', onUserChange);
  watcher.on('error', (error) => {
    log.error('fail to watch file', error.message);
    process.exit(1);
  });
};
