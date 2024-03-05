import { Compiler, Json, ChainConfig } from '../types';
import { BaseClass } from './BaseClass';

export abstract class WebpackBuilderPluginClass extends BaseClass<ChainConfig> {
  static tag = 'webpack';
  constructor() {
    super();
  }
  run(compiler: Compiler, config: ChainConfig, options: Json): ChainConfig {
    throw new Error('The run method of the plugin must be implemented.');
  }
}
