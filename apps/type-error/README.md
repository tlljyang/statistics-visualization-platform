# 第一类与第二类错误可视化 (Type I & II Error Visualization)

这是一个使用 Cycle.js + TypeScript 构建的交互式统计学教学应用，用于可视化假设检验中的第一类错误（Type I Error，α）和第二类错误（Type II Error，β）。

## 项目概述

该应用通过交互式可视化帮助理解统计假设检验中的核心概念：

- **第一类错误（α）**：当原假设（H₀）为真时，错误地拒绝原假设的概率（假阳性）
- **第二类错误（β）**：当备择假设（H₁）为真时，错误地保留原假设的概率（假阴性）
- **显著性水平**：用户可调整的阈值，用于决定是否拒绝原假设
- **临界值**：根据显著性水平计算的决策边界

## 技术栈

- **Cycle.js** - 响应式框架，使用 MVI (Model-View-Intent) 架构模式
  - `@cycle/state` - 状态管理库，使用 reducer 模式
  - `@cycle/isolate` - 组件隔离机制，实现作用域状态
  - `@cycle/dom` - DOM 驱动，处理用户交互
  - `@cycle/run` - 运行时环境
- **TypeScript** - 提供类型安全的开发体验
- **D3.js** - 数据驱动的可视化库，用于绘制统计分布图
- **jStat** - 统计计算库，用于计算正态分布的逆函数
- **xstream** - 流处理库，处理异步数据流（支持 fromDiagram 用于测试）
- **Vite** - 快速的构建工具和开发服务器
- **Mocha + Chai** - 测试框架
- **Biome** - 代码检查和格式化工具

## 项目结构

```
├── src/
│   ├── main.ts                     # 应用程序入口，配置 Cycle.js 驱动
│   ├── types/
│   │   └── jstat.d.ts              # jStat 库的 TypeScript 类型定义
│   ├── utils/
│   │   └── dom-helper.ts           # DOM 辅助工具
│   ├── drivers/
│   │   └── config-driver.ts        # 自定义配置驱动
│   └── components/                 # 组件化架构
│       ├── TypeErrorsApp/          # 根组件
│       │   ├── index.ts            # 主组件入口
│       │   ├── types.ts            # 类型定义
│       │   ├── intent.ts           # Intent 层
│       │   ├── model.ts            # Model 层（计算状态）
│       │   └── view.ts             # View 层
│       ├── ControlPanel/           # 控制面板组件
│       │   ├── index.ts            # 组件入口
│       │   ├── types.ts            # 类型定义
│       │   ├── intent.ts           # Intent 层
│       │   ├── model.ts            # Model 层（reducer）
│       │   └── view.ts             # View 层
│       └── Chart/                  # 图表组件
│           ├── index.ts            # 组件入口
│           ├── types.ts            # 类型定义
│           ├── view.ts             # View 层
│           ├── graph.ts            # 可视化组件：分布曲线、错误区域
│           └── axes.ts             # 坐标轴组件
├── test/
│   ├── components/                 # 组件测试
│   │   ├── TypeErrorsApp/
│   │   │   └── model.test.ts       # TypeErrorsApp 模型测试
│   │   ├── ControlPanel/
│   │   │   ├── intent.test.ts      # ControlPanel intent 测试
│   │   │   └── model.test.ts       # ControlPanel 模型测试
│   │   └── Chart/
│   │       └── view.test.ts        # Chart view 测试
│   └── helpers/
│       └── test-utils.ts           # 测试辅助工具
├── docs/
│   └── component-architecture.md   # 组件架构文档
├── index.html                      # HTML 入口
├── package.json                    # 项目依赖和脚本
├── tsconfig.json                   # TypeScript 配置
├── tsconfig.test.json              # 测试环境的 TypeScript 配置
├── vite.config.ts                  # Vite 构建配置
└── biome.json                      # 代码检查和格式化配置
```

## 功能特性

### 交互式控件

应用提供四个交互式滑块，用户可以实时调整：

1. **显著性水平 (α)**：范围 0.01 - 0.20
2. **零假设均值 (μ₀)**：范围 0 - 2
3. **真实均值 (μ₁)**：范围 0 - 3
4. **标准差 (σ)**：范围 0.1 - 2

### 可视化组件

- **零假设分布曲线**：显示在原假设为真时的分布
- **真实分布曲线**：显示在备择假设为真时的分布
- **第一类错误区域**：用红色高亮显示拒绝域（假阳性区域）
- **第二类错误区域**：用蓝色高亮显示接受域（假阴性区域）
- **临界值线**：标示决策边界
- **假设文本**：动态显示 H₀ 和 H₁ 的数学表达式

### 支持的检验类型

- 双侧检验（two-tailed）：Hₐ: μ ≠ μ₀
- 右侧检验（right-tailed）：Hₐ: μ > μ₀
- 左侧检验（left-tailed）：Hₐ: μ < μ₀

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

启动开发服务器（默认 http://localhost:5173）：

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 测试

### 运行所有测试

```bash
npm test
```

### 运行特定测试文件

```bash
npm run test:files test/type-errors/model.test.ts
```

### 测试覆盖范围

测试覆盖以下功能：
- **组件隔离测试** - 验证 isolate() 的状态隔离
- **Reducer 模式测试** - 使用 fromDiagram 模拟用户输入序列
- **Model 测试** - 状态转换逻辑和默认初始化
- **Intent 测试** - DOM 事件到 actions 的转换
- **View 测试** - virtual DOM 生成
- **计算状态测试** - 分布生成、临界值计算、比例尺创建

### 测试方法

项目使用 **TDD (测试驱动开发)** 方法：

1. **fromDiagram** - 使用 marble diagrams 模拟异步流
   ```typescript
   const actions = {
     alpha$: fromDiagram('a-b-|').mapTo(0.08),
     nullMean$: fromDiagram('-a-|').mapTo(1)
   };
   ```

2. **Reducer 测试** - 验证状态转换
   ```typescript
   reducer$.addListener({
     next: (reducer) => {
       const newState = reducer(previousState);
       expect(newState).to.deep.equal(expectedState);
     }
   });
   ```

3. **组件隔离测试** - 确保 isolate() 正常工作

## 代码质量

### 代码检查

```bash
npm run lint
```

### 自动修复

```bash
npm run lint:fix
```

### 代码格式化

```bash
npm run format
```

## 架构说明

### 组件化 MVI 架构

项目采用基于 `@cycle/state` 和 `@cycle/isolate` 的组件化 MVI 架构：

```
TypeErrorsApp (Root)
├── ControlPanel (with isolate('params'))
│   └── 4个滑块控件 (alpha, nullMean, trueMean, stdDev)
└── Chart (props-based, 无状态)
    ├── 分布曲线
    ├── 临界值线
    ├── 错误区域
    └── 假设文本
```

### 关键特性

1. **状态管理** - 使用 `@cycle/state` 的 reducer 模式
   - 不使用 `startWith`，改用 `defaultReducer` 初始化状态
   - 所有状态变更通过 reducer 函数
   - 支持嵌套状态和组件隔离

2. **组件隔离** - 使用 `isolate()` 实现作用域状态
   - `ControlPanel` 通过 `isolate(Component, 'params')` 隔离
   - 子组件状态自动提升到父组件的嵌套状态
   - 避免状态冲突，支持组件复用

3. **数据流模式**
```
用户输入 (Slider)
    ↓
ControlPanel.intent() → Actions
    ↓
ControlPanel.model() → Reducer<ParamsState>
    ↓
TypeErrorsApp 合并 reducer → 更新 state.params
    ↓
TypeErrorsApp.model() → 重新计算 computed state
    ↓
Chart 接收 props → 渲染可视化
```

### 组件职责

- **TypeErrorsApp (根组件)**
  - 组合 ControlPanel 和 Chart
  - 管理全局状态树 (config, params, computed)
  - 从 CONFIG driver 读取配置
  - 计算衍生状态 (scales, distributions, critical values)

- **ControlPanel (有状态组件)**
  - 承载 4 个滑块控件
  - 捕获用户输入并生成 actions
  - 通过 reducer 更新 params 状态
  - 使用 isolate 隔离到 'params' 键

- **Chart (无状态组件)**
  - 纯展示组件，通过 props 接收数据
  - 渲染 SVG 可视化
  - 使用 D3.js 绘制分布曲线和错误区域

### MVI 分层

每个组件都遵循 MVI 模式：

1. **Intent（意图）** - 从 DOM 事件流提取 actions
2. **Model（模型）** - 将 actions 转换为 state reducers
3. **View（视图）** - 将 state 映射为 virtual DOM

## TypeScript 类型策略

项目采用**适度类型安全**策略：

- **公共 API**：完整的类型定义（`DistributionPoint`、`Scales`、`Actions`、`Sources`、`Sinks`）
- **内部实现**：D3 选择器和 Snabbdom vnode 操作使用 `any` 类型，避免复杂的类型体操
- **组件类型**：每个组件都有明确的 Sources 和 Sinks 接口

## 架构演进

### 从单体到组件化

项目最初采用单体架构，后来重构为组件化架构：

**旧架构 (单体)**:
```
type-errors/
├── index.ts  # 所有逻辑在一个文件
├── model.ts  # 集中式状态管理
├── graph.ts  # 可视化组件
└── axes.ts   # 坐标轴组件
```

**新架构 (组件化)**:
```
components/
├── TypeErrorsApp/    # 根组件，组合子组件
├── ControlPanel/     # 独立的控制面板组件
└── Chart/           # 独立的图表组件
```

### 重构关键变化

#### 1. 状态管理模式

**旧方式**:
```typescript
// 使用 startWith 初始化状态
const state$ = actions.alpha$
  .startWith(0.05)
  .map(alpha => ({ ...prevState, alpha }));
```

**新方式**:
```typescript
// 使用 defaultReducer 初始化状态
const defaultReducer = () => ({
  alpha: 0.05,
  nullMean: 0,
  trueMean: 1,
  stdDev: 1
});

const alphaReducer$ = actions.alpha$.map(
  alpha => prev => ({ ...prev, alpha })
);

const reducer$ = xs.merge(
  xs.of(defaultReducer),
  alphaReducer$
);
```

#### 2. 组件组合

**旧方式**:
```typescript
// 单个组件管理所有逻辑
function main(sources) {
  const actions = intent(sources);
  const state$ = model(actions, sources);
  const vdom$ = view(state$);
  return { DOM: vdom$ };
}
```

**新方式**:
```typescript
// 组合多个子组件
function TypeErrorsApp(sources) {
  const controlPanelSinks = isolate(ControlPanel, 'params')(sources);
  const chartSinks = Chart({ props: chartProps$ });

  const vdom$ = view(controlPanelSinks.DOM, chartSinks.DOM);

  return {
    DOM: vdom$,
    state: xs.merge(reducer$, controlPanelSinks.state)
  };
}
```

#### 3. 类型定义

**新架构引入了严格的类型定义**:
```typescript
// 每个组件都有明确的 Sources 和 Sinks
interface Sources {
  DOM: DOMSource;
  state: StateSource<SomeState>;
}

interface Sinks {
  DOM: Stream<VNode>;
  state: Stream<Reducer<SomeState>>;
}
```

### 重构收益

✅ **更好的关注点分离** - 每个组件职责单一
✅ **可测试性提升** - 组件可独立测试
✅ **可复用性** - ControlPanel 和 Chart 可在其他项目中复用
✅ **状态管理清晰** - 使用 @cycle/state 的 reducer 模式
✅ **组件隔离** - 使用 isolate() 避免状态冲突
✅ **类型安全** - 完整的 TypeScript 类型定义
✅ **性能优化** - 细粒度的状态更新，避免不必要的重渲染

### 迁移指南

如果你想将现有的 Cycle.js 应用迁移到这种架构模式，请参考：

1. **安装依赖**
   ```bash
   npm install @cycle/state @cycle/isolate
   ```

2. **包装根组件**
   ```typescript
   import { withState } from "@cycle/state";

   const main = withState(YourApp);
   ```

3. **使用 reducer 模式**
   - 移除所有 `startWith`
   - 改用 `defaultReducer` 初始化状态
   - 所有状态变更通过 reducer 函数

4. **拆分组件**
   - 识别可独立的功能模块
   - 为每个模块创建独立的组件
   - 使用 `isolate` 隔离有状态的组件

5. **使用 props 传递数据**
   - 无状态组件通过 props 接收数据
   - 有状态组件使用 isolate 管理状态

详细的迁移步骤请参考 [组件架构文档](docs/component-architecture.md)。

## 学习资源

这个项目适合学习以下概念：

- **Cycle.js 响应式编程** - MVI 架构模式
- **组件化架构** - 使用 @cycle/state 和 @cycle/isolate
- **Reducer 模式** - 函数式状态管理
- **TDD 方法** - 使用 fromDiagram 进行流测试
- **TypeScript 在实际项目中的应用**
- **D3.js 数据可视化**
- **统计假设检验的核心概念**
- **xstream 流式编程**

## 相关文档

- [组件架构详细设计](docs/component-architecture.md) - 深入了解组件化设计
- [Cycle.js 官方文档](https://cycle.js.org/)
- [@cycle/state 文档](https://github.com/cyclejs/state)
- [xstream 文档](https://github.com/staltz/xstream)
