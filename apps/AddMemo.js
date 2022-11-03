import { _ParentClass } from './_ParentClass/_ParentClass.js';
import { readYamlSync, writeYamlSync } from '../models/rwYamlSync.js';

/**
 * 简单的备忘录创建
 */

const ADD_MEMO_PRIOR = 200;

export class AddMemo extends _ParentClass {
  constructor() {
    super({
      name: 'SimpleMemo',
      dsc: '简单的备忘录创建',
      event: 'message',
      priority: ADD_MEMO_PRIOR,
      rule: [
        {
          reg: `^mem *${'\\'}+(.*)`,
          fnc: 'memoAddSimple',
        },
      ],
    });
  }

  /** 添加备忘 */
  async memoAddSimple(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const memoValue = userMsg.replace(/^mem *\+/, '').trim();
    if (!memoValue)
      return await this.reply(e, `${userName} 添加空气 成功！`, true);
    const simpleMemoArr = readYamlSync(userId, 'simple') || [];

    memoValue.split(/[\r\n]/).forEach(memoValue => {
      if (memoValue) simpleMemoArr.push({ memoValue });
    });
    writeYamlSync(userId, 'simple', simpleMemoArr);

    await this.reply(e, `${userName} 添加 ${memoValue} 成功！`, true);
  }
}
