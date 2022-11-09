import { readYamlSync, writeYamlSync } from '../models/rwYamlSync.js';
import { addUniqueFile } from './fileSystem.js';

/** 需要确认后再执行的函数 */

/** 清空分数 */
export const clearScore = function (userId, userName) {
  const propertyObj = readYamlSync(userId, 'property') || {};
  propertyObj.score = 0;
  writeYamlSync(userId, 'property', propertyObj);
  return `${userName} 清空分数成功！`;
};

/** 添加资源 */
export const addAsset = async function (e, exec) {
  const userId = e.user_id;
  const userName = e.sender.card;
  const userMsg = e.message[0];
  const { group } = exec;

  const type = userMsg.type;
  const assetArr = readYamlSync(userId, 'asset') || [];

  if (type === 'text') {
    assetArr.push({ type, group, text: userMsg.text });
    writeYamlSync(userId, 'asset', assetArr);
    return `${userName} 添加文本资源成功`;
  }
  if (type === 'image') {
    const file = await addUniqueFile(
      userMsg.url,
      userId,
      'images',
      userMsg.file
    );
    if (!file) return `${userName} 发送的图片下载失败了qaq`;

    assetArr.push({ type, group, file, asface: userMsg.asface });
    writeYamlSync(userId, 'asset', assetArr);
    return `${userName} 添加图片资源成功`;
  }
  if (type === 'file') {
    let url;
    if (e.isPrivate) url = await e.friend.getFileUrl(userMsg.fid);
    if (e.isGroup) url = await e.group.getFileUrl(userMsg.fid);
    if (!url) return `${userName} 读不到你发的文件，我们加了好友吗qaq`;

    const name = await addUniqueFile(url, userId, 'files', userMsg.name);
    if (!name) return `${userName} 发送的文件下载失败了qaq`;

    assetArr.push({ type, group, name });
    writeYamlSync(userId, 'asset', assetArr);
    return `${userName} 添加文件资源成功`;
  }
  if (type === 'json') {
    assetArr.push({ type, group, data: userMsg.data });
    writeYamlSync(userId, 'asset', assetArr);
    return `${userName} 添加分享链接资源成功`;
  }

  return `${userName} 暂不支持添加这种类型的资源`;
};
