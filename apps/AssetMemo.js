import { _ParentClass } from './_ParentClass/_ParentClass.js';
import { readYamlSync, writeYamlSync } from '../models/rwYamlSync.js';
import { execArr } from './MemoListener.js';
import { delFile } from '../models/fileSystem.js';

/**
 * 资源库添加、查看与删除
 */

const ASSET_MEMO_PRIOR = 200;

export class AssetMemo extends _ParentClass {
  constructor() {
    super({
      name: 'AssetMemo',
      dsc: '资源库添加、查看与删除',
      event: 'message',
      priority: ASSET_MEMO_PRIOR,
      rule: [
        {
          reg: `^m(em)?ass *${'\\'}+(.*)`,
          fnc: 'memoAddAsset',
        },
        {
          reg: `^m(em)?ass(.*?)=(.*)`,
          fnc: 'memoSeeAsset',
        },
        {
          reg: `^m(em)?ass *pic(.*)`,
          fnc: 'memoGetAsset',
        },
        {
          reg: `^m(em)?ass *-(.*)`,
          fnc: 'memoDelAsset',
        },
      ],
    });
  }

  /** 添加一项新的资源 */
  async memoAddAsset(e) {
    const userId = e.user_id;
    const userMsg = e.msg;

    const group = userMsg.replace(/^m(em)?ass *\+/, '').trim();
    execArr.push({ userId, group, fnc: 'addAsset' });
    await this.reply(e, '请发送图片或文字');
  }

  /** 查看当前资源库 */
  async memoSeeAsset(e) {
    const userId = e.user_id;
    const userMsg = e.msg;

    const group = userMsg
      .replace(/^m(em)?ass/, '')
      .split('=')[0]
      .trim();
    const page = Number(userMsg.replace(/^m(em)?ass(.*?)=/, '').trim());
    const assetArr = readYamlSync(userId, 'asset') || [];

    const replyMsg = await this.formatAssets(e, assetArr, group, page);

    await this.reply(e, replyMsg);
  }

  /** 获取某一项资源 */
  async memoGetAsset(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const getAssetId = Number(userMsg.replace(/^m(em)?ass *pic/, '').trim());
    const assetArr = readYamlSync(userId, 'asset') || [];
    if (!getAssetId || getAssetId <= 0 || getAssetId > assetArr.length)
      return await this.reply(
        e,
        `${userName} 试图获取不存在的 第${getAssetId || '?'}号资源 时失败了！`
      );

    const replyMsg = await this.formatAsset(e, assetArr[getAssetId - 1]);

    if (!replyMsg) return await this.reply(e, '出错了', true);
    await this.reply(e, replyMsg, true);
  }

  /** 删除指定资源库序号的资源 */
  async memoDelAsset(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const delAssetId = Number(userMsg.replace(/^m(em)?ass *-/, '').trim());
    const assetArr = readYamlSync(userId, 'asset') || [];
    if (!delAssetId || delAssetId <= 0 || delAssetId > delAssetId.length)
      return await this.reply(
        e,
        `${userName} 试图删除不存在的 第${delAssetId || '?'}号资源 时失败了！`
      );

    const assetObj = assetArr.splice(delAssetId - 1, 1)[0];
    let delRet = true;
    if (assetObj.type === 'image')
      delRet = delFile(userId, 'image', assetObj.file);
    else if (assetObj.type === 'file')
      delRet = delFile(userId, 'file', assetObj.name);

    writeYamlSync(userId, 'asset', assetArr);

    await this.reply(
      e,
      `${userName} 删除第${delAssetId}号资源 成功！${
        delRet ? '' : '（该资源似乎早已损坏）'
      }`,
      true
    );
  }
}
