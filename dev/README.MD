
# dev 目录说明

`config`, `public`, `scripts` 是 [react-create-app](https://facebook.github.io/create-react-app/docs/getting-started) 命令行
创建的应用并弹射出去后的文件，迁移到 hel-mono 顶层做进一步定制。

`root-scripts` 是 hel-mono 根目录 `package.json` 运行各种 npm 命令需要的脚本

`tpl` 是 hel-mono 需要注入 hel 逻辑的模板目录

`base` 是 `root-scripts` 和 `config`, `public`, `scripts` 目录公共复用的逻辑

`doc` 是记录一些关键问题的文档目录

`mono-helper` 大仓助手，所有核心逻辑都在其中，将来会抽为独立的npm包