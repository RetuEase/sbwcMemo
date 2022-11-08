import { _ParentClass } from './_ParentClass/_ParentClass.js';
import { readYamlSync, writeYamlSync } from '../models/rwYamlSync.js';
import { verifyArr } from './MemoListener.js';

/**
 * 备忘的完成与分数操作
 */

const SCORE_MEMO_PRIOR = 200;

export class ScoreMemo extends _ParentClass {
  constructor() {
    super({
      name: 'ScoreMemo',
      dsc: '备忘的完成与分数操作',
      event: 'message',
      priority: SCORE_MEMO_PRIOR,
      rule: [
        {
          reg: `^mem *${'\\'}*(?!=)`,
          fnc: 'memoFinishSimple',
        },
        {
          reg: `^mem *${'\\'}*=(.*)`,
          fnc: 'memoSeeFinished',
        },
        {
          reg: '^mem *clear *score',
          fnc: 'memoClearScoreAsk',
        },
      ],
    });
  }

  /** 标记指定备忘录序号的备忘为已完成 */
  async memoFinishSimple(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    // 删备忘
    const finishMemoId = Number(userMsg.replace(/^mem *\*/, '').trim());
    const simpleMemoArr = readYamlSync(userId, 'simple') || [];
    if (
      !finishMemoId ||
      finishMemoId <= 0 ||
      finishMemoId > simpleMemoArr.length
    )
      return await this.reply(
        e,
        `${userName} 试图标记不存在的 第${
          finishMemoId || '啥都不是'
        }条备忘 为已完成时失败了！`
      );

    const finishedMemo = simpleMemoArr.splice(finishMemoId - 1, 1)[0];
    writeYamlSync(userId, 'simple', simpleMemoArr);

    // 进完成
    const finishedMemoArr = readYamlSync(userId, 'finished') || [];
    finishedMemoArr.push(finishedMemo);
    writeYamlSync(userId, 'finished', finishedMemoArr);

    // 加分
    const propertyObj = readYamlSync(userId, 'property') || {};
    propertyObj.score ||= 0;
    if (finishedMemo.score) propertyObj.score += +finishedMemo.score;
    writeYamlSync(userId, 'property', propertyObj);

    await this.reply(
      e,
      `${userName} 已标记第${finishMemoId}条备忘 为已完成！${
        finishedMemo.score ? `获得${finishedMemo.score}分` : ''
      }`,
      true
    );
  }

  /** 查看已完成列表 */
  async memoSeeFinished(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const page = Number(userMsg.replace(/^mem *\*=/, '').trim());
    const finishedMemoArr = readYamlSync(userId, 'finished') || [];

    const replyMsg = this.formatFinished(userName, finishedMemoArr, page);

    await this.reply(e, replyMsg, true);
  }

  /** 清空分数询问 */
  async memoClearScoreAsk(e) {
    const userId = e.user_id;

    verifyArr.push({ userId, fnc: 'clearScore', name: '清空分数' });
    await this.reply(e, '确定要清空吗？输入Yes确认');
  }
}
