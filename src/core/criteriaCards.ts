import type { CriteriaCard } from "./types";

const cards: CriteriaCard[] = [
  {
    id: 1,
    name: "蓝色数字相较于1",
    candidates: [
      { lawId: 1, desc: "▲ = 1" },
      { lawId: 16, desc: "▲ > 1" },
    ],
  },
  {
    id: 2,
    name: "蓝色数字相较于3",
    candidates: [
      { lawId: 25, desc: "▲ < 3" },
      { lawId: 3, desc: "▲ = 3" },
      { lawId: 18, desc: "▲ > 3" },
    ],
  },
  {
    id: 3,
    name: "黄色数字相较于3",
    candidates: [
      { lawId: 28, desc: "■ < 3" },
      { lawId: 8, desc: "■ = 3" },
      { lawId: 21, desc: "■ > 3" },
    ],
  },
  {
    id: 4,
    name: "黄色数字相较于4",
    candidates: [
      { lawId: 29, desc: "■ < 4" },
      { lawId: 9, desc: "■ = 4" },
      { lawId: 138, desc: "■ > 4" },
    ],
  },
  {
    id: 5,
    name: "蓝色为偶数还是奇数",
    candidates: [
      { lawId: 34, desc: "▲ 为偶" },
      { lawId: 37, desc: "▲ 为奇" },
    ],
  },
  {
    id: 6,
    name: "黄色为偶数还是奇数",
    candidates: [
      { lawId: 35, desc: "■ 为偶" },
      { lawId: 38, desc: "■ 为奇" },
    ],
  },
  {
    id: 7,
    name: "紫色为偶数还是奇数",
    candidates: [
      { lawId: 36, desc: "● 为偶" },
      { lawId: 39, desc: "● 为奇" },
    ],
  },
  {
    id: 8,
    name: "密码中有几个数字1",
    candidates: [
      { lawId: 40, desc: "没有数字1" },
      { lawId: 41, desc: "一个数字1" },
      { lawId: 42, desc: "两个数字1" },
      { lawId: 201, desc: "三个数字1" },
    ],
  },
  {
    id: 9,
    name: "密码中有几个数字3",
    candidates: [
      { lawId: 46, desc: "没有数字3" },
      { lawId: 47, desc: "一个数字3" },
      { lawId: 48, desc: "两个数字3" },
      { lawId: 202, desc: "三个数字3" },
    ],
  },
  {
    id: 10,
    name: "密码中有几个数字4",
    candidates: [
      { lawId: 49, desc: "没有数字4" },
      { lawId: 50, desc: "一个数字4" },
      { lawId: 51, desc: "两个数字4" },
      { lawId: 203, desc: "三个数字4" },
    ],
  },
  {
    id: 11,
    name: "蓝色数字相较于黄色数字",
    candidates: [
      { lawId: 139, desc: "▲ < ■" },
      { lawId: 89, desc: "▲ = ■" },
      { lawId: 92, desc: "▲ > ■" },
    ],
  },
  {
    id: 12,
    name: "蓝色数字相较于紫色数字",
    candidates: [
      { lawId: 140, desc: "▲ < ●" },
      { lawId: 90, desc: "▲ = ●" },
      { lawId: 93, desc: "▲ > ●" },
    ],
  },
  {
    id: 13,
    name: "黄色数字相较于紫色数字",
    candidates: [
      { lawId: 141, desc: "■ < ●" },
      { lawId: 91, desc: "■ = ●" },
      { lawId: 95, desc: "■ > ●" },
    ],
  },
  {
    id: 14,
    name: "哪个颜色的数字小于其他颜色的数字",
    candidates: [
      { lawId: 116, desc: "▲ 最小" },
      { lawId: 117, desc: "■ 最小" },
      { lawId: 118, desc: "● 最小" },
    ],
  },
  {
    id: 15,
    name: "哪个颜色的数字大于其他颜色的数字",
    candidates: [
      { lawId: 113, desc: "▲ 最大" },
      { lawId: 114, desc: "■ 最大" },
      { lawId: 115, desc: "● 最大" },
    ],
  },
  {
    id: 16,
    name: "偶数的数量相较于奇数的数量",
    candidates: [
      { lawId: 131, desc: "偶数更多" },
      { lawId: 132, desc: "奇数更多" },
    ],
  },
  {
    id: 17,
    name: "密码中有几个偶数",
    candidates: [
      { lawId: 85, desc: "没有偶数" },
      { lawId: 86, desc: "一个偶数" },
      { lawId: 87, desc: "两个偶数" },
      { lawId: 88, desc: "三个偶数" },
    ],
  },
  {
    id: 18,
    name: "所有数字总和为偶数还是奇数",
    candidates: [
      { lawId: 55, desc: "总和为偶" },
      { lawId: 56, desc: "总和为奇" },
    ],
  },
  {
    id: 19,
    name: "蓝色与黄色总和相较于6",
    candidates: [
      { lawId: 137, desc: "▲+■ < 6" },
      { lawId: 100, desc: "▲+■ = 6" },
      { lawId: 136, desc: "▲+■ > 6" },
    ],
  },
  {
    id: 20,
    name: "密码中是否有重复数字",
    candidates: [
      { lawId: 119, desc: "三个重复数字" },
      { lawId: 120, desc: "两个重复数字" },
      { lawId: 121, desc: "没有重复数字" },
    ],
  },
  {
    id: 21,
    name: "是否有一个数字出现正好两次",
    candidates: [
      { lawId: 81, desc: "没有成对数字" },
      { lawId: 82, desc: "有一对数字" },
    ],
  },
  {
    id: 22,
    name: "密码3个数字是递增、递减还是无序",
    candidates: [
      { lawId: 133, desc: "递增" },
      { lawId: 134, desc: "递减" },
      { lawId: 135, desc: "无序" },
    ],
  },
  {
    id: 23,
    name: "所有数字总和相较于6",
    candidates: [
      { lawId: 74, desc: "总和 < 6" },
      { lawId: 60, desc: "总和 = 6" },
      { lawId: 67, desc: "总和 > 6" },
    ],
  },
  {
    id: 24,
    name: "是否有升序数列",
    candidates: [
      { lawId: 204, desc: "3个数字为升序" },
      { lawId: 84, desc: "2个数字为升序" },
      { lawId: 83, desc: "没有数字为升序" },
    ],
  },
  {
    id: 25,
    name: "是否有升序或降序数列",
    candidates: [
      { lawId: 122, desc: "没有升序或降序数列" },
      { lawId: 123, desc: "2个数字为升序或降序" },
      { lawId: 124, desc: "3个数字为升序或降序" },
    ],
  },
  {
    id: 26,
    name: "一个特定颜色小于3",
    candidates: [
      { lawId: 25, desc: "▲ < 3" },
      { lawId: 28, desc: "■ < 3" },
      { lawId: 31, desc: "● < 3" },
    ],
  },
  {
    id: 27,
    name: "一个特定颜色小于4",
    candidates: [
      { lawId: 26, desc: "▲ < 4" },
      { lawId: 29, desc: "■ < 4" },
      { lawId: 32, desc: "● < 4" },
    ],
  },
  {
    id: 28,
    name: "一个特定颜色等于1",
    candidates: [
      { lawId: 1, desc: "▲ = 1" },
      { lawId: 6, desc: "■ = 1" },
      { lawId: 11, desc: "● = 1" },
    ],
  },
  {
    id: 29,
    name: "一个特定颜色等于3",
    candidates: [
      { lawId: 3, desc: "▲ = 3" },
      { lawId: 8, desc: "■ = 3" },
      { lawId: 13, desc: "● = 3" },
    ],
  },
  {
    id: 30,
    name: "一个特定颜色等于4",
    candidates: [
      { lawId: 4, desc: "▲ = 4" },
      { lawId: 9, desc: "■ = 4" },
      { lawId: 14, desc: "● = 4" },
    ],
  },
  {
    id: 31,
    name: "一个特定颜色大于1",
    candidates: [
      { lawId: 16, desc: "▲ > 1" },
      { lawId: 19, desc: "■ > 1" },
      { lawId: 22, desc: "● > 1" },
    ],
  },
  {
    id: 32,
    name: "一个特定颜色大于3",
    candidates: [
      { lawId: 18, desc: "▲ > 3" },
      { lawId: 21, desc: "■ > 3" },
      { lawId: 24, desc: "● > 3" },
    ],
  },
  {
    id: 33,
    name: "一个特定颜色为偶数还是奇数",
    candidates: [
      { lawId: 34, desc: "▲ 为偶" },
      { lawId: 37, desc: "▲ 为奇" },
      { lawId: 35, desc: "■ 为偶" },
      { lawId: 38, desc: "■ 为奇" },
      { lawId: 36, desc: "● 为偶" },
      { lawId: 39, desc: "● 为奇" },
    ],
  },
  {
    id: 34,
    name: "哪个颜色的数字最小(或并列最小)",
    candidates: [
      { lawId: 128, desc: "▲ 最小或并列最小" },
      { lawId: 129, desc: "■ 最小或并列最小" },
      { lawId: 130, desc: "● 最小或并列最小" },
    ],
  },
  {
    id: 35,
    name: "哪个颜色的数字最大(或并列最大)",
    candidates: [
      { lawId: 125, desc: "▲ 最大或并列最大" },
      { lawId: 126, desc: "■ 最大或并列最大" },
      { lawId: 127, desc: "● 最大或并列最大" },
    ],
  },
  {
    id: 36,
    name: "所有数字总和是3、4或5的倍数",
    candidates: [
      { lawId: 57, desc: "3的倍数" },
      { lawId: 58, desc: "4的倍数" },
      { lawId: 59, desc: "5的倍数" },
    ],
  },
  {
    id: 37,
    name: "2个特定颜色总和等于4",
    candidates: [
      { lawId: 98, desc: "▲+■ = 4" },
      { lawId: 103, desc: "▲+● = 4" },
      { lawId: 108, desc: "■+● = 4" },
    ],
  },
  {
    id: 38,
    name: "2个特定颜色总和等于6",
    candidates: [
      { lawId: 100, desc: "▲+■ = 6" },
      { lawId: 105, desc: "▲+● = 6" },
      { lawId: 110, desc: "■+● = 6" },
    ],
  },
  {
    id: 39,
    name: "一个特定颜色的数字相较于1",
    candidates: [
      { lawId: 1, desc: "▲ = 1" },
      { lawId: 16, desc: "▲ > 1" },
      { lawId: 6, desc: "■ = 1" },
      { lawId: 19, desc: "■ > 1" },
      { lawId: 11, desc: "● = 1" },
      { lawId: 22, desc: "● > 1" },
    ],
  },
  {
    id: 40,
    name: "一个特定颜色的数字相较于3",
    candidates: [
      { lawId: 25, desc: "▲ < 3" },
      { lawId: 3, desc: "▲ = 3" },
      { lawId: 18, desc: "▲ > 3" },
      { lawId: 28, desc: "■ < 3" },
      { lawId: 8, desc: "■ = 3" },
      { lawId: 21, desc: "■ > 3" },
      { lawId: 31, desc: "● < 3" },
      { lawId: 13, desc: "● = 3" },
      { lawId: 24, desc: "● > 3" },
    ],
  },
  {
    id: 41,
    name: "一个特定颜色的数字相较于4",
    candidates: [
      { lawId: 26, desc: "▲ < 4" },
      { lawId: 4, desc: "▲ = 4" },
      { lawId: 142, desc: "▲ > 4" },
      { lawId: 29, desc: "■ < 4" },
      { lawId: 9, desc: "■ = 4" },
      { lawId: 138, desc: "■ > 4" },
      { lawId: 32, desc: "● < 4" },
      { lawId: 14, desc: "● = 4" },
      { lawId: 143, desc: "● > 4" },
    ],
  },
  {
    id: 42,
    name: "哪个颜色最小或最大",
    candidates: [
      { lawId: 116, desc: "▲ 最小" },
      { lawId: 113, desc: "▲ 最大" },
      { lawId: 117, desc: "■ 最小" },
      { lawId: 114, desc: "■ 最大" },
      { lawId: 118, desc: "● 最小" },
      { lawId: 115, desc: "● 最大" },
    ],
  },
  {
    id: 43,
    name: "蓝色相较于另一个特定颜色数字",
    candidates: [
      { lawId: 139, desc: "▲ < ■" },
      { lawId: 140, desc: "▲ < ●" },
      { lawId: 89, desc: "▲ = ■" },
      { lawId: 90, desc: "▲ = ●" },
      { lawId: 92, desc: "▲ > ■" },
      { lawId: 93, desc: "▲ > ●" },
    ],
  },
  {
    id: 44,
    name: "黄色相较于另一个特定颜色数字",
    candidates: [
      { lawId: 144, desc: "■ < ▲" },
      { lawId: 141, desc: "■ < ●" },
      { lawId: 89, desc: "■ = ▲" },
      { lawId: 91, desc: "■ = ●" },
      { lawId: 94, desc: "■ > ▲" },
      { lawId: 95, desc: "■ > ●" },
    ],
  },
  {
    id: 45,
    name: "密码中有几个数字1或有几个数字3",
    candidates: [
      { lawId: 40, desc: "没有数字1" },
      { lawId: 46, desc: "没有数字3" },
      { lawId: 41, desc: "一个数字1" },
      { lawId: 47, desc: "一个数字3" },
      { lawId: 42, desc: "两个数字1" },
      { lawId: 48, desc: "两个数字3" },
    ],
  },
  {
    id: 46,
    name: "密码中有几个数字3或有几个数字4",
    candidates: [
      { lawId: 46, desc: "没有数字3" },
      { lawId: 49, desc: "没有数字4" },
      { lawId: 47, desc: "一个数字3" },
      { lawId: 50, desc: "一个数字4" },
      { lawId: 48, desc: "两个数字3" },
      { lawId: 51, desc: "两个数字4" },
    ],
  },
  {
    id: 47,
    name: "密码中有几个数字1或有几个数字4",
    candidates: [
      { lawId: 40, desc: "没有数字1" },
      { lawId: 49, desc: "没有数字4" },
      { lawId: 41, desc: "一个数字1" },
      { lawId: 50, desc: "一个数字4" },
      { lawId: 42, desc: "两个数字1" },
      { lawId: 51, desc: "两个数字4" },
    ],
  },
  {
    id: 48,
    name: "一个特定颜色相较于另一个特定颜色",
    candidates: [
      { lawId: 139, desc: "▲ < ■" },
      { lawId: 89, desc: "▲ = ■" },
      { lawId: 92, desc: "▲ > ■" },
      { lawId: 140, desc: "▲ < ●" },
      { lawId: 90, desc: "▲ = ●" },
      { lawId: 93, desc: "▲ > ●" },
      { lawId: 141, desc: "■ < ●" },
      { lawId: 91, desc: "■ = ●" },
      { lawId: 95, desc: "■ > ●" },
    ],
  },
];

export function getCard(id: number): CriteriaCard | undefined {
  return cards.find((c) => c.id === id);
}

export function getAllCards(): CriteriaCard[] {
  return cards;
}