# hel-mono
hel-mono 是一个基于 hel-micro 和 pnpm 向上提炼的微模块大仓化开发架构，该架构下沉hel-micro sdk到编译阶段，可让用户无需用户感知到微模块存在，并通过不同的命令入口，编译出一体化产物（不含微模块），分布式产物（包含微模块），让用户针对不同场景（如私有部署场景、公有云架构等）做出更灵活的选择。

## 特点
* 基础设置统一（lint，webpack.config，public模板等...）
* 中心化配置宿主，子模块均支持别名、端口、helpack映射（微模块构建需要）等
* 同时支持一体化构建（传统模式），分布式构建（微模块模式）
* 微模块模式下，会自动分析相关依赖注入模板代码（如子模块导出，宿主注入等全程自动化）
* 提供和目录一直快捷命令行模式
* 支持扩展更多命令行（创建新的宿主，子模块等...）

## 启动与构建
以下命令行均在根目录执行

```bash
# 普通模式-启动基座，会转为 pnpm --filter hub run start 来启动 hub
npm start hub

# 普通模式-构建基座，会转为 pnpm --filter hub run build 来构建 hub
# 等效于根目录执行 npm run build hub
npm start .build hub

# 启动子模块
npm start mono-comps-in-one-v2
# hel模式-启动基座，会转为 pnpm --filter hub run start:hel 来启动 hel 模式的 hub
npm start hub:hel

# 转为 pnpm --filter hub run build:hel 来构建 hub
# 等效于根目录执行 npm run build:hel hub
npm start .build hub:hel
```


## 创建宿主
使用 `.create` 关键字创建宿主应用

```bash
# 创建一个名为 my-app 的应用
npm start .create my-app

# 创建一个名为 my-app 的应用并启动
npm start .create-start my-app
npm start .cs my-app
```

## 初始化微模块配置
使用 `.init` 关键字为目标应用初始化微模块配置，初始化即可使用微模块方式启动
> 仅首次启动时才需执行

```bash
# 会自动分析它的孩子依赖并为孩子依赖创建微模块配置
npm start .init my-app
```

## 多路径查询&启动
支持别名、父目录/目录名、目录名、包名4种方式去命中应用并启动

```bash
npm start @mc  
npm start packages/mono-comps-in-one-v2
npm start mono-comps-in-one-v2
```