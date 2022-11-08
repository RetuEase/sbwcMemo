import fs from 'node:fs';
import common from '../../../lib/common/common.js';

// const absPath = process.cwd().replace(/\\/g, '/');

export const getFilePath = function (userId, type) {
  const folder = `./plugins/sbwcMemo/data/${userId}/${type}`;
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  return folder;
};

/** 添加不重复的文件(不自动添加后缀)，下载失败返回false，成功返回文件名 */
export const addUniqueFile = async function (url, userId, type, name) {
  const folder = getFilePath(userId, type);

  let duplicateCount = 0;
  let path = `${folder}/${name}`;
  while (fs.existsSync(path)) {
    const names = name.split('.');
    // 如果有后缀名
    if (names.length > 1) {
      const noSuffix = names.slice(0, -1).join('.');
      const suffix = `.${names.at(-1)}`;
      path = `${folder}/${noSuffix}(${++duplicateCount})${suffix}`;
    } else path = `${folder}/${path}(${++duplicateCount})`;
    // 如果陷入死循环，退出
    if (path > 10000) return false;
  }

  const ret = await common.downFile(url, path); // Yunzai自带的下载函数，失败了返回false
  if (!ret) return false;

  return path.split('/').at(-1);
};

/** 删除文件 */
export const delFile = function (userId, type, name) {
  const folder = getFilePath(userId, type);

  const path = `${folder}/${name}`;
  if (!fs.existsSync(path)) return false;
  fs.rmSync(path, { recursive: true });
  return true;
};
