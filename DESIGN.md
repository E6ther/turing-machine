# Turing Machine 纯前端复刻 — 设计文档

---

## 技术栈

| 层面 | 选择 |
|------|------|
| 框架 | React 19 + Vite + TypeScript |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS 4 |
| 路由 | React Router |
| 构建 | Vite |

---

## 项目结构

```
turing-machine/
├── src/
│   ├── core/                   # 纯游戏逻辑（零 UI 依赖）
│   │   ├── types.ts            # 所有类型定义
│   │   ├── lawMap.ts           # law ID → 验证函数映射表
│   │   ├── criteriaCards.ts    # 48 张标准卡定义（关联 lawId）
│   │   ├── machine.ts          # 组装问题 + 执行验证
│   │   ├── apiScraper.ts       # 从 turingmachine.info 抓题
│   │   └── constants.ts        # 常量
│   ├── store/
│   │   └── gameStore.ts        # 游戏状态 (Zustand)
│   ├── components/
│   │   ├── CodeInput.tsx       # 3 位数输入 + 确认密码按钮
│   │   ├── VerifierPanel.tsx   # 验证器卡片图片展示
│   │   ├── GameControls.tsx    # 阶段驱动按钮组
│   │   ├── TestHistory.tsx     # 历史记录（按轮次分组）
│   │   └── ColorShape.tsx      # ▲■● 形状 SVG
│   ├── pages/
│   │   ├── Home.tsx            # 首页
│   │   ├── Setup.tsx           # 游戏设置页（m/d/n 参数）
│   │   └── Game.tsx            # 游戏主页面（居中布局 + 左右侧栏）
│   ├── hooks/
│   │   └── useLayout.ts        # 设备类型/方向检测
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── images/
│       └── criteriacards/      # 48 张标准卡图片 (PNG)
└── package.json
```

---

## 核心类型定义

```typescript
// 3 位密码，每位 1-5
type Code = [number, number, number];

// 标准卡定义（仅用于 criteriaCards.ts 内部）
interface CriteriaCard {
  id: number;
  name: string;
  candidates: { lawId: number; desc: string }[];
}

// 激活后的验证器（只含验证逻辑，不含展示）
interface ActiveVerifier {
  lawId: number;
  fn: (code: Code) => boolean;
}

// API 返回的原始数据
interface ApiResponse {
  status: string;
  curDate: string;
  idPartie: number;
  color: number;           // crypt 类型标记（本游戏忽略）
  hash: string;
  m: number | string;      // 游戏模式: 0=经典, 1=极限, 2=噩梦
  d: number;               // 难度
  n: number | string;      // 验证器数量
  code: number;            // 秘密密码（3位数）
  par: number;             // 标准杆验证次数
  ind: number[];           // 标准卡 ID 列表
  law: number[];           // law ID 列表
  crypt: number[];         // 密文（本游戏忽略）
  fake?: number[];         // [极限模式] 假验证器卡片 ID 列表
}

// 解析后的问题
interface Problem {
  secretCode: Code;
  verifiers: ActiveVerifier[];
  ind: number[];
  mode: number;
  fake?: number[];
}

// 单次验证记录
interface TestRecord {
  round: number;
  proposal: Code;
  cardIndex: number;
  result: boolean;
}
```

---

## 标签约定

每张验证器卡片在 UI 中用**字母**标识，按下标映射：

```
下标 0 → A, 下标 1 → B, 下标 2 → C, 下标 3 → D, ...
```

卡片图片路径：`/images/criteriacards/TM_GameCards_CNS-{两位数字}.png`

---

## 核心数据流

```
官网 API (?uuid=&m=&d=&n=)
   │
   ▼
{ code:254, ind:[2,6,13,17], law:[25,38,95,87], m:0, fake? }
   │
   ├── api.law → verifiers[]  ← 只含 { lawId, fn }，只管验证
   ├── api.ind → displayOrder ← 只含卡片 ID，只管展示
   │
   ▼
展示层 (VerifierPanel) ─── displayOrder ─── 卡片图片
验证层 (testVerifier)  ─── verifiers[i].fn ── 密码测试

displayOrder 各模式构造:
  经典(0): [[ind[0]], [ind[1]], …]
  极限(1): [[ind[0], fake[0]], [ind[1], fake[1]], …]  组内排序
  噩梦(2): [[sorted ind[0]], [sorted ind[1]], …]       整体排序

   │
   ▼
┌── 游戏流程 ──────────────────────────────────────┐
│                                                  │
│  ┌──────────────────┐                            │
│  │ 编码阶段          │  ← 选择 ▲ ■ ● 数字        │
│  │ [确认密码]        │  → 锁定密码               │
│  └────────┬─────────┘                            │
│           ▼                                      │
│  ┌──────────────────┐                            │
│  │ 验证阶段          │  ← 单选字母 A/B/C/D       │
│  │ [测试]           │  → verifiers[i].fn(code)   │
│  │ [下一轮]         │  → 回到编码阶段            │
│  │ [提交答案]       │  → 弹窗选数字提交最终答案   │
│  └──────────────────┘                            │
│                                                  │
│  每轮最多验证 3 次，每次测 1 张卡片               │
│  字母 i 对应 displayOrder[i] 展示、verifiers[i] 验证 │
└──────────────────────────────────────────────────┘
```

---

## 游戏阶段详解

```
                 ┌──────────────┐
                 │  编码阶段     │   gamePhase="code-input"
                 │ ▲ [1]...[5]  │
                 │ ■ [1]...[5]  │
                 │ ● [1]...[5]  │
                 │  [确认密码]   │   → confirmCode()
                 └──────┬───────┘
                        ▼
                 ┌──────────────┐
                 │  验证阶段     │   gamePhase="verifier-select"
                 │  密码: ▲3■5●2 │   confirmedCode 已锁定
                 │  本轮: 1/3   │   ≤ 3 次验证
                 │  点击卡片单选 │   selectedVerifierIndex
                 │  [测试]       │   → testVerifier()
                 │  [下一轮]     │   → nextRound()
                 └──────────────┘
```

---

## 状态管理（gameStore.ts）

### 状态字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `problem` | `Problem \| null` | 当前题目 |
| `verifiers` | `ActiveVerifier[]` | 所有验证器（只含验证逻辑） |
| `displayOrder` | `number[][]` | 展示用卡片 ID 分组，每组对应一个字母位置 |
| `records` | `TestRecord[]` | 验证历史 |
| `proposal` | `Code` | 编码阶段当前选中的数字 |
| `phase` | `"idle" \| "playing" \| "solved" \| "failed"` | 整体游戏状态 |
| `gamePhase` | `"code-input" \| "verifier-select"` | 当前游戏阶段 |
| `confirmedCode` | `Code \| null` | 本轮已确认的密码 |
| `selectedVerifierIndex` | `number \| null` | 验证阶段选中的位置下标 |

### 核心动作

| 动作 | 触发 | 逻辑 |
|------|------|------|
| `setProblem(p)` | 设置页开始游戏 | 根据 mode 构建 displayOrder；初始化全部状态 |
| `setProposal(code)` | 数字按钮 | 更新当前编辑的密码 |
| `confirmCode()` | [确认密码] | 锁定 proposal → confirmedCode，切到 verifier-select |
| `selectVerifier(i)` | 点击字母按钮 | 纯 toggle（再次点击取消） |
| `testVerifier()` | [测试] | verifiers[selectedVerifierIndex].fn(confirmedCode)，写入 TestRecord |
| `nextRound()` | [下一轮] | 仅复位阶段，不做排序/洗牌 |
| `submitFinalAnswer(code)` | [提交] 弹窗 | 比对 code 与 secretCode → solved / failed |
| `reset()` | [重新开始] | 全部清空 |

### displayOrder 构造规则

| 模式 | 规则 |
|------|------|
| 经典(0) | `ind.map(id => [id])` → `[[9], [3], [18], [16], [15]]` |
| 极限(1) | `ind.map((id, i) => [id, fake[i]].sort())` → `[[9,25], [3,21], [2,18], [8,16], [1,15]]` |
| 噩梦(2) | `[...ind].sort().map(id => [id])` → `[[3], [6], [13], [18], [29]]` |

---

## 验证流程

```typescript
// 从 API 解析问题
function resolveProblem(api: ApiResponse): Problem {
  return {
    secretCode: parseCode(String(api.code)),
    verifiers: api.law.map((lawId) => ({
      lawId,
      fn: getLawFn(lawId),
    })),
    ind: api.ind,
    mode: Number(api.m),
    fake: api.fake,
  };
}

// 单卡片验证（由 gameStore.testVerifier() 调用）
// selectedVerifierIndex 直接作为 verifiers 下标
function testSingleVerifier(
  proposal: Code,
  verifier: ActiveVerifier
): boolean {
  return verifier.fn(proposal);
}
```

---

## 组件职责

| 组件 | 职责 |
|------|------|
| `VerifierPanel` | 按 displayOrder 展示卡片图片，每组对应一个字母标签。极限模式每组额外显示假卡图。点击可放大预览（仅真实卡）。 |
| `CodeInput` | ▲ ■ ● 数字选择器（1-5 按钮组），编码阶段显示确认按钮，确认后锁定。支持提交模式弹窗。 |
| `GameControls` | 根据 phase + gamePhase 渲染按钮组（确认密码/测试/下一轮/提交答案/重新开始） |
| `TestHistory` | 按轮次分组展示所有历史验证记录 |
| `ColorShape` | 渲染 ▲(蓝) ■(黄) ●(紫) 三种形状，用于 CodeInput 和 Game 页面 |

---

## 按钮状态矩阵

| `gamePhase` / `phase` | 显示的按钮 |
|------------------------|------------|
| `code-input` | `[确认密码]` `[提交答案]` `[重新开始]` |
| `verifier-select` | `[测试]` `[下一轮]` `[提交答案]` |
| `solved / failed` | `[再来一局]` |

---

## 三个核心数据集

### 1. lawMap — law ID → 验证函数

```typescript
// 由用户描述 law 图片规则，开发者实现函数
const lawMap: Record<number, (code: Code) => boolean> = {
  29: (c) => c[0] > 1,       // ▲ > 1
  2:  (c) => c[0] === 1,     // ▲ = 1
  3:  (c) => c[0] < 4,       // ▲ < 4
  // ...
};
```

#### lawMap 汇总（已注册 122 个 ID）

| 分类 | law IDs |
|------|---------|
| 颜色等于某数 | 1,3,4,5 (蓝) · 6,8,9,10 (黄) · 11,13,14,15 (紫) |
| 颜色大于某数 | 16,18 (蓝) · 19,21 (黄) · 22,24 (紫) · 138,142,143 (>4) |
| 颜色小于某数 | 25,26 (蓝) · 28,29 (黄) · 31,32 (紫) |
| 奇偶性 | 34,37 (蓝) · 35,38 (黄) · 36,39 (紫) · 85-88 (总数) · 131-132 (偶奇比较) |
| 数字出现次数 | 40-42 (数字1) · 46-48 (数字3) · 49-51 (数字4) |
| 和/差/倍数 | 55-56 (和奇偶) · 57-59 (倍数) · 60,67,74 (=6,>6,<6) · 98,100,103,105,108,110 (两色和) · 136-137 (蓝黄和) |
| 重复/成对 | 81-82 · 119-121 |
| 颜色比较 | 89-91 (等于) · 92-97 (大于) · 139-141,144 (小于) |
| 最值 | 113-118 (唯一最大/小) · 125-130 (并列最大/小) |
| 升序/降序 | 83-84 · 122-124 · 133-135 |
| 补充 | 201-204（三个重复数字、三升序，API 不太会生成） |

### 2. criteriaCards — 标准卡定义（关联 lawId）

```typescript
// 由用户描述标准卡，关联对应的 lawId
const criteriaCards: CriteriaCard[] = [
  {
    id: 1,
    name: "蓝色数字相较于1",
    candidates: [
      { lawId: 1, desc: "▲ = 1" },
      { lawId: 16, desc: "▲ > 1" },
    ],
  },
  // ... 48 张卡
];
```

### 3. API 爬虫

```
GET api.php?uuid=random&s=0
Headers: Referer: https://turingmachine.info/
         Origin: https://turingmachine.info

Response:
{
  status: "ok",
  curDate: "1779658749",     // 时间戳
  idPartie: 916773,          // 游戏局 ID
  color: 1,                  // crypt 类型标记（忽略）
  hash: "E5S H45 ",          // 哈希谜题标识
  m: "1",                    // 游戏模式: 0=经典, 1=极限, 2=噩梦
  d: 1,                      // 难度: 1/2/3
  n: "5",                    // 验证器数量
  code: 135,                 // 秘密密码（3位数，number 类型）
  par: 6,                    // 标准杆验证次数
  ind: [9,3,18,16,15],       // 标准卡 ID 列表
  law: [47,8,56,132,115],    // law ID 列表
  crypt: [219,564,424,515,406], // 密文（忽略）
  fake?: [25,21,2,8,1]       // [极限模式] 假验证器的卡片 ID 列表
}
```

注意：`m` 和 `n` 字段类型可能为字符串或数字，解析时统一用 `Number()` 转换。

---

## 设置页参数

| 设置项 | 参数 | 可选项 |
|--------|------|--------|
| 游戏模式 | `m` | 0=经典, 1=极限（含假验证器）, 2=噩梦 |
| 难度 | `d` | 1=简单, 2=标准, 3=困难（API 不支持 d=3） |
| 验证者数量 | `n` | 4, 5, 6 |

---

## 开发顺序

| 步骤 | 内容 | 依赖 |
|------|------|------|
| 1 | 建项目结构 + 类型定义 | 无 |
| 2 | lawMap.ts — 用户描述 law 图片，开发者实现函数 | 无 |
| 3 | criteriaCards.ts — 用户描述标准卡并关联 lawId | 步骤2 |
| 4 | machine.ts + apiScraper.ts | 步骤3 |
| 5 | Zustand store | 步骤4 |
| 6 | UI 组件 (CodeInput, VerifierPanel, NoteSheet, GameControls) | 步骤5 |
| 7 | 页面路由 + 串联 | 步骤6 |
| 8 | 设置页 (Setup) + 爬虫参数 | 步骤4 |

---

## 关键约定

1. `law` 数组直接指明激活了哪个候选验证函数，**无需消歧算法**
2. 每张 law 图片对应一个确定的验证函数：`(code: Code) => boolean`
3. 每张标准卡（criteria card）由多个候选组成，每个候选关联一个 lawId
4. API 返回的 `ind` 和 `law` 数组等长，一一对应
5. **展示与验证解耦**：`verifiers[]` 只含 `{lawId, fn}`（验证），`displayOrder` 只含卡片 ID（展示），两者通过位置 i 对齐
6. 颜色与 code 索引映射：`code[0] = ▲(蓝)`, `code[1] = ■(黄)`, `code[2] = ●(紫)`
7. 每轮最多验证 3 次，每次只测 1 张卡片
8. 卡片用字母标识：A/B/C/D...，对应 displayOrder 的下标
9. 最终答案通过独立弹窗提交，编码区的数字仅用于本轮验证

## 模式对照

| 模式 | 展示规则 | 验证规则 | 每轮变化 |
|------|---------|---------|---------|
| 经典(0) | `[[ind[0]], [ind[1]], …]` 原序 | `verifiers[i].fn(code)` | 无 |
| 极限(1) | `[[ind[0], fake[0]], …]` 原序，组内排序 | `verifiers[i].fn(code)` | 无 |
| 噩梦(2) | `[[sorted ind[0]], …]` 整体排序 | `verifiers[i].fn(code)` | 无 |

- 极限模式下 `fake` 是展示层的视觉干扰，验证始终对应真实的 `law`
- 三种模式下 `selectedVerifierIndex` 都直接作为 `verifiers[]` 下标

---

## 页面布局架构

### 宽屏（横屏）— 居中 + 绝对定位侧栏

```
                   游戏区域始终居中
  ←─────────────────────────────────────────→
          ┌──────┐ ┌───────────────┐ ┌──────┐
          │ 历史  │ │    游戏区域    │ │ 预留  │
          │sticky │ │  max-w-lg     │ │sticky│
          │shrink │ │  w-full       │ │shrink│
          │  -0   │ │               │ │  -0  │
          └──────┘ └───────────────┘ └──────┘
          right-full        │          left-full
          + mr-4            │          + ml-4
                          居中
```

| 层级 | CSS 实现 | 说明 |
|------|----------|------|
| 外层容器 | `flex justify-center min-h-dvh` | 水平居中 |
| 游戏区域 | `max-w-lg w-full relative` | 作为左右侧栏的定位锚点 |
| 左侧历史 | `absolute right-full mr-4 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto shrink-0` | 附着在游戏区域左侧，自身可滚动 |
| 右侧预留 | `absolute left-full ml-4` | 空容器，未来添加内容时启用 |

- 历史侧栏默认不渲染，有记录时 (`records.length > 0`) 才显示
- 右栏仅在需要时启用（预留扩展能力）
- 游戏区域自身无 margin/padding 干扰居中

### 竖屏（移动端）— 左侧悬浮按钮 + 弹窗

```
┌──────────────────────┐
│                      │
│                      │
│      游戏内容         │
│                      │
│                      │
│ ┌────┐               │  ← 左侧居中竖长方形按钮
│ │    │               │     fixed left-0 top-1/2
│ │历  │               │     -translate-y-1/2
│ │史  │               │     w-6 h-24 bg-white
│ │    │               │     rounded-r-xl shadow
│ └────┘               │     writing-mode: vertical-rl
└──────────────────────┘
   ↓ 点击
┌──────────────────────┐
│  ┌────────────────┐  │  ← 全屏半透明遮罩
│  │ ✕ 历史记录     │  │  ← 居中白色卡片 rounded-xl
│  │                │  │     max-h-[80vh] overflow-y-auto
│  │  表格内容      │  │     点击右上角 ✕ 关闭
│  │                │  │
│  └────────────────┘  │
└──────────────────────┘
```

| 状态 | 元素 | 行为 |
|------|------|------|
| 默认 | 竖长方形按钮「历史」| `fixed left-0 top-1/2 -translate-y-1/2`，文字竖排 |
| 点击按钮 | 遮罩 + 白色卡片 | 卡片内展示 `TestHistory`，右上角 `✕` 按钮 |
| 点击 ✕ | 关闭弹窗 | 回到默认状态，按钮重新出现 |

### 游戏操作框（编码/验证）— 底部悬浮

编码框和验证框都使用 `sticky bottom-0 z-10 shadow-lg` 悬浮在屏幕底部：

- 向下滚动时，操作框吸附在视口底部，覆盖上方的验证器图片
- 滚动到页面最底部时，操作框停留在文档流中的自然位置
- 使用 `flex flex-col` 布局，按钮始终贴在框的底部
- 两个框通过 `min-h-[18rem]` 保持统一高度

```
┌──────────────────────────────┐
│                              │
│         游戏内容 / 图片        │  ← 可被操作框覆盖
│                              │
├──────────────────────────────┤  ← sticky bottom-0
│  ┌────────────────────────┐  │     z-10 shadow-lg
│  │  本轮密码 ▲2 ■3 ●4     │  │
│  │  选择要测试的验证器     │  │
│  │    A  B  C  D          │  │
│  │  [返回] [测试] [提交]   │  │  ← 贴在底部
│  └────────────────────────┘  │
└──────────────────────────────┘
```

### 响应式策略

| 设备 | 历史记录展示方式 |
|------|-----------------|
| 宽屏 (`!layout.isMobile`) | 游戏区域左侧 sticky 侧栏 |
| 竖屏 (`layout.isMobile`) | 左侧悬浮按钮 → 点击弹出全屏浮层 |
