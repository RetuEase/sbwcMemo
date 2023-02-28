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
          reg: `^mem *\\*(?!=)`,
          fnc: 'memoFinishSimple',
        },
        {
          reg: `^mem *\\*=(.*)`,
          fnc: 'memoSeeFinished',
        },
        {
          reg: '^mem *clear *score',
          fnc: 'memoClearScoreAsk',
        },
        {
          reg: '^ms *(\\+|-) *\\d+',
          fnc: 'memoChangeScore',
        },
      ],
    });
  }

  /** 标记指定备忘录序号的备忘为已完成 */
  async memoFinishSimple(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const simpleMemoArr = readYamlSync(userId, 'simple') || [];
    const finishedMemoArr = readYamlSync(userId, 'finished') || [];
    const propertyObj = readYamlSync(userId, 'property') || {};
    userMsg
      .replace(/^mem *\*/, '')
      .trim()
      .split(' ')
      .forEach(finishMemoId => {
        finishMemoId = Number(finishMemoId);
        if (
          !finishMemoId ||
          finishMemoId <= 0 ||
          finishMemoId > simpleMemoArr.length
        )
          return this.reply(
            e,
            `${userName} 试图标记不存在的 第${
              finishMemoId || '啥都不是'
            }条备忘 为已完成时失败了！`
          );

        // 删备忘
        const finishedMemo = simpleMemoArr[finishMemoId - 1];
        delete simpleMemoArr[finishMemoId - 1];

        // 进完成
        finishedMemoArr.push(finishedMemo);

        // 加分
        propertyObj.score ||= 0;
        if (finishedMemo.score) propertyObj.score += +finishedMemo.score;

        this.reply(
          e,
          `${userName} 已标记第${finishMemoId}条备忘：${
            finishedMemo.memoValue
          } 为已完成！${
            finishedMemo.score ? `获得${finishedMemo.score}分` : ''
          }`,
          true
        );
      });
    writeYamlSync(
      userId,
      'simple',
      simpleMemoArr.filter(simpleMemo => simpleMemo)
    );
    writeYamlSync(userId, 'finished', finishedMemoArr);
    writeYamlSync(userId, 'property', propertyObj);
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

  /** 直接改动分数 */
  async memoChangeScore(e) {
    const chgScrMsg = e.msg.replace(/^ms/, '').trim().split(' ');

    const [symb, count] = chgScrMsg.map(msg => msg.trim()).filter(msg => msg);
    if (!'+-'.includes(symb)) return this.reply(`符号错误（${symb}）`);
    if (isNaN(Number(count))) return this.reply(`输入非数字（${count}）`);

    const change = symb === '+' ? Number(count) : -Number(count);
    const property = readYamlSync(e.user_id, 'property') || {};
    property.score ||= 0;
    property.score += change;

    writeYamlSync(e.user_id, 'property', property);
    return this.reply(`成功${symb === '+' ? '加' : '减'}分${count}`);
  }
}
