import { __Base } from './__Base.js';
import { segment } from 'oicq';
import { getStrLen } from '../../models/misc.js';
import { getFilePath } from '../../models/fileSystem.js';

export class _ParentClass extends __Base {
  constructor(defineObj) {
    super(defineObj);
  }

  /** 按格式输出备忘录 */
  formatMemo(userName, simpleMemoArr, propertyObj, page = false) {
    let actualPage; // 实际展示的页数，全部展示则为undefined

    simpleMemoArr = simpleMemoArr.map(
      (memoObj, index) =>
        `[${index + 1}]: ${memoObj.memoValue}${
          memoObj.score ? ` ${memoObj.score}分` : ''
        }`
    );

    // 有page且大于0就不全部展示了
    if (page && page > 0) {
      if (page * 10 <= simpleMemoArr.length) {
        actualPage = page;
        simpleMemoArr = simpleMemoArr.slice((page - 1) * 10, page * 10);
      } else {
        actualPage = Math.trunc((simpleMemoArr.length - 1) / 10) + 1;
        simpleMemoArr = simpleMemoArr.slice((actualPage - 1) * 10);
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

  /** 按格式输出完成列表 */
  formatFinished(userName, finishedArr, page = false) {
    let actualPage; // 实际展示的页数，全部展示（最多50）则为undefined

    finishedArr = finishedArr.map(
      (finishedObj, index) =>
        `[${index + 1}]: ${finishedObj.memoValue}${
          finishedObj.score ? ` ${finishedObj.score}分` : ''
        }`
    );

    // 有page且大于0就不全部展示了
    if (page && page > 0) {
      if (page * 10 <= finishedArr.length) {
        actualPage = page;
        finishedArr = finishedArr.slice((page - 1) * 10, page * 10);
      } else {
        actualPage = Math.trunc((finishedArr.length - 1) / 10) + 1;
        finishedArr = finishedArr.slice((actualPage - 1) * 10);
      }
    } else if (finishedArr.length > 50)
      finishedArr = `...未展示的${finishedArr.length - 50}条已完成备忘`.concat(
        finishedArr.slice(-50)
      );

    const title = `-${userName}の已完成列表${
      actualPage ? `[PAGE ${actualPage}]` : ''
    }`;
    const padEnd = 24 - getStrLen(title);
    const formatTitle = title.padEnd(title.length + padEnd, '-');

    return [formatTitle, '', ...finishedArr].join('\n');
  }

  /** 按格式输出资源列表 */
  async formatAssets(e, assetArr, group = '', page = false) {
    const userId = e.user_id;
    const userName = e.sender.card;
    let actualPage; // 实际展示的页数，全部展示（最多50）则为undefined

    const inGroup = gname => (group ? gname === group : true);
    assetArr = assetArr
      .map((assetObj, index) => {
        const number = `[${index + 1}${
          assetObj.group ? `|${assetObj.group}` : ''
        }]:`;
        if (assetObj.type === 'text' && inGroup(assetObj.group))
          return `${number} ${assetObj.text}`;
        if (assetObj.type === 'image' && inGroup(assetObj.group)) {
          const path = getFilePath(userId, 'images');
          return [
            `${number}`,
            {
              asface: assetObj.asface,
              ...segment.image(`${path}/${assetObj.file}`),
            },
          ];
        }
        if (assetObj.type === 'file' && inGroup(assetObj.group))
          return `${number} ${assetObj.name}`;
        if (assetObj.type === 'json' && inGroup(assetObj.group))
          return [`${number}`, segment.json(assetObj.data)];
        if (inGroup(assetObj.group))
          return `[${index + 1}${assetObj.group}]: 出错了`;
      })
      .filter(assetObj => assetObj); // 滤除无效值

    // 有page且大于0就不全部展示了
    if (page && page > 0) {
      if (page * 10 <= assetArr.length) {
        actualPage = page;
        assetArr = assetArr.slice((page - 1) * 10, page * 10);
      } else {
        actualPage = Math.trunc((assetArr.length - 1) / 10) + 1;
        assetArr = assetArr.slice((actualPage - 1) * 10);
      }
    } else if (assetArr.length > 50)
      assetArr = `...未展示的${assetArr.length - 50}项资源`.concat(
        assetArr.slice(-50)
      );
    assetArr = assetArr.flat();

    const title = `--${userName}の资源库${
      actualPage ? `[PAGE ${actualPage}]` : ''
    }`;
    const padEnd = 24 - getStrLen(title);
    const formatTitle = title.padEnd(title.length + padEnd, '-');
    await this.reply(e, formatTitle, true);

    console.log(assetArr);
    return await this.makeForwardMsg(assetArr);
  }

  /** 按格式输出单个详细资源 */
  async formatAsset(e, assetObj) {
    const userId = e.user_id;

    if (assetObj.type === 'text') return assetObj.text;
    if (assetObj.type === 'image') {
      const path = getFilePath(userId, 'images');
      return {
        asface: assetObj.asface,
        ...segment.image(`${path}/${assetObj.file}`),
      };
    }
    if (assetObj.type === 'file') {
      const path = getFilePath(userId, 'files');
      await e.friend.sendFile(`${path}/${assetObj.name}`).catch(err => {
        logger.error(`${this.e.logFnc} 发送文件失败 ${JSON.stringify(err)}`);
        return `${this.e.logFnc} 发送文件失败 ${JSON.stringify(err)}`;
      });
      return '文件已发送';
    }
    if (assetObj.type === 'json') return segment.json(assetObj.data);

    return false;
  }
}
