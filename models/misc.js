/** 杂项工具包 */

export const sleep = async function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getRandomInt = function (min, max) {
  return Math.trunc(Math.random() * (max - min)) + min;
};

/** 时间戳，单位ms */
export const getNowTimeStamp = function () {
  return new Date().getTime();
};

/** 中文全角算两个 */
export const getStrLen = function (str) {
  return Array.from(str).reduce(
    (len, c) => (c.match(/[^\x00-\xff]/gi) != null ? (len += 2) : (len += 1)),
    0
  );
};
