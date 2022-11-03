import { readYamlSync, writeYamlSync } from '../models/rwYamlSync.js';

/** 需要确认后再执行的函数 */

export const clearScore = function (userId, userName) {
  const propertyObj = readYamlSync(userId, 'property') || {};
  propertyObj.score = 0;
  writeYamlSync(userId, 'property', propertyObj);
  return `${userName} 清空分数成功！`;
};
