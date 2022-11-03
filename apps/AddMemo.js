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

    const memoValues = userMsg.replace(/^mem *\+/, '').trim();
    if (!memoValues)
      return await this.reply(e, `${userName} 添加空气 成功！`, true);
    const simpleMemoArr = readYamlSync(userId, 'simple') || [];

    memoValues.split(/[\r\n]/).forEach(memoValue => {
      if (memoValue) {
        // 从第二个参数开始，找到一个可转化为数字的参数设置为score，然后把这个参数删掉
        const score =
          memoValue
            .split(' ')
            .slice(1)
            .find(param => Number(param)) || false;
        if (score) memoValue = memoValue.replace(score, '').trim();

        simpleMemoArr.push({ memoValue, score });
      }
    });

    writeYamlSync(userId, 'simple', simpleMemoArr);

    await this.reply(e, `${userName} 添加 ${memoValues} 成功！`, true);
  }
}
