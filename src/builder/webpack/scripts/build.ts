import fs = require('fs-extra');
import path = require('path');
import { webpackStats } from '@x.render/render-node-utils';
import webpack from 'webpack';
import getConfig = require('../getConfig');
import { ScriptFn } from '../../../types';
import WebpackChain from 'webpack-chain';
import chalk = require('chalk');

const scriptBuild: ScriptFn = async (compiler) => {
  const { context, log, hooks, buildPlugins, buildPresets } = compiler;
  const { commandArgs, rootDir } = context;
  const configInfoSet = await getConfig<WebpackChain>(
    compiler,
    buildPlugins,
    buildPresets
  );
  const webpackConfig = configInfoSet.map((v) => v.config.toConfig());

  if (!webpackConfig.length) {
    const errorMsg = 'No webpack config found.';
    log.warn(errorMsg);
    await hooks.failed.call({ err: new Error(errorMsg) });
    return;
  }

  hooks.afterConfigLoaded.call({
    commandArgs: { ...commandArgs },
    config: configInfoSet,
  });

  const defaultPath = path.resolve(rootDir, 'build');
  configInfoSet.forEach((v) => {
    try {
      const taskbuildPath = v.config.output.get('path');
      const buildPath = path.resolve(rootDir, taskbuildPath);
      fs.emptyDirSync(buildPath);
    } catch (e) {
      if (fs.existsSync(defaultPath)) {
        fs.emptyDirSync(defaultPath);
      }
    }
  });

  let webpackCompiler: webpack.MultiCompiler;
  try {
    webpackCompiler = webpack(webpackConfig);
  } catch (err) {
    log.error(chalk.red('Failed to load webpack config.'));
    await hooks.failed.call({ err });
    throw err;
  }
  const result: any = await new Promise((resolve, reject): void => {
    webpackCompiler.run((err, stats) => {
      if (err) {
        log.error(err.stack || err.toString());
        reject(err);
        return;
      }

      const isSuccessful = webpackStats({
        stats,
      });
      if (isSuccessful) {
        webpackCompiler?.close?.(() => {});
        resolve({
          stats,
        });
      } else {
        reject(new Error('webpack compile error'));
      }
    });
  });
  hooks.afterBuild.call({ ...result });
};
export = scriptBuild;
