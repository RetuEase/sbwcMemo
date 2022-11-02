import { _ParentClass } from './_ParentClass/_ParentClass.js';
import { readYamlSync, writeYamlSync } from '../models/rwYamlSync.js';

/**
 * 简单的备忘录帮助、创建、查看与删除
 */

const SIMPLE_MEMO_PRIOR = 100;

export class SimpleMemo extends _ParentClass {
  constructor() {
    super({
      name: 'SimpleMemo',
      dsc: '简单的备忘录帮助、创建、查看与删除',
      event: 'message',
      priority: SIMPLE_MEMO_PRIOR,
      rule: [
        {
          reg: '^#备忘帮助',
          fnc: 'memoHelpSimple',
        },
        {
          reg: `^#备忘${'\\'}+(.*)`,
          fnc: 'memoAddSimple',
        },
        {
          reg: '^#备忘=(.*)',
          fnc: 'memoSeeSimple',
        },
        {
          reg: '^#备忘-(.*)',
          fnc: 'memoDelSimple',
        },
      ],
    });
  }

  /** 备忘帮助 */
  async memoHelpSimple(e) {
    const { title, contents } = readYamlSync('config', 'help');
    const curVer = readYamlSync('config', 'version').curVer;

    await this.reply(e, `${title}-${curVer}`, true);
    const arrangedContents = contents.map(
      appDsc => `${appDsc.app}: ${appDsc.dsc}`
    );
    await this.reply(e, await this.makeForwardMsg(arrangedContents), true);

    return;
  }

  /** 添加备忘 */
  async memoAddSimple(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const memoValue = userMsg.replace(/^#备忘\+/, '').trim();
    if (!memoValue)
      return await this.reply(e, `${userName} 添加空气 成功！`, true);
    const simpleMemoArr = readYamlSync(userId, 'simple') || [];

    memoValue.split('\r').forEach(memoValue => {
      if (memoValue) simpleMemoArr.push({ memoValue });
    });
    writeYamlSync(userId, 'simple', simpleMemoArr);

    await this.reply(e, `${userName} 添加 ${memoValue} 成功！`, true);
  }

  /** 查看当前备忘录 */
  async memoSeeSimple(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const page = Number(userMsg.replace(/^#备忘=/, '').trim());
    let actualPage;
    let simpleMemoArr = readYamlSync(userId, 'simple') || [];
    simpleMemoArr = simpleMemoArr.map(
      (memoObj, index) => `${index + 1}: ${memoObj.memoValue}`
    );
    console.log(simpleMemoArr);
    if (page && page > 0) {
      if (page * 10 < simpleMemoArr.length) {
        actualPage = page;
        simpleMemoArr = simpleMemoArr.slice((page - 1) * 10, page * 10);
        console.log(page, simpleMemoArr);
      } else {
        actualPage = Math.trunc(simpleMemoArr.length / 10) + 1;
        simpleMemoArr = simpleMemoArr.slice((page - 1) * 10);
      }
    }

    await this.reply(
      e,
      `${userName}の备忘录${actualPage ? `[PAGE ${actualPage}]` : ''}`,
      true
    );
    await this.reply(e, await this.makeForwardMsg(simpleMemoArr), true);
  }

  /** 删除指定备忘录序号的备忘 */
  async memoDelSimple(e) {
    const userId = e.user_id;
    const userName = e.sender.card;
    const userMsg = e.msg;

    const delMemoId = Number(userMsg.replace(/^#备忘-/, '').trim());
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
