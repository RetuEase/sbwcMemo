import { _ParentClass } from './_ParentClass/_ParentClass.js';
import * as Exe from '../models/execute.js';

/**
 * 监听
 */

const MEMO_LISTENER_PRIOR = 1000;

export const verifyArr = [];
export const execArr = [];

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
          log: false,
        },
      ],
    });
  }

  async memoListen(e) {
    // images(
    //   './plugins/sbwcMemo/data/1099177812/images/b32e3cb92616e1051f40918ca2da24fd292493-1203-1288.jpg'
    // )
    //   .size(100, 100)
    //   .save('./plugins/sbwcMemo/data/1099177812/images/1.jpg');
    // this.reply(
    //   e,
    //   segment.image('./plugins/sbwcMemo/data/1099177812/images/1.jpg')
    // );
    // 确认，userId,fnc,name
    if (verifyArr.length > 0) return await this.verify(e);
    // 执行，userId,fnc,...
    if (execArr.length > 0) return await this.execute(e);
    // 并没有
    return false;
  }

  /** 确认数组 中的任务 */
  async verify(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const index = verifyArr.findIndex(verify => verify.userId === userId);
    if (index < 0) return false;

    if (userMsg.toLowerCase() === 'yes') {
      const verify = verifyArr.splice(index, 1)[0];
      const replyMsg = await Exe[verify.fnc](userId, userName);
      await this.reply(e, replyMsg, true);
    } else {
      const verify = verifyArr.splice(index, 1)[0];
      await this.reply(e, `${verify.name}已取消！`, true);
    }
  }

  /** 执行数组 中的任务 */
  async execute(e) {
    const userId = e.user_id;

    const index = execArr.findIndex(exec => exec.userId === userId);
    if (index < 0) return false;

    const exec = execArr.splice(index, 1)[0];
    const replyMsg = await Exe[exec.fnc](e, exec);
    await this.reply(e, replyMsg, true);
  }
}
