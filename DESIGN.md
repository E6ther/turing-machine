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
│   │   ├── TestHistory.tsx     # 历史记录（表格展示，含占位行）
│   │   ├── ColorShape.tsx      # ▲■● 形状 SVG
│   │   └── MarkersBox.tsx      # 标记框（数字点击标记 ✓/✗）
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
  hash: string;            // API 返回的 hash，用于分享/搜索谜题
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
| `mode` | `number` | 游戏模式（0/1/2） |
| `hash` | `string` | API 返回的谜题 hash |
| `markers` | `Record<string, Mark>` | 标记框状态，key=`"${col}-${digit}"`，value=0/1/2 |

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
| `backToCodeInput()` | [返回] | 从验证阶段退回编码阶段（不递增轮次） |
| `cycleMarker(col, d)` | 标记框点击 | 循环切换标记状态：无→✓(绿)→✗(红)→无 |
| `clearState()` | 重置 | 全部清空 |

### 持久化

使用 Zustand `persist` 中间件，通过 `partialize` 只存储可序列化的字段，`merge` 回调在加载时重建非序列化字段：

```
持久化字段: lawIds(替代verifiers), records, markers, phase, gamePhase, confirmedCode, proposal, selectedVerifierIndex, currentRound, mode, hash, secretCode, ind, fake
重建字段:   verifiers = rebuildVerifiers(lawIds)  // 通过 getLawFn 还原函数引用
            problem = 从 secretCode/ind/fake/hash 重建
            displayOrder = buildDisplayOrder(ind, mode, fake)
```

Home 页面在挂载时检查 localStorage 中是否有 phase===playing 的存档，若有则自动跳转到 /game 继续游戏。

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
    hash: api.hash,            // 保留 hash 用于分享/搜索
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

### Hash 分享与搜索

游戏页面上方显示 `#{hash}`（title 形式，text-4xl font-black），右侧带"分享"按钮：

- 点击"分享"复制 `#{无空格hash}` 到剪贴板（自动去除中间空格）
- 按钮状态：点击后显示"已复制" 2 秒，图标颜色变为 `#e6e6e6`
- 复制的 hash 可在设置页"搜索谜题"中粘贴使用
- 搜索请求：`GET /api/api.php?uuid=...&h={hash}`

---

## 组件职责

| 组件 | 职责 |
|------|------|
| `VerifierPanel` | 按 displayOrder 展示卡片图片，每组对应一个字母标签。极限模式每组额外显示假卡图。点击可放大预览（仅真实卡）。 |
| `CodeInput` | ▲ ■ ● 数字选择器（1-5 按钮组），编码阶段显示确认按钮，确认后锁定。支持提交模式弹窗。 |
| `GameControls` | 根据 phase + gamePhase 渲染按钮组（确认密码/测试/下一轮/提交答案/重新开始） |
| `TestHistory` | 表格展示所有历史验证记录，含形状表头 + 字母标签，彩色数字方格，灰色虚线分隔行，无记录时显示 10 行占位符 |
| `ColorShape` | 渲染 ▲(蓝) ■(黄) ●(紫) 三种形状（纯 CSS 绘制） |
| `MarkersBox` | 标记框：显示 ▲■● 各 1-5 数字，每个数字可点击循环切换三种状态（无/绿色✓/红色✗），状态持久化到 localStorage |

---

## 按钮状态矩阵

| `gamePhase` / `phase` | 显示的按钮 |
|------------------------|------------|
| `code-input` | `[确认密码]` `[提交答案]` |
| `verifier-select`（有验证） | `[测试]` `[下一轮]` `[提交答案]` |
| `verifier-select`（本轮0次验证） | `[测试]` `[返回]` `[提交答案]` — "下一轮"变为"返回"，调用 backToCodeInput |
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
| 难度 | `d` | 0=简单, 1=标准, 2=困难 |
| 验证者数量 | `n` | 4, 5, 6 |

### 搜索谜题

在设置页底部可通过 hash 搜索特定谜题：

```
请求: GET /api/api.php?uuid=...&h={hash}
响应: 与随机题目相同的 ApiResponse 格式
```

hash 从游戏页面右上角的分享按钮复制（自动去除空格）。

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

### 宽屏（横屏）— 居中 + fixed 侧栏

```
                    游戏区域始终居中
  ←──────────────────────────────────────────→
     ┌──────┐   ┌───────────────┐   ┌──────┐
     │ 历史  │   │    游戏区域    │   │ 标记  │
     │fixed  │   │  max-w-lg     │   │fixed │
     │左侧   │   │  mx-auto      │   │右侧  │
     └──────┘   └───────────────┘   └──────┘
 right:calc(50%            │    left:calc(50%
 +16rem+1rem)              │    +16rem+1rem)
```

| 层级 | CSS 实现 | 说明 |
|------|----------|------|
| 外层容器 | `min-h-dvh bg-slate-50` + padding | 全屏背景 |
| 游戏区域 | `max-w-lg mx-auto relative` | 居中，作为侧栏定位参考 |
| 左侧历史 | `fixed top-1/2 -translate-y-1/2 right-[calc(50%+16rem+1rem)]` | 垂直居中，附着在游戏左侧 |
| 右侧标记 | `fixed top-1/2 -translate-y-1/2 left-[calc(50%+16rem+1rem)]` | 垂直居中，附着在游戏右侧 |

- 历史侧栏始终渲染（无记录时显示 10 行占位符）
- 标记框显示 ▲■● 各 1-5 数字，支持点击标记 ✓/✗

### 竖屏（移动端）— 左右悬浮按钮 + 弹窗

```
┌──────────────────────┐
│                      │
│      游戏内容         │
│                      │
│ ┌────┐     ┌────┐    │  ← 左右居中竖长方形按钮
│ │历史│     │标记│    │     fixed left/right-0 top-1/2
│ │记录│     │    │    │     -translate-y-1/2
│ └────┘     └────┘    │     bg-[#56b3dc] / bg-[#febc11]
└──────────────────────┘
   ↓ 点击按钮
┌──────────────────────┐
│ ████████████████████  │  ← 全屏半透明遮罩
│ ┌────────────────┐   │  ← 卡片（白色 rounded-xl）
│ │ ✕              │   │     靠左/靠右显示
│ │  表格/标记内容  │   │     点击遮罩关闭
│ │                │   │
│ └────────────────┘   │
└──────────────────────┘
```

| 按钮 | 位置 | 颜色 | 弹窗对齐 |
|------|------|------|----------|
| 历史记录 | `left-0` | `bg-[#56b3dc]` (蓝三角色) | `justify-start` (靠左) |
| 标记 | `right-0` | `bg-[#febc11]` (黄方块色) | `justify-end` (靠右) |

- 关闭按钮使用圆形容器 `w-6 h-6 bg-white rounded-full shadow`，置于内容区右上角外部
- 弹窗点击遮罩区域自动关闭，内容区点击通过 `stopPropagation` 阻止关闭

### 游戏操作框（编码/验证）— 底部悬浮

编码框和验证框都使用 `sticky bottom-4 z-10 shadow-lg` 悬浮在屏幕底部：

- 向下滚动时，操作框吸附在视口底部上方 1rem 处，覆盖上方的验证器图片
- 使用 `flex flex-col` 布局，按钮通过 `mt-auto` 贴在框的底部
- 两个框通过 `min-h-[17rem]` 保持统一高度
- `bottom-4` 保证悬浮时与底部有间隙，避免贴紧底边时跳动

```
┌──────────────────────────────┐
│                              │
│         游戏内容 / 图片        │
│                              │
├──────────────────────────────┤  ← sticky bottom-4
│  ┌────────────────────────┐  │     z-10 shadow-lg
│  │  本轮密码 ▲2 ■3 ●4     │  │
│  │  选择要测试的验证器     │  │
│  │    A  B  C  D          │  │
│  │  [返回] [测试] [提交]   │  │  ← mt-auto
│  └────────────────────────┘  │
└──────────────────────────────┘
```

### 响应式策略

| 设备 | 历史记录展示方式 | 标记展示方式 |
|------|-----------------|-------------|
| 宽屏 (`!layout.isMobile`) | 游戏左侧 fixed 侧栏 | 游戏右侧 fixed 侧栏 |
| 竖屏 (`layout.isMobile`) | 左侧悬浮按钮 → 点击弹出靠左浮层 | 右侧悬浮按钮 → 点击弹出靠右浮层 |

---

## 提交最终答案页面设计

### 入口

游戏任意阶段（`code-input` 或 `verifier-select`）的"提交答案"按钮 → 打开全屏覆层。

### 覆层三视图

#### 视图 A：输入密码

```
┌──────────────────────────────────┐
│  ███████████████████████████████  │  bg-black/50 全屏遮罩
│  ┌──────────────────────────┐    │
│  │      提交最终答案          │    │  text-lg font-bold 标题
│  │                          │    │
│  │  #B4D N5A       [分享]    │    │  hash + 分享，复用现有逻辑
│  │                          │    │
│  │  ▲  [1][2][3][4][5]      │    │  CodeInput (hideTitle)
│  │  ■  [1][2][3][4][5]      │    │  继承当前 proposal 作为初始值
│  │  ●  [1][2][3][4][5]      │    │
│  │                          │    │
│  │  [取消]      [提交]       │    │  取消=bg-gray-200 提交=bg-[#2db563](右侧)
│  └──────────────────────────┘    │
└──────────────────────────────────┘
```

#### 视图 B：结果正确

```
┌──────────────────────────────┐
│                              │
│      ✅ 答案正确！             │  text-green-600 text-xl
│                              │
│  #B4D N5A           [分享]    │  ← hash + 分享按钮
│                              │
│      你找出密码花费了          │
│      3 轮 7 个问题            │  玩家实际数据
│                              │
│      图灵机花费了             │
│      2 轮 6 个问题            │  par 数据
│                              │
│  ┌────────────────────────┐  │
│  │ 恭喜你战胜了图灵机！     │  │  绿色卡片 (bg-green-50 text-green-700)
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 很抱歉你没有战胜图灵机   │  │  红色卡片 (bg-red-50 text-red-700)
│  └────────────────────────┘  │
│                              │
│           [回到主页]          │  → set phase="solved", navigate("/")
└──────────────────────────────┘
```

#### 视图 C：结果错误

```
┌──────────────────────────────┐
│                              │
│      ❌ 答案错误               │  text-red-600 text-xl
│                              │
│  #B4D N5A           [分享]    │  ← hash + 分享按钮
│                              │
│      密码不是 ▲3■5●2          │  显示用户提交的密码
│                              │
│      [继续]    [查看答案]      │
└──────────────────────────────┘
       │               │
       │               └─ 点击 → 下方 reveal 正确密码
       │                         按钮变为 [回到主页]
       ▼
┌──────────────────────────────┐
│      ❌ 答案错误               │
│                              │
│  #B4D N5A           [分享]    │  ← hash + 分享按钮
│                              │
│      密码不是 ▲3■5●2          │
│                              │
│      正确密码: ▲1■4●3         │  ← 新增显示 secretCode
│                              │
│           [回到主页]          │  → set phase="failed", navigate("/")
└──────────────────────────────┘
```

### 状态管理

```typescript
type SubmitView = "none" | "input" | "correct" | "incorrect" | "answer-revealed";
```

| 视图 | 进入条件 | 按钮 | 行为 |
|------|----------|------|------|
| `input` | 点击"提交答案" | [取消] [提交] | 取消→关闭 / 提交→调submitFinalAnswer（不修改phase） |
| `correct` | submitFinalAnswer 返回 true | [回到主页] | set phase="solved", navigate("/") |
| `incorrect` | submitFinalAnswer 返回 false | [继续] [查看答案] | 继续→关闭 / 查看答案→reveal |
| `answer-revealed` | 点击[查看答案] | [回到主页] | set phase="failed", navigate("/") |

注：`submitFinalAnswer` 仅做密码比对返回 boolean，不再修改 phase。phase 由各视图的"回到主页"按钮自行设置。

### 比较逻辑（正确视图）

```
玩家轮次 = new Set(records.map(r => r.round)).size
玩家问题 = records.length
TM轮次   = Math.ceil(par / 3)
TM问题   = par

玩家轮次 <= TM轮次 && 玩家问题 <= TM问题
  → 绿色卡片 "恭喜你战胜了图灵机！"
否则
  → 红色卡片 "很抱歉你没有战胜图灵机"
```

### 数据结构变更

```diff
// src/core/types.ts
interface Problem {
  ...
+ par: number;
}

// src/core/machine.ts: resolveProblem 透传 api.par
// src/store/gameStore.ts: 新增 par 状态 + partialize + merge 重建
```

### 实施文件清单

| 文件 | 改动 |
|------|------|
| `src/core/types.ts` | `Problem` 接口增加 `par` |
| `src/core/machine.ts` | `resolveProblem` 透传 `par` |
| `src/store/gameStore.ts` | 新增 `par` 字段、持久化、重建 |
| `src/components/CodeInput.tsx` | 新增 `hideTitle` prop |
| `src/components/GameControls.tsx` | "确认密码"→"验证密码"；"提交答案"按钮改为紫圆色 `#7f66ad` |
| `src/pages/Game.tsx` | 重写 submit 相关部分：全屏覆层 + 三视图切换 |
