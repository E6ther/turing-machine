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
│   │   ├── gameStore.ts        # 游戏状态 (Zustand)
│   │   └── noteSheetStore.ts   # 推理笔记状态
│   ├── components/
│   │   ├── CodeInput.tsx       # 3 位数输入 + 确认密码按钮
│   │   ├── VerifierPanel.tsx   # 验证器卡片图片展示 + 单选交互
│   │   ├── NoteSheet.tsx       # 推理笔记
│   │   ├── GameControls.tsx    # 阶段驱动按钮组
│   │   ├── TestHistory.tsx     # 历史记录（按轮次分组）
│   │   └── GameLayout.tsx      # 响应式布局容器
│   ├── pages/
│   │   ├── Home.tsx            # 首页
│   │   ├── Setup.tsx           # 游戏设置页（m/d/n 参数）
│   │   └── Game.tsx            # 游戏主页面（纵向布局）
│   ├── hooks/
│   │   └── useLayout.ts        # 设备类型/方向检测
│   ├── i18n/
│   │   └── zh.ts               # 中文文案
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── images/
│       ├── criteriacards/      # 48 张标准卡图片 (PNG)
│       └── laws/               # law 图片 (JPG)
└── package.json
```

---

## 核心类型定义

```typescript
// 3 位密码，每位 1-5
type Code = [number, number, number];

// 三色枚举: ▲=Blue, ■=Yellow, ●=Purple
enum Color { Blue = 0, Yellow = 1, Purple = 2 }

// 候选验证函数 (对应一张 law 图片)
// lawMap[lawId] = (code) => boolean
const lawMap: Record<number, (code: Code) => boolean>;

// 标准卡定义
interface CriteriaCard {
  id: number;                           // 1-48
  name: string;                         // 中文名
  candidates: { lawId: number; desc: string }[];
}

// 激活后的验证器
interface ActiveVerifier {
  cardId: number;
  lawId: number;
  desc: string;
  fn: (code: Code) => boolean;
}

// API 返回的原始数据
interface ApiResponse {
  status: string;
  code: string;      // 如 "443"
  n: number;         // 验证器数量
  ind: number[];     // 标准卡 ID 列表
  law: number[];     // law ID 列表（直接对应激活的候选函数）
  crypt: number[];   // 密文（忽略）
  hash: string;
  par: number;
  fake?: number[];   // 极限模式（m=1）下的假验证器索引
}

// 解析后的问题
interface Problem {
  secretCode: Code;
  verifiers: ActiveVerifier[];
}

// 单次验证记录（每轮多次验证，每次只测 1 张卡片）
interface TestRecord {
  round: number;        // 第几轮
  proposal: Code;       // 本轮确认的密码
  cardIndex: number;    // 被测卡片在 verifiers[] 中的下标
  result: boolean;      // ✓/✗
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
{ code:254, ind:[2,6,13,17], law:[25,38,95,87] }
   │
   ├── ind[i] → criteriaCards[id]  → 获取标准卡元信息
   ├── law[i] → lawMap[id]         → 获取验证函数
   │
   ▼
组装 ActiveVerifier[]
[
  { cardId:2,  lawId:25, fn: (code) => code[0] < 3 },   // 卡片 B
  { cardId:6,  lawId:38, fn: (code) => code[2] % 2 === 1 }, // 卡片 C
  ...
]
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
│  │ 验证阶段          │  ← 单选卡片 A/B/C/D       │
│  │ [测试]           │  → fn(confirmedCode)       │
│  │ [下一轮]         │  → 回到编码阶段            │
│  │ [提交答案]       │  → 弹窗选数字提交最终答案   │
│  └──────────────────┘                            │
│                                                  │
│  每轮最多验证 3 次，每次测 1 张卡片               │
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
| `verifiers` | `ActiveVerifier[]` | 所有验证器 |
| `records` | `TestRecord[]` | 验证历史 |
| `proposal` | `Code` | 编码阶段当前选中的数字 |
| `phase` | `"idle" \| "playing" \| "solved" \| "failed"` | 整体游戏状态 |
| `gamePhase` | `"code-input" \| "verifier-select"` | 当前游戏阶段 |
| `confirmedCode` | `Code \| null` | 本轮已确认的密码 |
| `selectedVerifierIndex` | `number \| null` | 验证阶段选中的卡片下标 |

### 核心动作

| 动作 | 触发 | 逻辑 |
|------|------|------|
| `setProblem(p)` | 设置页开始游戏 | 初始化 verifiers, phase="playing", gamePhase="code-input" |
| `setProposal(code)` | 数字按钮 | 更新当前编辑的密码 |
| `confirmCode()` | [确认密码] | 锁定 proposal → confirmedCode，切到 verifier-select |
| `selectVerifier(i)` | 点击卡片 | 单选切换（再次点击取消），验证阶段可用 |
| `testVerifier()` | [测试] | 用 confirmedCode 测选中的卡片 fn，写入 TestRecord |
| `nextRound()` | [下一轮] | confirmedCode=null, gamePhase="code-input", selectedVerifier=null |
| `submitFinalAnswer(code)` | [提交] 弹窗 | 比对 code 与 secretCode → solved / failed |
| `reset()` | [重新开始] | 全部清空 |

---

## 验证流程

```typescript
// 从 API 解析问题
function resolveProblem(api: ApiResponse): Problem {
  return {
    secretCode: parseCode(api.code),
    verifiers: api.ind.map((cardId, i) => {
      const lawId = api.law[i];
      return {
        cardId,
        lawId,
        fn: lawMap[lawId],
        desc: criteriaCards.find(c => c.id === cardId)
                ?.candidates.find(c => c.lawId === lawId)?.desc ?? "",
      };
    }),
  };
}

// 单卡片验证（由 gameStore.testVerifier() 调用）
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
| `VerifierPanel` | 展示题目卡片图片，左上角字母 A/B/C/...，验证阶段可选，已测卡片显示结果 |
| `CodeInput` | ▲ ■ ● 数字选择器（1-5 按钮组），编码阶段显示确认按钮，确认后锁定 |
| `GameControls` | 根据 phase + gamePhase 渲染按钮组（确认密码/测试/下一轮/提交答案/重新开始） |
| `TestHistory` | 按轮次分组展示所有历史验证记录 |
| `NoteSheet` | 折叠式推理笔记文本框 |

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
  code: 254,           // 秘密答案（数字，需转为字符串 "254"）
  n: 5,                // 验证器数量
  ind: [2,6,13,17,21], // 标准卡 ID
  law: [25,38,95,87,81], // law ID（激活的候选函数）
  crypt: [224,490,386,395,523],
  hash: "B51 V63 5 ",
  par: 7,
  fake?: [1,11,13,25,20]  // 极限模式（m=1）下存在
}
```

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
5. lawMap 和 criteriaCards 由用户描述 + 开发者实现，两阶段构建
6. 颜色与 code 索引映射：`code[0] = ▲(蓝)`, `code[1] = ■(黄)`, `code[2] = ●(紫)`
7. 每轮最多验证 3 次，每次只测 1 张卡片
8. 卡片用字母标识：A/B/C/D...，对应下标 0/1/2/3...
9. 最终答案通过独立弹窗提交，编码区的数字仅用于本轮验证
