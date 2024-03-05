import { createBuilder } from '../core';
import webpackStart = require('../builder/webpack/scripts/start');
import webpackBuild = require('../builder/webpack/scripts/build');
import webpackTest = require('../builder/webpack/scripts/test');
import { BuilderOptions, ScriptFn } from '../types';
import resolveBuildConfig = require('../utils/resolveBuildConfig');

type BuildTool = Record<'start' | 'build' | 'test', ScriptFn>;
const scriptMap: Partial<{
  webpack: BuildTool;
  vite: BuildTool;
  rollup: BuildTool;
}> = {
  webpack: {
    start: webpackStart,
    build: webpackBuild,
    test: webpackTest,
  },
};

const run = async (options: BuilderOptions) => {
  const { command, rootDir, configFilePattern, commandArgs } = options;
  const buildConfig = await resolveBuildConfig(
    rootDir,
    configFilePattern,
    commandArgs.config,
  );
  const { builder } = buildConfig;
  const renderBuilder = await createBuilder({
    ...options,
    buildConfig,
  });
  return scriptMap[builder][command](renderBuilder.compiler);
};

export = run;
