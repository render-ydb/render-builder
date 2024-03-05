import { SyncHook } from 'tapable';
import { log } from '@x.render/render-node-utils';
import { BaseClass } from '../PluginClass/BaseClass';
import WebpackChain from 'webpack-chain';

export type ChainConfig = WebpackChain;

export type PluginClass = typeof BaseClass;
export type BuilderLog = typeof log;

export interface Hash<T> {
  [name: string]: T;
}
export type Json = Hash<
string | number | boolean | Date | Json | JsonArray | any
>;
export type JsonArray = Array<
string | number | boolean | Date | Json | JsonArray
>;

export type MaybeArray<T> = T | T[];
export type MaybePromise<T> = T | Promise<T>;

interface BaseHook {
  commandArgs: Json;
  config: Json[];
}
interface Urls {
  url?: string;
  urls?: {
    lanUrlForConfig: string;
    lanUrlForTerminal: string;
    lanUrlForBrowser: string;
    localUrlForTerminal: string;
    localUrlForBrowser: string;
  };
}
type AfterTestHook = BaseHook;
type AfterConfigLoadedHook = BaseHook;
interface afterServerStartedHook extends BaseHook, Urls {
  devServer?: any;
  [name: string]: any;
}
interface afterBuildHook extends BaseHook, Urls {
  compileRes?: any;
  stats?: any;
}
interface failedHook {
  err: Error;
}

export interface BuilderHooks {
  afterTest: SyncHook<AfterTestHook>;
  afterConfigLoaded: SyncHook<AfterConfigLoadedHook>;
  afterServerStarted: SyncHook<afterServerStartedHook>;
  afterBuild: SyncHook<afterBuildHook>;
  failed: SyncHook<failedHook>;
}

export type CommandName = 'start' | 'build' | 'test' | string;

export interface BuilderOptions {
  command: string;
  rootDir?: string;
  configFilePattern?: MaybeArray<string>;
  commandArgs?: Json;
  buildConfig?: Json;
}

export const PLUGIN_CONTEXT_KEY = [
  'rootDir' as const,
  'buildConfig' as const,
  'pkg' as const,
  'commandArgs' as const,
  'command' as const,
  'appConfig' as const,
  'mockConfig' as const,
];

export interface SetBuilderTaskConfigFn<T> {
  (config: T): Promise<void | T> | void | T;
}

export type CacheDataKey = string | number;

export interface SetBuilderValue {
  (key: CacheDataKey, value: any): void;
}

export interface GetBuilderValue {
  (key: CacheDataKey): any;
}

export type MockConfig = Json;

export interface AppConfig {
  window?: {
    title?: string;
  };
  metas?: string[];
  scripts?: string[];
}

export interface Context {
  rootDir: string;
  command: string;
  commandArgs: Json;
  buildConfig: Json;
  pkg: Json;
  appConfig: AppConfig;
  mockConfig: MockConfig;
}
export interface Compiler {
  context: Context;
  hooks: BuilderHooks;
  log: BuilderLog;
  buildPresets: PresetInfo[];
  buildPlugins: PluginInfo[];
  setValue: SetBuilderValue;
  getValue: GetBuilderValue;
}

export type PluginOrPreset = string | [string, Json];
export type PluginListOrPresetList = PluginOrPreset[];

export interface Preset {
  install: () => PluginClass[];
}
export interface BuildConfig extends Json {
  builder?: 'webpack' | 'vite' | 'rollup';
  plugins?: PluginListOrPresetList;
  presets?: PluginListOrPresetList;
}

export interface PluginInfo {
  plugin: PluginClass;
  name?: string;
  pluginPath?: string;
  options: Json;
}

export interface PresetInfo {
  plugins: PluginClass[];
  name?: string;
  presetPath?: string;
  options: Json;
}

export interface ScriptFn {
  (compiler: Compiler): void | Promise<void> | any;
}
