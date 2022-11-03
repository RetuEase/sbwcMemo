import { _ParentClass } from './_ParentClass/_ParentClass.js';
import { readYamlSync, writeYamlSync } from '../models/rwYamlSync.js';

/**
 * 简单的备忘录帮助、查看与删除
 */

const SIMPLE_MEMO_PRIOR = 200;

export class SimpleMemo extends _ParentClass {
  constructor() {
    super({
      name: 'SimpleMemo',
      dsc: '简单的备忘录帮助、查看与删除',
      event: 'message',
      priority: SIMPLE_MEMO_PRIOR,
      rule: [
        {
          reg: '^mem *help',
          fnc: 'memoHelp',
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

  /** 查看当前备忘录 */
  async memoSeeSimple(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const page = Number(userMsg.replace(/^mem *=/, '').trim());
    const simpleMemoArr = readYamlSync(userId, 'simple') || [];
    const propertyObj = readYamlSync(userId, 'property') || {};

    const replyMsg = await this.formatMemo(
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

    const delMemoId = Number(userMsg.replace(/^mem *-/, '').trim());
    const simpleMemoArr = readYamlSync(userId, 'simple') || [];
    if (!delMemoId || delMemoId <= 0 || delMemoId > simpleMemoArr.length)
      return await this.reply(
        e,
        `${userName} 试图删除不存在的 第${
          delMemoId || '啥都不是'
        }条备忘 时失败了！`
      );

    simpleMemoArr.splice(delMemoId - 1, 1);

    writeYamlSync(userId, 'simple', simpleMemoArr);

    await this.reply(e, `${userName} 删除第${delMemoId}条备忘 成功！`, true);
  }
}
