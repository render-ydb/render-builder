# @x.render/render-builder

<p>
<a href="https://www.npmjs.com/package/@x.render/render-builder" target="__blank"><img src="https://img.shields.io/npm/v/@x.render/render-builder" alt="NPM version" /></a>

<a href="https://www.npmjs.com/package/@x.render/render-builder" target="__blank"><img src="https://img.shields.io/npm/dm/%40x.render%2Frender-builder" alt="NPM Downloads" /></a>

</p>

[中文文档](./README.zh.md)

## Introduce

A basic builder that integrates building tools such as webpack, Vite.

## Usage

```bash
npm install @x.render/render-builder -D
```

## Commands

render-builder provides two commands, start and build, for starting and compiling projects.

### start

Use the start command to run the project and support cli args passing in

#### args

| **Name** | **Description**                                            | **Default**                                                                                                                                 |
| -------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| config   | Specify the configuration file path used by render-builder | Files in the project root directory that match the wildcard character `build.json` or `build.config.(js \| ts \| mjs \| mts \| cjs \| cts)` |
| host     | Specify the host where the project runs                    | 0.0.0.0                                                                                                                                     |
| port     | Specify the port where the project runs                    | 3333                                                                                                                                        |

```bash
npx render-builder start --config=./build.config.js  --host=0.0.0.0 --port=3333
```

### build

Use build command to run compilation and support cli args.

#### args

| **Name** | **Description**                                            | **Default**                                                                                                                                 |
| -------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| config   | Specify the configuration file path used by render-builder | Files in the project root directory that match the wildcard character `build.json` or `build.config.(js \| ts \| mjs \| mts \| cjs \| cts)` |

```bash
npx render-builder build --config=./build.config.js
```

## Instructions for use

render-builder itself does not have any building capabilities, and it integrates webapck, vite and other building tools internally. render-builder is only responsible for providing unified running commands and unified paradigm plugins and presets, and determines which build tool to use based on the plugins and presets.

tips:(Currently only supports webpack)

### Architecture diagram

![alt text](https://gw.alicdn.com/imgextra/i2/O1CN01XUnk7M1u091jxRY0S_!!6000000005974-0-tps-1356-1268.jpg)

## Write a plugin

render-builder specifies the writing paradigm of the A simple plugin example suitable for webpack is as follows:

```javascript
import {
  Compiler,
  ChainConfig,
  WebpackBuilderPluginClass,
} from "@x.render/render-builder";
type PluginOptions = Record<string, any>;

export default class DemoWebpackPlugin extends WebpackBuilderPluginClass {
  run(compiler: Compiler, config: ChainConfig, options: PluginOptions) {
    const { context } = compiler;
    const { command } = context;
    const mode = command === "start" ? "development" : "production";
    config.mode(mode);
    return config;
  }
}
```

All render-builder plugins must implement one of the three classes `WebpackBuilderPluginClass`, `ViteBuilderPluginClass`, and `RollupBuilderPluginClass`.Currently only WebpackBuilderPluginClass has a specific implementation.

Plug-ins written using WebpackBuilderPluginClass will have a getConfig static method,Plug-ins written using WebpackBuilderPluginClass will have a getConfig static method, which can be used to obtain the webpack-chain configuration inside the plug-in.

For example, the following code can obtain the webpack-chain configuration in DemoWebpackPlugin:

```javascript
const demoConfig = DemoWebpackPlugin.getConfig(
  compiler,
  config,
  DemoWebpackPluginOptions
);
```

The `compiler`, `config`, and `options` parameters can be obtained in the run method of each plug-in, and these parameters can be used to enhance the capabilities of the plug-in.

### Compiler

Compiler is an object when render-builder is executed. It provides many properties and methods to help write plug-ins.

| **Name**     | **Type**   | **Description**                                                                                         |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------- |
| context      | `Object`   | Compilation context                                                                                     |
| hooks        | `Object`   | Provide render-builder life cycle monitoring function                                                   |
| log          | `Function` | Output function                                                                                         |
| buildPlugins | `Array`    | Save plug-in information used in render-builder compilationn                                            |
| buildPresets | `Array`    | Save Preset information used in render-builder compilationn                                             |
| setValue     | `Function` | Used for communication between plug-ins. Use this method to save content to render-builder.             |
| setValue     | `Function` | Used for communication between plug-ins. Use this method to obtain the content saved in render-builder. |

```javascript
export default class DemoWebpackPlugin extends WebpackBuilderPluginClass {
  run(compiler: Compiler, config: ChainConfig, options: PluginOptions) {
    const {
      context,
      hooks,
      log,
      buildPlugins,
      buildPresets,
      setValue,
      getValue,
    } = compiler;
  }
}
```

#### context

context saves the context information of render-buidler execution.

```javascript
const {
  rootDir,
  buildConfig,
  pkg,
  commandArgs,
  command,
  appConfig,
  mockConfig,
} = context;
```

| **Name**    | **Type** | **Description**                                                                     |
| ----------- | -------- | ----------------------------------------------------------------------------------- |
| rootDir     | `string` | Project root                                                                        |
| buildConfig | `Object` | Build configuration (Contents in render-builder configuration file)                 |
| pkg         | `Object` | Package.json information                                                            |
| commandArgs | `Object` | Command line parameters                                                             |
| command     | `string` | Command                                                                             |
| appConfig   | `Object` | Application configuration （The contents of app.json under the project src folder） |
| mockConfig  | `Object` | Mock configuration (The contents of mock.json in the project src folder)            |

#### hooks

Use hooks to monitor the running process of render-builder.

- afterConfigLoaded: Called after the configuration file is loaded
- afterServerStarted: Called after the server is started
- afterBuild: Called after the build is completed
- failed: Called when the build fails

```javascript
hooks.afterConfigLoaded.tap("afterConfigLoaded", ({ commandArgs, config }) => {
  console.log(commandArgs);
  // output  Build  configuration (webpack、vite、rollup)
  console.log(config);
});

hooks.afterServerStarted.tap(
  "afterServerStarted",
  ({
    commandArgs,
    config,
    url,
    urls = {
      lanUrlForConfig,
      lanUrlForTerminal,
      lanUrlForBrowser,
      localUrlForTerminal,
      localUrlForBrowser,
    },
  }) => {
    openBrowser(url);
  }
);

hooks.afterBuild.tap(
  "afterBuild",
  ({
    commandArgs,
    config,
    url,
    urls = {
      lanUrlForConfig,
      lanUrlForTerminal,
      lanUrlForBrowser,
      localUrlForTerminal,
      localUrlForBrowser,
    },
    compileRes,
    stats,
  }) => {}
);

hooks.failed.tap("failed", ({ error }) => {
  console.error(error);
});
```

#### setValue && getValue

```javascript
class Demo1 extends WebpackBuilderPluginClass {
  run(compiler: Compiler, config: ChainConfig, options: PluginOptions) {
    const { setValu } = compiler;
    setValue("demo1", "datas");
  }
}

class Demo2 extends WebpackBuilderPluginClass {
  run(compiler: Compiler, config: ChainConfig, options: PluginOptions) {
    const { getValue } = compiler;
    const data = getValue("demo1");
    console.log(data); // datas
  }
}
```

### config

config is a webpack-chain object

### options

options are the configuration options required by the plug-in

[View more plugin writing examples](https://github.com/render-x/render-webpack-config/tree/master/packages)

## Write a preset

Preset is actually a collection of plugins,For example, the following is a preset for compiling react components:

```javascript
import EmitEsmCjsWebpackPlugin from "@x.render/emit-esm-cjs-webpack-plugin";
import StaticAssetsWebpackPlugin from "@x.render/static-assets-webpack-plugin";
import StyleWebpackPlugin from "@x.render/style-webpack-plugin";
import OptimizationWebpackPlugin from "@x.render/optimization-webpack-plugin";
import ReactBabelWebpackPlugin from "@x.render/react-babel-webpack-plugin";
import ReactComponentWebpackPlugin from "@x.render/react-component-webpack-plugin";

const buildReactComponentWebpackPreset = {
  install() {
    return [
      EmitEsmCjsWebpackPlugin,
      StaticAssetsWebpackPlugin,
      StyleWebpackPlugin,
      OptimizationWebpackPlugin,
      ReactBabelWebpackPlugin,
      ReactComponentWebpackPlugin,
    ];
  },
};
export * from "./types";
export default buildReactComponentWebpackPreset;
```

The parameters passed to preset will be passed transparently to all plug-ins. In other words, the configuration of preset is the collection of all plug-in configurations.

## Configuration file

The render-builder configuration file must be configured. The render-builder will decide which plug-ins, presets, and build tools to use to run your project based on this file.

render-builder supports configuration files in multiple formats：

- build.json
- build.config.(js|ts|mjs|mts|cjs|cts)

Here are some examples of writing configuration files:

```json
{
  "builder": "webpack",
  "plugins": [
    [ "@x.render/plugin-react-component",options]
    "@x.render/plugin-react-babel",
    "@x.render/plugin-optimization",
    "@x.render/plugin-style",
    "@x.render/plugin-static-assets",
    "@x.render/plugin-emit-esm-cjs"
  ],
  "presets": [
    "build-react-component-webpack-preset",
   [ "@x.render/build-react-component-webpack-preset",options]
  ]
}
```

Among them, builder selection can only be webpack, vite, rollup, which is used to tell render-builder what building tools to use to run the project.The builder selections can only be webpack, vite, and rollup, which are used to tell the render-builder what building tools to use to run the project.

- When your builder is set to `webpack`, your plug-in must implement `WebpackBuilderPluginClass`.
- When your builder is set to `vite`, your plug-in must implement `ViteBuilderPluginClass`.
- When your builder is set to `rollup`, your plug-in must implement `RollupBuilderPluginClass`.
