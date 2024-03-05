import {
  PluginInfo,
  PluginListOrPresetList,
  Json,
  PluginClass,
} from '../types';
import { loadConfig } from '@x.render/render-node-utils';

const findUp = require('find-up');

const resolvePlugins = async (
  allPlugins: PluginListOrPresetList,
  rootDir: string,
): Promise<PluginInfo[]> => {
  const buildPlugins = await Promise.all(
    allPlugins.map(async (plugin): Promise<PluginInfo> => {
      let Plugin;
      const plugins = Array.isArray(plugin) ? plugin : [plugin, undefined];
      const pluginPath = require.resolve(plugins[0], { paths: [rootDir] });
      const options = plugins[1] as Json;
      try {
        Plugin = await loadConfig<PluginClass>(pluginPath);
        Plugin = Plugin.default ?? Plugin;
      } catch (err) {
        if (err instanceof Error) {
          throw new Error(`Fail to load plugin ${pluginPath}`);
        }
      }
      const pluginPkg = await loadConfig<{ name: string; [x: string]: any }>(
        findUp.sync('package.json', {
          cwd: pluginPath,
        }),
      );

      return {
        name: pluginPkg.name,
        pluginPath: pluginPath as string,
        plugin: Plugin,
        options: options || {},
      };
    }),
  );
  return buildPlugins;
};

export = resolvePlugins;
