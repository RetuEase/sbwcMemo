import fs from 'node:fs';
import YAML from 'yaml';

/** 读写yaml工具包 */

/** 后面已经自带yaml后缀了 */
export const getYamlPath = function (userId, name) {
  const folder = `./plugins/sbwcMemo/data/${userId}`;
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  return `${folder}/${name}.yaml`;
};

/**
 * 读某个yaml
 * @param {String} name 文件名'simple'
 * @returns yaml的obj/array 若读不到返回false
 */
export const readYamlSync = function (userId, name) {
  const path = getYamlPath(userId, name);
  // 如果路径存在且是文件
  if (fs.existsSync(path) && fs.statSync(path).isFile())
    return YAML.parse(fs.readFileSync(path, 'utf-8'));
  else return false;
};

/**
 * 写某个yaml
 * @param {String} name 文件名'simple'
 * @param obj 写入的obj/array
 */
export const writeYamlSync = function (userId, name, obj) {
  const path = getYamlPath(userId, name);
  return fs.writeFileSync(path, YAML.stringify(obj), 'utf-8');
};
