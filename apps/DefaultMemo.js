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
          reg: '^mem *',
          fnc: 'memo',
        },
      ],
    });
  }

  /** 缺省：查看当前备忘录 */
  async memo(e) {
    const userId = e.user_id;
    const userName = e.sender.card;

    const simpleMemoArr = readYamlSync(userId, 'simple') || [];
    const propertyObj = readYamlSync(userId, 'property') || {};

    const replyMsg = await this.formatMemo(
      userName,
      simpleMemoArr,
      propertyObj
    );

    await this.reply(e, replyMsg, true);
  }
}
