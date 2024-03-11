# @x.render/render-builder

<p>
<a href="https://www.npmjs.com/package/@x.render/render-builder" target="__blank"><img src="https://img.shields.io/npm/v/@x.render/render-builder" alt="NPM version" /></a>

<a href="https://www.npmjs.com/package/@x.render/render-builder" target="__blank"><img src="https://img.shields.io/npm/dm/%40x.render%2Frender-builder" alt="NPM Downloads" /></a>

</p>

[English document](./README.md)

## 介绍

一个基础构建器，集成了 webpack、Vite 等构建工具。

## 使用

```bash
npm install @x.render/render-builder -D
```

## 脚手架命令

render-builder 提供了两个命令 start 和 build，用于启动和编译项目。

### start

使用 start 命令运行项目并支持 cli args 传入

#### args

| **min** | **Description**                        | **Default**                                                                            |
| ------- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| config  | 指定 render-builder 使用的配置文件路径 | 项目根目录中与通配符`build.json`或`build.config(js \| ts \| mjs \| mts \| cjs \| cts)` |
| host    | 指定项目运行的主机                     | 0.0.0.0                                                                                |
| port    | 指定项目运行的端口                     | 3333                                                                                   |

默认使用 build.json，如果要使用`build.config(js \| ts \| mjs \| mts \| cjs \| cts)`类型的配置文件，请使用 config 指定配置文件路径。

```bash
npx render-builder start --config=./build.config.js  --host=0.0.0.0 --port=3333
```

### build

使用 build 命令运行编译并支持 cli args

#### args

| **Name** | **Description**                        | **Default**                                                                            |
| -------- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| config   | 指定 render-builder 使用的配置文件路径 | 项目根目录中与通配符`build.json`或`build.config(js \| ts \| mjs \| mts \| cjs \| cts)` |

```bash
npx render-builder build --config=./build.config.js
```

## 使用说明

render-builder 本身没有任何构建能力，内部集成了 webapck、vite 等构建工具。 render-builder 只负责提供统一的运行命令和统一的范式插件和预设，并根据插件和预设来决定使用哪种构建工具。

Tips：（目前仅支持 webpack）

### 架构图

![alt text](https://gw.alicdn.com/imgextra/i2/O1CN01XUnk7M1u091jxRY0S_!!6000000005974-0-tps-1356-1268.jpg)

## 编写一个 plugin

render-builder 指定了适合 webpack 的简单插件示例：

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

所有渲染构建器插件都必须实现“WebpackBuilderPluginClass”、“ViteBuilderPluginClass”和“RollupBuilderPluginClass”三个类之一。目前只有 WebpackBuilderPluginClass 实现。

使用 WebpackBuilderPluginClass 编写的插件都会有一个 getConfig 静态方法，使用 WebpackBuilderPluginClass 编写的插件会有一个 getConfig 静态方法，可以用来获取插件内部的 webpack-chain 配置。

**插件中的 run 方法，必须要返回 config，已以便于其他插件使用或者提供给 rende-builder 进行编译**

例如，以下代码可以获取 DemoWebpackPlugin 中的 webpack-chain 配置：

```javascript
const demoConfig = DemoWebpackPlugin.getConfig(
  compiler,
  config,
  DemoWebpackPluginOptions
);
```

每个插件的 run 方法中都可以获取`compiler`、`config`、`options`参数，这些参数可以用来增强插件的能力。

### Compiler

Compiler 是 render-builder 执行时的一个对象。它提供了许多属性和方法来帮助编写插件。

| **Name**     | **Type**   | **Description**                                                    |
| ------------ | ---------- | ------------------------------------------------------------------ |
| context      | `Object`   | 编译上下文                                                         |
| hooks        | `Object`   | 提供 render-builder 生命周期监控功能                               |
| log          | `Function` | 输出函数                                                           |
| buildPlugins | `Array`    | 保存 render-builder 编译时使用的 plugin 信息                       |
| buildPresets | `Array`    | 保存 render-builder 编译时使用的 preset 信息                       |
| setValue     | `Function` | 用于插件之间的通信。使用此方法将内容保存到 render-builder          |
| setValue     | `Function` | 用于插件之间的通信。使用此方法将获取保存到 render-builder 中的内容 |

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

context 保存了 render-buidler 执行的上下文信息。

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

| **Name**    | **Type** | **Description**                                 |
| ----------- | -------- | ----------------------------------------------- |
| rootDir     | `string` | render-builder 当前执行的目录                   |
| buildConfig | `Object` | 构建配置（render-build 配置文件中的内容）       |
| pkg         | `Object` | 项目 packge.json                                |
| commandArgs | `Object` | 脚手架命令参数                                  |
| command     | `string` | 执行的命令名称                                  |
| appConfig   | `Object` | 应用配置（项目 src 文件夹下 app.json 的内容     |
| mockConfig  | `Object` | Mock 配置（项目 src 文件夹中 mock.json 的内容） |

#### hooks

使用 hooks 来监控 render-builder 的运行过程。

- afterConfigLoaded: 配置文件加载后调用
- afterServerStarted: 服务器启动后调用
- afterBuild: 构建完成后调用
- failed: 构建失败时调用

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

config 是一个 webpack-chain 对象

### options

options 是插件需要的配置选项
[查看更多插件编写例子](https://github.com/render-x/render-webpack-config/tree/master/packages)

## Write a preset

Preset 其实就是一个插件的集合，比如下面是一个用于编译 react 组件的 preset：

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

传递给 preset 的参数将传递给所有插件。也就是说，preset 的配置是所有插件配置的集合。

## Configuration file

必须配置 render-build 配置文件。render-builder 将根据此文件决定使用哪些 plugin、preset 和构建工具来运行您的项目。

render-builder 支持多种格式的配置文件：

- build.json
- build.config.(js|ts|mjs|mts|cjs|cts)

以下是一些编写配置文件的示例：

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

其中 builder 只能是 webpack、vite、rollup，用于告诉 render-builder 使用什么构建工具来运行项目。builder Selection 只能是 webpack、vite、rollup，用于告诉 render-builder 使用什么构建工具来运行项目。

- 当您的构建器设置为`webpack`时，您的插件必须实现`WebpackBuilderPluginClass`。
- 当您的构建器设置为`vite`时，您的插件必须实现`ViteBuilderPluginClass`。
- 当您的构建器设置为`rollup`时，您的插件必须实现`RollupBuilderPluginClass`。
