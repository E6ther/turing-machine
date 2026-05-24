import type { Code } from "./types";

const lawMap: Record<number, (code: Code) => boolean> = {};

export function getLawFn(lawId: number): (code: Code) => boolean {
  const fn = lawMap[lawId];
  if (!fn) throw new Error(`Unknown lawId: ${lawId}`);
  return fn;
}

export function registerLaw(lawId: number, fn: (code: Code) => boolean) {
  lawMap[lawId] = fn;
}

// ─── Law 注册 ──────────────────────────────────────────────────
// ▲ = code[0], ■ = code[1], ● = code[2]

registerLaw(1, (c) => c[0] === 1);   // 蓝色等于1
registerLaw(3, (c) => c[0] === 3);   // 蓝色等于3
registerLaw(4, (c) => c[0] === 4);   // 蓝色等于4
registerLaw(5, (c) => c[0] === 5);   // 蓝色等于5
registerLaw(6, (c) => c[1] === 1);   // 黄色等于1
registerLaw(8, (c) => c[1] === 3);   // 黄色等于3
registerLaw(9, (c) => c[1] === 4);   // 黄色等于4
registerLaw(10, (c) => c[1] === 5);  // 黄色等于5
registerLaw(11, (c) => c[2] === 1);  // 紫色等于1
registerLaw(13, (c) => c[2] === 3);  // 紫色等于3
registerLaw(14, (c) => c[2] === 4);  // 紫色等于4
registerLaw(15, (c) => c[2] === 5);  // 紫色等于5
registerLaw(16, (c) => c[0] > 1);   // 蓝色大于1
registerLaw(18, (c) => c[0] > 3);   // 蓝色大于3
registerLaw(19, (c) => c[1] > 1);   // 黄色大于1
registerLaw(21, (c) => c[1] > 3);   // 黄色大于3
registerLaw(22, (c) => c[2] > 1);   // 紫色大于1
registerLaw(24, (c) => c[2] > 3);   // 紫色大于3
registerLaw(25, (c) => c[0] < 3);   // 蓝色小余3
registerLaw(26, (c) => c[0] < 4);   // 蓝色小余4
registerLaw(28, (c) => c[1] < 3);   // 黄色小余3
registerLaw(29, (c) => c[1] < 4);   // 黄色小余4
registerLaw(31, (c) => c[2] < 3);   // 紫色小余3
registerLaw(32, (c) => c[2] < 4);   // 紫色小余4
registerLaw(34, (c) => c[0] % 2 === 0); // 蓝色为偶数
registerLaw(35, (c) => c[1] % 2 === 0); // 黄色为偶数
registerLaw(36, (c) => c[2] % 2 === 0); // 紫色为偶数
registerLaw(37, (c) => c[0] % 2 === 1); // 蓝色为奇数
registerLaw(38, (c) => c[1] % 2 === 1); // 黄色为奇数
registerLaw(39, (c) => c[2] % 2 === 1); // 紫色为奇数
registerLaw(40, (c) => c.filter(d => d === 1).length === 0); // 没有数字1
registerLaw(41, (c) => c.filter(d => d === 1).length === 1); // 一个数字1
registerLaw(42, (c) => c.filter(d => d === 1).length === 2); // 两个数字1
registerLaw(46, (c) => c.filter(d => d === 3).length === 0); // 没有数字3
registerLaw(47, (c) => c.filter(d => d === 3).length === 1); // 一个数字3
registerLaw(48, (c) => c.filter(d => d === 3).length === 2); // 两个数字3
registerLaw(49, (c) => c.filter(d => d === 4).length === 0); // 没有数字4
registerLaw(50, (c) => c.filter(d => d === 4).length === 1); // 一个数字4
registerLaw(51, (c) => c.filter(d => d === 4).length === 2); // 两个数字4
const sum = (c: Code, ...idx: number[]) => idx.reduce((s, i) => s + c[i], 0);
registerLaw(55, (c) => sum(c, 0, 1, 2) % 2 === 0); // 和为偶数
registerLaw(56, (c) => sum(c, 0, 1, 2) % 2 === 1); // 和为奇数
registerLaw(57, (c) => sum(c, 0, 1, 2) % 3 === 0); // 和为3的倍数
registerLaw(58, (c) => sum(c, 0, 1, 2) % 4 === 0); // 和为4的倍数
registerLaw(59, (c) => sum(c, 0, 1, 2) % 5 === 0); // 和为5的倍数
registerLaw(60, (c) => sum(c, 0, 1, 2) === 6);   // 等于6
registerLaw(67, (c) => sum(c, 0, 1, 2) > 6);    // 大于6
registerLaw(74, (c) => sum(c, 0, 1, 2) < 6);    // 小余6
registerLaw(81, (c) => new Set(c).size !== 2); // 去重后1个或3个数字为真（没有成对）
registerLaw(82, (c) => new Set(c).size === 2); // 有一对数字
registerLaw(83, (c) => !hasPairAsc(c)); // 没有升序数列
registerLaw(84, (c) => hasPairAsc(c));  // 有2个数字为升序
// 注：没有三个数字为升序的 law（如 123、234、345），后续若标准卡需要可创建虚拟 ID
const evenCount = (c: Code) => c.filter(d => d % 2 === 0).length;
registerLaw(85, (c) => evenCount(c) === 0); // 三个奇数
registerLaw(86, (c) => evenCount(c) === 1); // 一偶两奇
registerLaw(87, (c) => evenCount(c) === 2); // 两偶一奇
registerLaw(88, (c) => evenCount(c) === 3); // 三偶
registerLaw(89, (c) => c[0] === c[1]);   // 蓝等于黄
registerLaw(90, (c) => c[0] === c[2]);   // 蓝等于紫
registerLaw(91, (c) => c[1] === c[2]);   // 黄等于紫
registerLaw(92, (c) => c[0] > c[1]);    // 蓝大于黄
registerLaw(93, (c) => c[0] > c[2]);    // 蓝大于紫
registerLaw(94, (c) => c[1] > c[0]);    // 黄大于蓝
registerLaw(95, (c) => c[1] > c[2]);    // 黄大于紫
registerLaw(96, (c) => c[2] > c[0]);    // 紫大于蓝
registerLaw(97, (c) => c[2] > c[1]);    // 紫大于黄
registerLaw(98, (c) => sum(c, 0, 1) === 4);  // 蓝+黄=4
registerLaw(100, (c) => sum(c, 0, 1) === 6); // 蓝+黄=6
registerLaw(103, (c) => sum(c, 0, 2) === 4); // 蓝+紫=4
registerLaw(105, (c) => sum(c, 0, 2) === 6); // 蓝+紫=6
registerLaw(108, (c) => sum(c, 1, 2) === 4); // 黄+紫=4
registerLaw(110, (c) => sum(c, 1, 2) === 6); // 黄+紫=6
registerLaw(113, (c) => c[0] > c[1] && c[0] > c[2]); // 蓝最大
registerLaw(114, (c) => c[1] > c[0] && c[1] > c[2]); // 黄最大
registerLaw(115, (c) => c[2] > c[0] && c[2] > c[1]); // 紫最大
registerLaw(116, (c) => c[0] < c[1] && c[0] < c[2]); // 蓝最小
registerLaw(117, (c) => c[1] < c[0] && c[1] < c[2]); // 黄最小
registerLaw(118, (c) => c[2] < c[0] && c[2] < c[1]); // 紫最小
registerLaw(119, (c) => new Set(c).size === 1); // 三个重复数字
registerLaw(120, (c) => new Set(c).size === 2); // 两个重复数字
registerLaw(121, (c) => new Set(c).size === 3); // 没有重复数字
const hasPairAsc = (c: Code) => c[1] === c[0] + 1 || c[2] === c[1] + 1;
const hasPairDesc = (c: Code) => c[1] === c[0] - 1 || c[2] === c[1] - 1;
const hasTripleAsc = (c: Code) => c[1] === c[0] + 1 && c[2] === c[1] + 1;
const hasTripleDesc = (c: Code) => c[1] === c[0] - 1 && c[2] === c[1] - 1;
registerLaw(122, (c) => !hasPairAsc(c) && !hasPairDesc(c)); // 没有升序或降序数列
registerLaw(123, (c) => hasPairAsc(c) || hasPairDesc(c));   // 两个数字为升序或降序
registerLaw(124, (c) => hasTripleAsc(c) || hasTripleDesc(c)); // 三个数字为升序或降序
registerLaw(125, (c) => c[0] >= c[1] && c[0] >= c[2]); // 蓝色并列最大
registerLaw(126, (c) => c[1] >= c[0] && c[1] >= c[2]); // 黄色并列最大
registerLaw(127, (c) => c[2] >= c[0] && c[2] >= c[1]); // 紫色并列最大
registerLaw(128, (c) => c[0] <= c[1] && c[0] <= c[2]); // 蓝色并列最小
registerLaw(129, (c) => c[1] <= c[0] && c[1] <= c[2]); // 黄色并列最小
registerLaw(130, (c) => c[2] <= c[0] && c[2] <= c[1]); // 紫色并列最小
registerLaw(131, (c) => evenCount(c) > 3 - evenCount(c)); // 偶数数量大于奇数
registerLaw(132, (c) => evenCount(c) < 3 - evenCount(c)); // 偶数数量小余奇数
registerLaw(133, (c) => c[0] < c[1] && c[1] < c[2]); // 数字递增
registerLaw(134, (c) => c[0] > c[1] && c[1] > c[2]); // 数字递减
registerLaw(135, (c) => !(c[0] < c[1] && c[1] < c[2]) && !(c[0] > c[1] && c[1] > c[2])); // 数字无序
registerLaw(136, (c) => sum(c, 0, 1) > 6); // 蓝+黄>6
registerLaw(137, (c) => sum(c, 0, 1) < 6); // 蓝+黄<6
registerLaw(138, (c) => c[1] > 4);       // 黄大于4
registerLaw(139, (c) => c[0] < c[1]);   // 蓝<黄
registerLaw(140, (c) => c[0] < c[2]);   // 蓝<紫
registerLaw(141, (c) => c[1] < c[2]);   // 黄<紫
registerLaw(142, (c) => c[0] > 4);      // 蓝>4
registerLaw(143, (c) => c[2] > 4);      // 紫>4
registerLaw(144, (c) => c[1] < c[0]);   // 黄<蓝

// ─── 补充 law（ID 201+，API 不太会生成） ─────────────────────
registerLaw(201, (c) => c.filter(d => d === 1).length === 3); // 三个数字1
registerLaw(202, (c) => c.filter(d => d === 3).length === 3); // 三个数字3
registerLaw(203, (c) => c.filter(d => d === 4).length === 3); // 三个数字4
registerLaw(204, (c) => hasTripleAsc(c));                     // 3个数字为升序
