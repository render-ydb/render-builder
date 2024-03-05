import { Compiler, Json } from '../types';

export class BaseClass<T> {
  static tag = '';
  static getConfig<T>(compiler: Compiler, config: T, options: Json) {
    return new this().run(compiler, config, options);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run(compiler: Compiler, config: T, options: Json): T {
    return config;
  }
}
