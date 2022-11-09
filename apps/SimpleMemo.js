import { _ParentClass } from './_ParentClass/_ParentClass.js';
import { readYamlSync, writeYamlSync } from '../models/rwYamlSync.js';

/**
 * 备忘录帮助、添加、查看与删除
 */

const SIMPLE_MEMO_PRIOR = 200;

export class SimpleMemo extends _ParentClass {
  constructor() {
    super({
      name: 'SimpleMemo',
      dsc: '备忘录帮助、添加、查看与删除',
      event: 'message',
      priority: SIMPLE_MEMO_PRIOR,
      rule: [
        {
          reg: '^mem *help',
          fnc: 'memoHelp',
        },
        {
          reg: `^mem *${'\\'}+(.*)`,
          fnc: 'memoAddSimple',
        },
        {
          reg: '^mem *=(.*)',
          fnc: 'memoSeeSimple',
        },
        {
          reg: '^mem *-(.*)',
          fnc: 'memoDelSimple',
        },
      ],
    });
  }

  /** 备忘帮助 */
  async memoHelp(e) {
    const { title, contents } = readYamlSync('config', 'help');
    const curVer = readYamlSync('config', 'version').curVer;

    const arrangedContents = contents.map(
      appDsc => `【${appDsc.app}】\n  :${appDsc.dsc}`
    );
    await this.reply(e, [`${title}-${curVer}`, ...arrangedContents].join('\n'));

    return;
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

  /** 查看当前备忘录 */
  async memoSeeSimple(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const page = Number(userMsg.replace(/^mem *=/, '').trim());
    const simpleMemoArr = readYamlSync(userId, 'simple') || [];
    const propertyObj = readYamlSync(userId, 'property') || {};

    const replyMsg = this.formatMemo(
      userName,
      simpleMemoArr,
      propertyObj,
      page
    );

    await this.reply(e, replyMsg, true);
  }

  /** 删除指定备忘录序号的备忘 */
  async memoDelSimple(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const simpleMemoArr = readYamlSync(userId, 'simple') || [];
    userMsg
      .replace(/^mem *-/, '')
      .trim()
      .split(' ')
      .forEach(delMemoId => {
        delMemoId = Number(delMemoId);
        if (!delMemoId || delMemoId <= 0 || delMemoId > simpleMemoArr.length)
          return this.reply(
            e,
            `${userName} 试图删除不存在的 第${
              delMemoId || '?'
            }条备忘 时失败了！`
          );

        const delMemo = simpleMemoArr[delMemoId - 1];
        delete simpleMemoArr[delMemoId - 1];

        this.reply(
          e,
          `${userName} 删除第${delMemoId}条备忘：${delMemo.memoValue} 成功！`,
          true
        );
      });

    writeYamlSync(
      userId,
      'simple',
      simpleMemoArr.filter(simpleMemo => simpleMemo)
    );
  }
}
