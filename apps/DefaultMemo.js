import { _ParentClass } from './_ParentClass/_ParentClass.js';
import { readYamlSync } from '../models/rwYamlSync.js';

/**
 * 简单的备忘录帮助、创建、查看与删除
 */

const DEFAULT_MEMO_PRIOR = 500;

export class DefaultMemo extends _ParentClass {
  constructor() {
    super({
      name: 'DefaultMemo',
      dsc: '参数缺省时的默认函数',
      event: 'message',
      priority: DEFAULT_MEMO_PRIOR,
      rule: [
        {
          reg: '^mem *$',
          fnc: 'memo',
        },
        {
          reg: '^m(em)?ass *$',
          fnc: 'memoAsset',
        },
        {
          reg: '^m[(em)|(ass)]*',
          fnc: 'memoX',
        },
      ],
    });
  }

  /** 缺省：快速查看备忘录 */
  async memo(e) {
    const userId = e.user_id;
    const userName = e.sender.card;

    const simpleMemoArr = readYamlSync(userId, 'simple') || [];
    const propertyObj = readYamlSync(userId, 'property') || {};

    const replyMsg = this.formatMemo(userName, simpleMemoArr, propertyObj);

    await this.reply(e, replyMsg, true);
  }

  /** 缺省：快速查看资源库 */
  async memoAsset(e) {
    const userId = e.user_id;

    const assetArr = readYamlSync(userId, 'asset') || [];

    const replyMsg = await this.formatAssets(e, assetArr);

    await this.reply(e, replyMsg);
  }

  /** 输入错误：发送提示 */
  async memoX(e) {
    await this.reply(e, '发送memhelp可查看帮助——sbwcMemo', true);
  }
}
