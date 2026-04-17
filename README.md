# 上海高考志愿分析

[English](./README.en.md)

一个面向上海高考考生和家长的志愿分析工作台。它基于 2020-2024 年上海本科普通批投档数据，帮助用户从自己的全市位次出发，快速看到可选专业组范围、风险层级和多年趋势。

在线访问：[https://666keke.github.io/Shanghai-Gaokao/](https://666keke.github.io/Shanghai-Gaokao/)

> 本项目只做历史数据整理和交互分析，不替代当年招生专业目录、院校招生章程或上海市教育考试院发布的官方信息。

## 为什么做

填报志愿时，最难的不是找到一条分数线，而是理解自己处在什么位置、哪些选择相对安全、哪些选择需要谨慎比较。本工具把“位次输入、范围判断、院校查询、专业组趋势、对比篮”放在同一个流程里，减少来回查表和手工整理。

## 主要功能

- **从位次开始**：在首页输入高考全市排名，选择参考年份，直接查看可选范围。
- **位次分布提示**：用所选年份投档最低排名的分布展示当前位置，帮助理解“更靠前 / 更靠后”的相对关系。
- **安全层级分组**：按位次余量将专业组分为可能安全、安全、稳妥、冲刺等层级。
- **排名查询**：在 `/lookup/` 按位次、年份、院校、专业组快速筛选录取记录。
- **院校库与趋势分析**：在 `/trends/` 查看院校和专业组的多年投档线、最低排名和变化趋势。
- **对比篮**：浏览时可把院校或具体专业组加入对比篮，也可再次点击移除。
- **专业组取舍**：在院校分析里可隐藏暂时不看的专业组，图表会随之更新。
- **移动端表格优化**：对比表在手机上使用更紧凑的卡片组织，减少横向滚动成本。
- **中英文界面**：内置语言切换，便于不同用户阅读。

## 页面说明

| 路径 | 用途 |
| --- | --- |
| `/` | 首页工作台：输入位次、查看范围、进入常看院校和对比流程 |
| `/lookup/` | 排名查询：按条件筛选录取记录，并把院校或专业组加入对比 |
| `/trends/` | 院校库：查看院校 / 专业组多年趋势、对比表和图表 |

## 推荐使用流程

1. 在首页输入自己的高考全市排名。
2. 选择一个参考年份，先看整体可选范围和安全层级。
3. 进入排名查询，筛掉明显不合适的结果。
4. 把感兴趣的院校或具体专业组加入对比篮。
5. 在院校库里查看多年趋势，临时隐藏不考虑的专业组。
6. 最后对照当年招生专业目录、选科要求、招生计划和院校章程做确认。

## 数据口径

项目使用本地 JSON 数据：

- `public/data.json`：应用运行时使用的数据。
- `data.json`：仓库根目录保留的数据副本。

主要字段包括：

| 字段 | 含义 |
| --- | --- |
| `年份` | 数据年份 |
| `院校名` | 院校名称 |
| `组名` | 院校专业组名称，例如 `复旦大学(01)` |
| `组号` | 专业组编号 |
| `投档线` | 当年投档最低分或特殊标记 |
| `最低排名` | 对应投档线的最低排名 |
| `语文数学合计`、`外语`、`选考最高` 等 | 最后一名投档考生的相关分项信息，缺失时为 `null` |

需要特别注意：

- `580及以上` 这类记录无法还原精确分数，只能用于边界参考。
- 最低排名不等于录取承诺。同分竞争、选科限制、招生计划变化、专业备注、体检要求等都会影响最终结果。
- 院校名称、专业组编号和招生范围每年都可能调整，正式填报前必须以当年官方文件为准。
- 首页的分布图基于历史投档最低排名分布，不是全体考生人数分布。

## 技术栈

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Fuse.js
- Lucide React
- 本地静态 JSON 数据

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 构建与静态部署

项目在 `next.config.js` 中启用了静态导出：

```js
output: 'export'
```

生产构建：

```bash
npm run build
```

构建后会生成 `out/` 目录。当前生产配置会使用 `/Shanghai-Gaokao` 作为 `basePath` 和资源前缀，适合部署到 GitHub Pages：

```text
https://<username>.github.io/Shanghai-Gaokao/
```

本地预览静态产物可以使用任意静态服务器，例如：

```bash
python3 -m http.server 3001 --directory out
```

## 项目结构

```text
.
├── app/
│   ├── HomePageClient.tsx
│   ├── lookup/page.tsx
│   ├── trends/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AdmissionChanceCalculator.tsx
│   ├── MajorGroupCompare.tsx
│   ├── MajorGroupsTable.tsx
│   ├── MultiTrendChart.tsx
│   ├── Navigation.tsx
│   ├── UniversityCompare.tsx
│   └── ui/
├── contexts/
│   ├── CompareBasketContext.tsx
│   ├── DisclaimerContext.tsx
│   └── LanguageContext.tsx
├── lib/
│   └── utils.ts
├── public/
│   ├── data.json
│   └── univ_svg/
├── README.md
└── README.en.md
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 生成静态生产构建 |
| `npm run lint` | 运行 Next.js ESLint 检查 |

## 免责声明

本项目用于辅助理解历史投档数据和志愿风险，不提供录取保证，也不构成报考建议。请在正式填报前核对上海市教育考试院、目标院校招生章程、当年招生专业目录和学校官方通知。
