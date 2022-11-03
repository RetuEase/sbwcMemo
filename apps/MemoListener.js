import { _ParentClass } from './_ParentClass/_ParentClass.js';
import * as Exe from '../models/execute.js';

/**
 * 监听
 */

const MEMO_LISTENER_PRIOR = 1000;

export const verifyArr = [];

export class MemoListener extends _ParentClass {
  constructor() {
    super({
      name: 'MemoListener',
      dsc: '监听',
      event: 'message',
      priority: MEMO_LISTENER_PRIOR,
      rule: [
        {
          reg: '(.*)',
          fnc: 'memoListen',
        },
      ],
    });
  }
  async memoListen(e) {
    if (verifyArr.length < 1) return;

    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;
    for (let i = 0; i < verifyArr.length; i++) {
      const verify = verifyArr[i];

      if (verify.userId === userId) {
        if (userMsg.toLowerCase() === 'yes') {
          verifyArr.splice(i, 1);
          const replyMsg = await Exe[verify.fnc](userId, userName);
          await this.reply(e, replyMsg, true);
        } else {
          verifyArr.splice(i, 1);
          await this.reply(e, `${verify.name}已取消！`, true);
        }
        break;
      }
    }
  }
}
