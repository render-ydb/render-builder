import { getBuildConfig } from './loadConfig';
import { BUILDER_SET } from '../const';
import { BuilderOptions } from '../types';

const resolveBuildConfig = async (
  rootDir: string,
  configFilePattern: BuilderOptions['configFilePattern'],
  configPathArg: string,
) => {
  const buildConfig = await getBuildConfig({
    rootDir,
    configFilePattern,
    configPathArg,
  });

  const { builder } = buildConfig;
  if (!BUILDER_SET.includes(builder)) {
    throw new Error(`builder ${builder} is not supported`);
  }
  return buildConfig;
};

export = resolveBuildConfig;
