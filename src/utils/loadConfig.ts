import fse = require('fs-extra');
import fg = require('fast-glob');
import path = require('path');
import { loadConfig, log } from '@x.render/render-node-utils';
import { BuildConfig, MaybeArray } from '../types';
import { BUILDER_CONFIG_FILE_TYPE, CWD_PATH } from '../const';

export const getBuildConfig = async ({
  rootDir = CWD_PATH,
  configFilePattern = BUILDER_CONFIG_FILE_TYPE,
  configPathArg,
}: {
  rootDir: string;
  configFilePattern: MaybeArray<string>;
  configPathArg?: string;
}): Promise<BuildConfig> => {
  let configPath: string;
  if (configPathArg) {
    configPath = path.resolve(rootDir, configPathArg);
  } else {
    const [defaultUserConfig] = await fg(configFilePattern, {
      cwd: rootDir,
      absolute: true,
    });
    configPath = defaultUserConfig;
  }

  let buildConfig: BuildConfig = {
    plugins: [],
    presets: [],
  };

  if (configPath && fse.existsSync(configPath)) {
    try {
      buildConfig = await loadConfig(configPath);
    } catch (err) {
      log.error(`Fail to load config file ${configPath}`);
      log.error(err);
      process.exit(1);
    }
  } else if (configPath) {
    log.error(`config file ${`(${configPath})` || ''} is not exist`);
    process.exit(1);
  } else {
    log.debug(
      "It's most likely you don't have a config file in root directory!\n" +
        'Just ignore this message if you know what you do; Otherwise, check it by yourself.',
    );
  }

  return buildConfig;
};
