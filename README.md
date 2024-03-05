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

Use build command to run compilation and support cli args OK

### start

Use the start command to run the project and support cli args passing in

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

### Write a plugin

### Write a preset

### Configuration file
