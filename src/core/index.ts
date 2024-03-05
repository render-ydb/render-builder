import {
  BuilderHooks,
  BuilderOptions,
  BuilderLog,
  Compiler,
  CommandName,
  Json,
  BuildConfig,
  PluginInfo,
  PLUGIN_CONTEXT_KEY,
  SetBuilderValue,
  GetBuilderValue,
  PresetInfo,
  MaybeArray,
  AppConfig,
  MockConfig,
} from '../types';
import { CWD_PATH } from '../const';
import { SyncHook } from 'tapable';
import _ = require('lodash');
import path = require('path');

import checkPluginsOrPresets = require('../utils/checkPluginsOrPresets');
import resolvePlugins = require('../utils/resolvePlugins');
import resolvePresets = require('../utils/resolvePresets');
import checkFileExistence = require('../utils/checkFileExistence');
import { log, loadConfig, runTask } from '@x.render/render-node-utils';
import chalk = require('chalk');

const { beginTextStyle, endTextStyle } = runTask;

class Builder {
  appConfig: AppConfig = {};

  mockConfig: MockConfig = {};

  command: CommandName;

  commandArgs: Json;

  compiler: Compiler;

  configFilePattern: MaybeArray<string>;

  hooks: BuilderHooks;

  rootDir: string;

  pkg: Json;

  options: BuilderOptions;

  log: BuilderLog = log;

  buildConfig: BuildConfig;

  buildPlugins: PluginInfo[] = [];

  buildPresets: PresetInfo[] = [];

  builderCacheData: Json = {};

  constructor(options: BuilderOptions) {
    const {
      configFilePattern,
      rootDir = CWD_PATH,
      command,
      commandArgs,
      buildConfig,
    } = options || {};

    this.options = options;
    this.command = command;
    this.rootDir = rootDir;
    this.commandArgs = commandArgs;
    this.configFilePattern = configFilePattern;
    this.rootDir = rootDir;
    this.buildConfig = buildConfig;
  }

  async setUp() {
    try {
      await runTask([
        {
          beginText: beginTextStyle(
            'loading the package.json information of the application.',
          ),
          fn: this.getRootPkg.bind(this),
          endText: endTextStyle(
            'successful retrieval of the package.json information of the application.',
          ),
        },
        {
          beginText: beginTextStyle(
            'loading the app.json information of the application.',
          ),
          fn: this.getAppConfig.bind(this),
          endText: endTextStyle(
            'successful retrieval of the app.json information of the application.',
          ),
        },
        {
          beginText: beginTextStyle(
            'loading the mock.json information of the application.',
          ),
          fn: this.getMockConfig.bind(this),
          endText: endTextStyle(
            'successful retrieval of the mock.json information of the application.',
          ),
        },
        {
          beginText: beginTextStyle('legistering builder lifecycle functions.'),
          fn: this.registerHooks.bind(this),
          endText: endTextStyle(
            'registration of builder lifecycle functions completed.',
          ),
        },
        {
          beginText: beginTextStyle('parsing plugins.'),
          fn: this.resolvePlugins.bind(this),
          endText: endTextStyle('successful parsing of plugins.'),
        },
        {
          beginText: beginTextStyle('parsing presets.'),
          fn: this.resolvePresets.bind(this),
          endText: endTextStyle('successful parsing of presets.'),
        },
        {
          beginText: beginTextStyle(
            'validating the legality of plugins and presets.',
          ),
          fn: this.validatePluginAndPreset.bind(this),
          endText: endTextStyle(
            'validation of the legality of plugins and presets completed.',
          ),
        },
        {
          beginText: beginTextStyle('creating a compiler instance.'),
          fn: this.createCompiler.bind(this),
          endText: endTextStyle('compiler instance created successfully.'),
        },
      ]);
    } catch (error) {
      this.log.error(error.stack);
      process.exit(1);
    }
  }

  async getRootPkg() {
    this.pkg = await loadConfig<Json>(
      path.resolve(this.rootDir, 'package.json'),
    );
  }

  async getAppConfig() {
    const filepath = path.resolve(this.rootDir, 'src/app.json');
    if (checkFileExistence(filepath)) {
      this.appConfig = await loadConfig<AppConfig>(filepath);
    } else {
      this.appConfig = {};
    }
  }

  async getMockConfig() {
    const filepath = path.resolve(this.rootDir, 'src/mock.json');
    if (checkFileExistence(filepath)) {
      this.mockConfig = await loadConfig<MockConfig>(filepath);
    } else {
      this.mockConfig = {};
    }
  }
  async registerHooks() {
    this.hooks = {
      afterConfigLoaded: new SyncHook(
        ['afterConfigLoaded'],
        'afterConfigLoaded',
      ),
      afterServerStarted: new SyncHook(
        ['afterServerStarted'],
        'afterServerStarted',
      ),
      afterBuild: new SyncHook(['afterBuild'], 'afterBuild'),
      afterTest: new SyncHook(['afterTest'], 'afterTest'),
      failed: new SyncHook(['failed'], 'failed'),
    };
  }

  private async resolvePlugins() {
    const allPlugins = [...(this.buildConfig.plugins || [])];
    checkPluginsOrPresets({ type: 'plugins', list: allPlugins });

    this.buildPlugins = await resolvePlugins(allPlugins, this.rootDir);
  }

  private async resolvePresets() {
    const allPresets = [...(this.buildConfig.presets || [])];
    checkPluginsOrPresets({ type: 'presets', list: allPresets });
    this.buildPresets = await resolvePresets(allPresets, this.rootDir);
  }

  private async validateTagField(builder, tag, tagPath, name, type) {
    if (tag) {
      if (tag !== builder) {
        throw new Error(
          chalk.red(
            `${builder} cannot use plugins that do not comply with the ${builder} configuration for building.\n` +
              `[${type}:path]: ${tagPath}\n` +
              `[${type}:name]: ${name}`,
          ),
        );
      }
    } else if (!tag) {
      throw new Error(
        chalk.red(
          'plugins must inherit from WebpackBuilderPluginClass, ViteBuilderPluginClass, or RollupBuilderPluginClass.\n' +
            `[${type}:path]: ${tagPath}\n` +
            `[${type}:name]: ${name}`,
        ),
      );
    }
  }

  private async validatePluginAndPreset() {
    const { builder } = this.buildConfig;
    for (const pluginInfo of this.buildPlugins) {
      const { plugin, pluginPath, name } = pluginInfo;
      await this.validateTagField(
        builder,
        plugin.tag,
        pluginPath,
        name,
        'plugin',
      );
    }

    for (const presetInfo of this.buildPresets) {
      const { plugins = [], presetPath, name } = presetInfo;
      for (const plugin of plugins) {
        await this.validateTagField(
          builder,
          plugin.tag,
          presetPath,
          name,
          'preset',
        );
      }
    }
  }

  private async createCompiler() {
    const pluginContext = _.pick(this, PLUGIN_CONTEXT_KEY);
    this.compiler = {
      context: pluginContext,
      hooks: this.hooks,
      log: this.log,
      buildPlugins: this.buildPlugins,
      buildPresets: this.buildPresets,
      setValue: this.setValue,
      getValue: this.getValue,
    };
  }

  private setValue: SetBuilderValue = (key, value) => {
    this.builderCacheData[key] = value;
  };

  private getValue: GetBuilderValue = (key) => {
    return this.builderCacheData[key];
  };
}

export const createBuilder = async (options: BuilderOptions) => {
  const builder = new Builder(options);
  await builder.setUp();
  return builder;
};
