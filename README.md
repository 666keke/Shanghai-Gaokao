# Shanghai Gaokao Analytics 上海高考录取分析

一个用于分析上海高考招生数据的 Web 应用，为考生和家长提供全面的数据洞察。

## 🚀 在线访问

**网站**: https://666keke.github.io/Shanghai-Gaokao/

## ✨ 主要功能

- **📊 交互式仪表板**:
  - 实时搜索和筛选高校。
  - 点击高校卡片可查看历年分数线趋势。
- **📈 趋势分析**:
  - **按院校**: 分析单个院校的录取趋势。
  - **按专业组**: 同时比较多达6个专业组。
  - 实时搜索，即时显示结果。
- **⚖️ 对比分析**:
  - **院校对比**: 并排比较多个院校的录取数据。
  - **专业组对比**: 详细的专业组数据分析。
  - **自定义筛选**: 可针对特定院校筛选专业组和年份。
- **🎯 位次查询**:
  - 输入你的高考位次，查询可能录取的专业组。
  - 根据位次差距提供"安全"、"冲刺"、"危险"三种建议。

## 📁 目录结构

```
gaokao/
├── app/                      # Next.js 路由
│   ├── compare/              # 对比分析页面
│   ├── lookup/               # 位次查询页面
│   ├── trends/               # 趋势分析页面
│   ├── layout.tsx            # 全局布局
│   └── page.tsx              # 首页（仪表板）
├── components/               # React 组件
│   ├── ui/                   # 通用 UI 组件 (例如按钮)
│   ├── Navigation.tsx        # 导航栏
│   ├── TrendChart.tsx        # 趋势图表
│   └── ...                   # 其他页面特定组件
├── contexts/                 # React Context
│   └── LanguageContext.tsx   # 语言切换 Context
├── lib/                      # 辅助函数和工具
│   └── utils.ts              # 通用工具函数
├── public/                   # 静态资源
│   └── data.json             # 本地录取数据
├── scripts/                  # 脚本
│   └── deploy-hf.py          # 部署脚本
├── README.md                 # 项目说明（中文）
└── README.en.md              # 项目说明（英文）
```

## 🛠️ 技术栈

- **前端**: Next.js 14 (App Router) & TypeScript
- **样式**: Tailwind CSS
- **图表**: Recharts
- **动画**: Framer Motion
- **数据**: 本地 JSON 文件
- **部署**: Vercel

## 🔧 本地开发

首先，安装依赖：

```bash
npm install
```

然后，运行开发服务器：

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

---

*为上海考生和家长倾情打造 ❤️*
