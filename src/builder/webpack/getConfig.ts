import Chain = require('webpack-chain');

interface ConfigInfo<T> {
  type: 'plugin' | 'preset';
  config: T;
  name: string;
}
const getConfig = async <T>(
  compiler,
  plugins,
  presets,
): Promise<Array<ConfigInfo<T>>> => {
  const webpackConfig = [];
  for (const pluginInfo of plugins) {
    const { plugin, options, name } = pluginInfo;
    const config = await new plugin().run(compiler, new Chain(), options);
    webpackConfig.push({
      type: 'plugin',
      config,
      name,
    });
  }
  for (const preset of presets) {
    const _plugins = preset.plugins || [];
    const config = new Chain();
    for (const Plugin of _plugins) {
      await Plugin.getConfig(compiler, config, preset.options);
    }
    webpackConfig.push({
      type: 'preset',
      config,
      name: preset.name,
    });
  }
  return webpackConfig;
};

export = getConfig;
