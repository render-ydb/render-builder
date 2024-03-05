import { PresetInfo, PluginListOrPresetList, Json, Preset } from '../types';
import { loadConfig } from '@x.render/render-node-utils';
import _ = require('lodash');

const findUp = require('find-up');

const resolvePresets = async (
  allPresets: PluginListOrPresetList,
  rootDir: string,
): Promise<PresetInfo[]> => {
  const buildPresets = await Promise.all(
    allPresets.map(async (preset): Promise<PresetInfo> => {
      let presetInstace;
      const presets = Array.isArray(preset) ? preset : [preset, undefined];
      const presetPath = require.resolve(presets[0], {
        paths: [rootDir],
      });
      const options = presets[1] as Json;
      try {
        presetInstace = await loadConfig<Preset>(presetPath);
        presetInstace = presetInstace.default ?? presetInstace;
      } catch (err) {
        if (err instanceof Error) {
          console.log(err);
          throw new Error(`Fail to load preset ${presetPath}`);
        }
      }

      if (!_.isFunction(presetInstace.install)) {
        throw new Error(
          `Fail to load preset ${presetPath}, the preset must have an install method."`,
        );
      }
      const pluginPkg = await loadConfig<{ name: string; [x: string]: any }>(
        findUp.sync('package.json', {
          cwd: presetPath,
        }),
      );

      return {
        name: pluginPkg.name,
        presetPath: presetPath as string,
        plugins: presetInstace.install(),
        options: options || {},
      };
    }),
  );
  return buildPresets;
};

export = resolvePresets;
