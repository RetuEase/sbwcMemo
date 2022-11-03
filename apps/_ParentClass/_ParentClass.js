import plugin from '../../../../lib/plugins/plugin.js';
import { segment } from 'oicq';
import { getStrLen } from '../../models/misc.js';

export class _ParentClass extends plugin {
  constructor(defineObj) {
    super(defineObj);
  }

  /**
   * 将一个数组的消息转化为合并转发消息
   * @param msg 消息数组
   * @returns 合并转发消息
   */
  async makeForwardMsg(msg) {
    const fMsg = msg.map(m => {
      return { message: m, nickname: Bot.nickname, user_id: Bot.uin };
    });
    return Bot.makeForwardMsg(fMsg);
  }

  async formatMemo(userName, simpleMemoArr, propertyObj, page = false) {
    let actualPage; // 实际展示的页数，全部展示则为undefined

    simpleMemoArr = simpleMemoArr.map(
      (memoObj, index) =>
        `[${index + 1}]: ${memoObj.memoValue}${
          memoObj.score ? ` ${memoObj.score}分` : ''
        }`
    );

    // 有page且大于0就不全部展示了
    if (page && page > 0) {
      if (page * 10 < simpleMemoArr.length) {
        actualPage = page;
        simpleMemoArr = simpleMemoArr.slice((page - 1) * 10, page * 10);
      } else {
        actualPage = Math.trunc(simpleMemoArr.length / 10) + 1;
        simpleMemoArr = simpleMemoArr.slice((page - 1) * 10);
      }
    }

    const title = `--${userName}の备忘录${
      actualPage ? `[PAGE ${actualPage}]` : ''
    }`;
    const padEnd = 24 - getStrLen(title);
    const formatTitle = title.padEnd(title.length + padEnd, '-');

    const score = `分数: ${propertyObj.score || 0}`;

    return [formatTitle, '', score, '', ...simpleMemoArr].join('\n');
  }

  /**
   * 回复某条e
   * @param e 消息对象
   * @param msg 发送的消息，为数组的话用分割线
   * @param quote 是否at
   */
  async reply(e, msg = '', quote = false) {
    msg = Array.isArray(msg) ? msg.join('\n---------------\n') : msg;
    // 如果at且在群里就at
    if (quote && e.isGroup) msg = [segment.at(e.user_id), `\n${msg}`];
    return e.reply(msg);
  }

  /**
   * 给某位 好友 发消息
   * @param userId 好友QQ号
   * @param msg 发送的消息
   */
  async sendPrivate(userId, msg = '') {
    // 1) 获取好友对象 client.fl->Map 好友列表
    const friend = Bot.fl.get(+userId);
    // 2) 如果是好友就发送私人消息
    if (friend) {
      Bot.logger.mark(`tako发送好友消息[${friend.nickname}](${userId})`);
      // 3) client.sendPrivateMsg()
      return Bot.sendPrivateMsg(+userId, msg).catch(err =>
        Bot.logger.mark(err)
      );
    }
  }

  /**
   * 在某个群里发消息
   * @param groupId 群号
   * @param msg 发送的消息
   * @param at at的群友的QQ号
   */
  async sendGroup(groupId, msg = '', at = '') {
    // 1) 获取群对象 client.gl->Map 群列表
    const group = Bot.gl.get(+groupId);
    // 2) 如果获取到了就发送群消息
    if (group) {
      Bot.logger.mark(`tako发送群消息[${group.group_name}](${groupId})`);
      // 3) client.pickGroup()
      if (at) msg = [segment.at(+at), `\n${msg}`];
      return Bot.sendGroupMsg(+groupId, msg).catch(err => Bot.logger.mark(err));
    }
  }
}
