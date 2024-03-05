import webpack from 'webpack';
import type WebpackDevServer from 'webpack-dev-server';
import deepmerge = require('deepmerge');
import { Json, ScriptFn } from '../../../types';
import getConfig = require('../getConfig');
import { prepareURLs, webpackStats } from '@x.render/render-node-utils';
import WebpackChain from 'webpack-chain';
import chalk = require('chalk');

type DevServerConfig = Record<string, any>;
const scriptStart: ScriptFn = async (compiler) => {
  const { context, log, hooks, buildPresets, buildPlugins } = compiler;
  const { commandArgs } = context;
  const configInfoSet = await getConfig<WebpackChain>(
    compiler,
    buildPlugins,
    buildPresets,
  );
  const webpackConfig = configInfoSet.map((v) => v.config.toConfig()) as Json[];

  hooks.afterConfigLoaded.call({
    commandArgs: { ...commandArgs },
    config: configInfoSet,
  });

  if (!webpackConfig.length) {
    const errorMsg = 'No webpack config found.';
    log.warn(errorMsg);
    await hooks.failed.call({ err: new Error(errorMsg) });
    return;
  }

  let devServerConfig: DevServerConfig = {
    port: commandArgs.port || 3333,
    host: commandArgs.host || '0.0.0.0',
    https: commandArgs.https || false,
  };

  for (const config of webpackConfig) {
    if (config.devServer) {
      devServerConfig = deepmerge(devServerConfig, config.devServer);
    }

    if (process.env.USE_CLI_PORT) {
      devServerConfig.port = commandArgs.port;
    }
  }

  let webpackCompiler;
  try {
    webpackCompiler = webpack(webpackConfig);
  } catch (err) {
    log.error(chalk.red('Failed to load webpack config.'));
    await hooks.failed.call({ err });
    throw err;
  }

  const protocol = devServerConfig.https ? 'https' : 'http';
  const urls = prepareURLs(
    protocol,
    devServerConfig.host,
    devServerConfig.port,
  );
  const serverUrl = urls.localUrlForBrowser;

  let isFirstCompile = true;
  webpackCompiler.hooks.done.tap('compileHook', async (stats) => {
    const isSuccessful = webpackStats({
      urls,
      stats,
      isFirstCompile,
    });
    if (isSuccessful) {
      isFirstCompile = false;
    }

    hooks.afterBuild.call({
      commandArgs: { ...commandArgs },
      config: webpackConfig,
      url: serverUrl,
      urls: { ...urls },
      stats: { ...stats },
    });
  });

  let devServer: WebpackDevServer;
  const DevServer = require('webpack-dev-server');
  devServer = new DevServer(devServerConfig, webpackCompiler);

  devServer.startCallback((err) => {
    if (err) {
      log.error(chalk.red('Failed to start webpack-dev-server'));
      log.error(err);
    }
    hooks.afterServerStarted.call({
      commandArgs: { ...commandArgs },
      config: configInfoSet,
      url: serverUrl,
      urls: { ...urls },
      devServer: { ...devServer },
    });
  });
  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, async () => {
      devServer.close();
      process.exit(0);
    });
  });
  return devServer;
};

export = scriptStart;
