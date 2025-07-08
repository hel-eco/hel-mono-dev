const path = require('path');
const fs = require('fs');
const { getCWD } = require('./base');

let curMonoRootInfo = null;

function getPath(list, lastIdx) {
  const tmpList = [];
  for (let i = 0; i <= lastIdx; i++) {
    tmpList.push(list[i]);
  }
  return tmpList.join(path.sep);
}

function getHelAssociatePath(monoRoot) {
  const monoRootHelDir = path.join(monoRoot, './.hel');
  const monoRootHelLog = path.join(monoRoot, './.hel/hel-all.log');
  return { monoRootHelDir, monoRootHelLog };
}

exports.setMonoRoot = function (rootPath) {
  const { monoRootHelDir, monoRootHelLog } = getHelAssociatePath(rootPath);
  curMonoRootInfo = {
    monoRoot: rootPath,
    monoRootHelDir,
    monoRootHelLog,
  };
  return curMonoRootInfo;
};

/**
 * 获取大仓根目录信息
 */
exports.getMonoRootInfo = function () {
  if (curMonoRootInfo) {
    return curMonoRootInfo;
  }

  const cwd = getCWD();
  const list = cwd.split(path.sep);
  const len = list.length;
  const mayRootPaths = [
    cwd, // getPath(len - 1)
    getPath(list, len - 2),
    getPath(list, len - 3),
    // 最深可能是 /user/path/to/hel-mono/.hel/apps/hub，故至多 len-4 即可查到大仓根目录
    getPath(list, len - 4),
  ];

  let monoRoot = '';
  for (let i = 0; i < mayRootPaths.length; i++) {
    const mayRootPath = mayRootPaths[i];
    const pnpmWorkspacePath = path.join(mayRootPath, './pnpm-workspace.yaml');
    if (fs.existsSync(pnpmWorkspacePath)) {
      monoRoot = mayRootPath;
      break;
    }
  }

  if (!monoRoot) {
    throw new Error(`can not decide mono root path for cwd(${cwd})`);
  }

  const { monoRootHelDir, monoRootHelLog } = getHelAssociatePath(monoRoot);
  // 确定完毕 root 路径信息，确保一下 .hel 目录存在
  if (!fs.existsSync(monoRootHelDir)) {
    fs.mkdirSync(monoRootHelDir);
  }

  curMonoRootInfo = { monoRoot, monoRootHelDir, monoRootHelLog };
  return curMonoRootInfo;
};
