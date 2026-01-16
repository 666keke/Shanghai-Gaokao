'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionaries
const translations = {
  zh: {
    // Navigation
    'nav.dashboard': '首页',
    'nav.library': '院校库',
    'nav.lookup': '查询',
    'nav.title': '上海高考志愿分析',

    // Disclaimer
    'disclaimer.title': '使用须知',
    'disclaimer.content': '本网站所有信息仅供参考，不构成任何招生建议。数据来源于公开渠道，可能存在误差或更新延迟。使用前请务必核实官方发布的最新信息，并自行承担因使用本网站信息而产生的风险。',
    'disclaimer.agree': '我已阅读并理解',

    // Admission Chance Calculator
    'calc.title': '录取概率分析',
    'calc.subtitle': '输入排名并确认，生成结果',
    'calc.yourRanking': '您的高考排名',
    'calc.placeholder': '例如：5000',
    'calc.hint': '排名越小越好，1为最高',
    'calc.referenceYear': '参考年份',
    'calc.viewAll': '查看完整列表',
    'calc.confirm': '确认',
    'calc.possiblySafe': '可能安全',
    'calc.possiblySafe.desc': '投档线580分及以上，无法精确评估安全程度',
    'calc.possiblySafe.info': '上海市不公布580分以上专业组的实际投档分数（仅显示"580及以上"），最低排名为恰好580分对应的排名。您的排名已达到录取门槛，但由于无法知道实际录取分数，无法精确评估安全程度。',
    'calc.safe': '安全',
    'calc.safe.desc': '余量 > 1000名，录取概率很高',
    'calc.moderate': '稳妥',
    'calc.moderate.desc': '余量 500-1000名，有较大把握',
    'calc.risky': '冲刺',
    'calc.risky.desc': '余量 < 500名，有一定风险',
    'calc.notAdmitted': '未录取',
    'calc.notAdmitted.desc': '您的排名未达到最低要求',
    'calc.stats.accessible': '可选专业占比',
    'calc.stats.safe': '安全选项',
    'calc.stats.universities': '可选院校',
    'calc.stats.totalPrograms': '可选专业组',
    'calc.viewMore': '查看更多 +{count}',
    'calc.empty.title': '开始分析您的录取机会',
    'calc.empty.desc': '输入您的高考排名，我们将为您分析所有可选的专业组，并按录取安全程度分类展示',
    
    // Common
    'common.loading': '加载中...',
    'common.search': '搜索',
    'common.year': '年份',
    'common.ranking': '排名',
    'common.university': '大学',
    'common.majorGroup': '专业组',
    'common.add': '添加',
    'common.remove': '移除',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.close': '关闭',
    'common.expand': '展开',
    'common.collapse': '收起',
    'common.clearSearch': '清除搜索',
    
    // Dashboard
    'dashboard.title': '大学录取智能分析',
    'dashboard.subtitle': '基于 {count} 条录取数据的 {years} 年综合分析',
    'dashboard.search.placeholder': '搜索大学...',
    'dashboard.search.button': '搜索',
    'dashboard.stats.universities': '所大学',
    'dashboard.stats.records': '录取记录',
    'dashboard.stats.years': '年数据',
    'dashboard.stats.avgRanking': '平均排名',
    'dashboard.search.results': '大学搜索结果',
    'dashboard.university.admissionScore': '投档线',
    'dashboard.university.minRanking': '最低排名',
    'dashboard.university.group': '专业组',
    'dashboard.loadMore': '加载更多 ({remaining} 条剩余)',
    'dashboard.searchResults.count': '找到 {count} 个结果',
    'dashboard.searchResults.query': '搜索: "{query}"',
    'dashboard.quickActions': '快捷入口',
    'dashboard.liveSnapshot': '实时洞察',
    'dashboard.topUniversities': '热门大学',
    'dashboard.exploreByYear': '按年份探索',
    'dashboard.filters.title': '筛选器',
    'dashboard.filters.rankOnly': '仅显示有排名',
    'dashboard.filters.enabled': '已开启',
    'dashboard.filters.disabled': '已关闭',
    'dashboard.sortBy': '排序方式',
    'dashboard.sort.orderAsc': '升序',
    'dashboard.sort.orderDesc': '降序',
    'dashboard.sort.name': '按大学',
    'dashboard.sort.score': '按投档线',
    'dashboard.sort.ranking': '按最低排名',
    'dashboard.view': '视图密度',
    'dashboard.view.compact': '紧凑',
    'dashboard.view.comfort': '舒适',
    'dashboard.actions.startSearch': '开始探索',
    'dashboard.actions.viewTrends': '查看趋势',
    'dashboard.actions.viewCompare': '开始对比',
    'dashboard.actions.viewLookup': '按排名查找',
    'dashboard.results.empty': '没有匹配结果',
    'dashboard.results.emptyHint': '尝试调整搜索条件或年份',
    'dashboard.logoCloud.title': '院校徽章墙',
    'dashboard.logoCloud.subTitle': '重点院校',
    'dashboard.heroInsights.title': '实时洞察',
    'dashboard.heroInsights.subtitle': '一眼把握整体录取格局',
    'dashboard.heroInsights.badge': '实时',
    'dashboard.heroInsights.ranked': '含排名数据',
    'dashboard.heroInsights.signals': '关键要点',
    'dashboard.heroInsights.signalYear': '当前筛选年份：{year}',
    'dashboard.heroInsights.signalResults': '筛选结果：{count} 条',
    'dashboard.heroInsights.signalUniversities': '覆盖院校：{count} 所',
    'dashboard.heroInsights.cta': '进入筛选',
    
    // Smart Search
    'smartSearch.avgRanking': '平均排名: {rank}',
    'smartSearch.programsCount': '{count} 项',
    'smartSearch.tip': '请使用官方四字简称进行搜索。例：北京航空航天大学 -> 北京航大',
    'smartSearch.noResults': '找不到与 "{query}" 相关的结果。',
    
    // Library Page (formerly Trends + Compare)
    'library.title': '院校库',
    'library.subtitle': '探索大学和专业组，进行对比',
    'library.byUniversity': '按大学分析',
    'library.byMajorGroup': '按专业组分析',
    'library.addUniversity': '添加大学',
    'library.addMajorGroup': '添加专业组',
    'library.searchUniversities': '搜索大学...',
    'library.searchMajorGroups': '搜索专业组...',
    'library.noUniversitiesSelected': '请添加大学开始分析',
    'library.noMajorGroupsSelected': '请添加专业组开始分析',
    'library.maxUniversities': '还可添加 {count} 所大学',
    'library.maxMajorGroups': '还可添加 {count} 个专业组',
    'library.universityTrendComparison': '录取趋势对比',
    'library.majorGroupTrendComparison': '专业组趋势对比',
    'library.universitiesComparing': '所大学对比中',
    'library.majorGroupsComparing': '个专业组对比中',
    'library.majorGroupDetails': '专业组详情',
    'library.yearlyComparison': '各年指标数据对比',
    'library.majorGroup': '专业组',
    'library.university': '所属大学',
    'library.avgRanking': '平均排名',
    'library.addMajorGroupHint': '点击上方"添加专业组"按钮选择专业组进行对比',
    'library.selectUniversity': '请选择大学查看录取趋势',
    
    // Trends Page (kept for backwards compatibility)
    'trends.title': '院校库',
    'trends.subtitle': '探索大学和专业组录取趋势',
    'trends.analysisMode': '分析模式',
    'trends.byUniversity': '按大学分析',
    'trends.byMajorGroup': '按专业组分析',
    'trends.searchUniversities': '搜索大学',
    'trends.searchUniversities.placeholder': '搜索大学...',
    'trends.selectedUniversity': '选择的大学',
    'trends.searchMajorGroups': '搜索专业组',
    'trends.searchMajorGroups.placeholder': '搜索专业组...',
    'trends.selectedMajorGroups': '选择的专业组 ({count}/6)',
    'trends.noMajorGroups': '未选择专业组',
    'trends.selectUniversity': '请选择大学查看趋势',
    'trends.popularUniversities': '其他大学趋势',
    'trends.marketSummary': '市场趋势总结',
    'trends.programGrowth': '专业增长 (2024 vs 2023)',
    'trends.totalUniversities': '大学总数',
    'trends.historicalCoverage': '历史数据覆盖',
    'trends.years': '年',
    'trends.majorGroupsTable': '专业组详情',
    'trends.majorGroupsTable.subtitle': '该大学在不同年份的所有专业组',
    'trends.majorGroupsTable.groupName': '专业组名称',
    'trends.majorGroupsTable.groupNumber': '组号',
    'trends.majorGroupsTable.admissionScore': '投档线',
    'trends.majorGroupsTable.minRanking': '最低排名',
    'trends.majorGroupsTable.year': '年份',
    'trends.majorGroupsTable.filterByYear': '按年份筛选',
    'trends.majorGroupsTable.allYears': '所有年份',
    
    // Compare Page
    'compare.title': '大学对比分析',
    'compare.subtitle': '并排对比录取统计和趋势',
    'compare.comparisonMode': '对比模式',
    'compare.compareUniversities': '对比大学',
    'compare.compareMajorGroups': '对比专业组',
    'compare.quickSummary': '快速对比总结',
    'compare.universitiesSelected': '所选大学',
    'compare.majorGroupsSelected': '所选专业组',
    'compare.totalPrograms': '总专业数',
    'compare.avgRankingAll': '平均排名（全部）',
    'compare.yearsCovered': '覆盖年份',
    
    // Lookup Page
    'lookup.title': '排名查询',
    'lookup.subtitle': '根据排名查找可选专业组',
    'lookup.enterRanking': '输入您的排名',
    'lookup.yourRanking': '您的排名',
    'lookup.yourRanking.placeholder': '输入您的排名（例如：5000）',
    'lookup.yourRanking.help': '输入您的排名位次（数字越小排名越好）',
    'lookup.academicYear': '学年',
    'lookup.searchResults': '搜索结果：为排名 {ranking} 在 {year} 年找到 {count} 个可选专业组',
    'lookup.availableMajorGroups': '可选专业组',
    'lookup.sortedByCompetitiveness': '按竞争激烈程度排序',
    'lookup.minRanking': '最低排名',
    'lookup.yourMargin': '您的余量',
    'lookup.gap': '差距',
    'lookup.scoreLine': '分数线',
    'lookup.safetyLevel': '安全等级',
    'lookup.allLevels': '全部等级',
    'lookup.possiblySafe': '🔵 可能安全',
    'lookup.safe': '🟢 安全',
    'lookup.moderate': '🟡 中等',
    'lookup.risky': '🔴 有风险',
    'lookup.noResults': '未找到结果',
    'lookup.noResults.message': '未找到排名 {ranking} 在 {year} 年的专业组。请尝试调整排名或选择不同年份。',
    'lookup.showingResults': '显示前 50 个结果（共找到 {total} 个）',
    
    // Unified Compare Component
    'unified.universityComparison': '大学对比',
    'unified.majorGroupComparison': '专业组对比',
    'unified.addUniversity': '添加大学',
    'unified.addMajorGroup': '添加专业组',
    'unified.searchUniversities.placeholder': '搜索大学...',
    'unified.searchMajorGroups.placeholder': '搜索专业组...',
    'unified.noUniversitiesSelected': '未选择大学进行对比',
    'unified.noMajorGroupsSelected': '未选择专业组进行对比',
    'unified.clickToStart.university': '点击"添加大学"开始对比',
    'unified.clickToStart.majorGroup': '点击"添加专业组"开始对比',
    'unified.programs': '专业',
    'unified.records': '记录',
    'unified.avgRanking': '平均排名',
    'unified.bestRanking': '最佳排名',
    'unified.recentPrograms': '近期专业',
    'unified.recentRecords': '近期记录',
    'unified.years': '年份',
    'unified.trend': '趋势',
    'unified.trend.stable': '稳定',
    'unified.trend.up': '上升',
    'unified.trend.down': '下降',
    
    // University Detail Modal
    'detail.universityDetails': '大学详情与自定义',
    'detail.selectYears': '选择年份',
    'detail.selectMajorGroups': '选择专业组 ({selected}/{total})',
    'detail.majorGroupStatistics': '专业组统计',
    'detail.records': '记录',
    'detail.avgRanking': '平均排名',
    'detail.bestRanking': '最佳排名',
    'detail.years': '年份',
    'detail.scoreHistory': '分数历史',
    'detail.selectionSummary': '选择总结',
    'detail.selectedYears': '选择的年份',
    'detail.selectedMajorGroups': '选择的专业组',
    'detail.totalRecords': '总记录数',
    'detail.clickForDetails': '（点击查看详情）',
    'detail.filtered': '已筛选',
    'detail.filterInfo': '{groups} 个专业组，{years} 个年份',
    
    // Trend Chart
    'chart.admissionTrends': '录取趋势',
    'chart.line': '线图',
    'chart.bar': '柱图',
    'chart.noData': '无 {name} 的趋势数据',
    'chart.averageRanking': '平均排名',
    'chart.applications': '申请数',
    'chart.bestYear': '最佳年份',
    'chart.trend': '趋势',
    'chart.years': '年份',
    'chart.improving': '↗️ 改善中',
    'chart.declining': '↘️ 下降中',
    'chart.stable': '→ 稳定',
    
    // Help Sections
    'help.howToUse': '使用说明',
    'help.understandingComparisons': '理解对比',
    'help.understandingTrends': '理解趋势',
    
    // Help Content - Compare
    'help.compare.instruction1': '• 最多添加 5 个{type}进行对比',
    'help.compare.instruction2': '• 查看包括平均排名、专业数量和趋势在内的关键指标',
    'help.compare.instruction3': '• 对比历史表现和近期专业设置',
    'help.compare.instruction4': '• 使用趋势指标了解录取难度变化',
    'help.compare.universities': '所大学',
    'help.compare.majorGroups': '个专业组',
    'help.compare.tip1': '• 排名越低表示专业越具竞争力/知名度越高',
    'help.compare.tip2': '• 趋势指标：↗️ 改善中（竞争力增强），↘️ 下降中（竞争力减弱），→ 稳定',
    'help.compare.tip3': '• 近期专业显示 2022-2024 年数据，具有当前相关性',
    'help.compare.tip4': '• 总专业数表示每个{type}的专业设置广度',
    
    // Help Content - Lookup
    'help.lookup.instruction1': '• 排名：输入您的排名位次（1 为最佳，数字越大排名越低）',
    'help.lookup.instruction2': '• 安全等级：🟢 安全（余量1000+），🟡 中等（余量500-1000），🔴 有风险（余量<500）',
    'help.lookup.instruction3': '• 余量：最低排名与您的排名之间的差值（越高越安全）',
    'help.lookup.instruction4': '• 结果：显示您的排名达到或超过最低要求的所有专业组',
    
    // Help Content - Trends
    'help.trends.instruction1': '• 分析模式：在大学和专业组分析之间切换，获得不同视角',
    'help.trends.instruction2': '• 趋势指标：上升趋势意味着竞争力增强（更难录取）',
    'help.trends.instruction3': '• 多选功能：在专业组模式下最多可并排对比 6 个专业组',
    'help.trends.instruction4': '• 时间范围：图表显示可用年份的录取排名变化',
    'help.trends.instruction5': '• 最佳年份：表示该专业录取竞争最小的年份',
    
    // Language
    'language.chinese': '中文',
    'language.english': 'English',
    'language.select': '选择语言',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Home',
    'nav.library': 'Library',
    'nav.lookup': 'Full List',
    'nav.title': 'Shanghai Gaokao Analytics',

    // Disclaimer
    'disclaimer.title': 'Important Notice',
    'disclaimer.content': 'All information on this website is for reference only and does not constitute any admission advice. Data is sourced from public channels and may contain errors or delays. Please verify official sources before use and assume all risks associated with using this information.',
    'disclaimer.agree': 'I Understand',

    // Admission Chance Calculator
    'calc.title': 'Enter Your Ranking',
    'calc.subtitle': 'Get your admission chances with ease',
    'calc.yourRanking': 'Your Gaokao Ranking',
    'calc.placeholder': 'e.g., 5000',
    'calc.hint': 'Lower ranking = better (1 is the best)',
    'calc.referenceYear': 'Reference Year',
    'calc.viewAll': 'View Full List',
    'calc.confirm': 'Confirm',
    'calc.possiblySafe': 'Possibly Safe',
    'calc.possiblySafe.desc': 'Admission score 580+, safety level cannot be precisely assessed',
    'calc.possiblySafe.info': 'Shanghai does not publish actual admission scores for programs with 580+ score lines (only shows "580 and above"). The minimum ranking is the ranking at exactly 580 points. Your ranking meets the admission threshold, but precise safety level cannot be assessed since the actual admission score is unknown.',
    'calc.safe': 'Safe',
    'calc.safe.desc': 'Margin > 1000, very high admission chance',
    'calc.moderate': 'Moderate',
    'calc.moderate.desc': 'Margin 500-1000, good admission chance',
    'calc.risky': 'Reach',
    'calc.risky.desc': 'Margin < 500, some risk involved',
    'calc.notAdmitted': 'Not Admitted',
    'calc.notAdmitted.desc': 'Your ranking does not meet the minimum requirement',
    'calc.stats.accessible': 'Accessible Programs',
    'calc.stats.safe': 'Safe Options',
    'calc.stats.universities': 'Universities',
    'calc.stats.totalPrograms': 'Total Programs',
    'calc.viewMore': 'View More +{count}',
    'calc.empty.title': 'Start Analyzing Your Chances',
    'calc.empty.desc': 'Enter your gaokao ranking to see all available programs, categorized by admission safety level',
    
    // Common
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.year': 'Year',
    'common.ranking': 'Ranking',
    'common.university': 'University',
    'common.majorGroup': 'Major Group',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.expand': 'Expand',
    'common.collapse': 'Collapse',
    'common.clearSearch': 'Clear search',
    
    // Dashboard
    'dashboard.title': 'University Admission Intelligence',
    'dashboard.subtitle': 'Comprehensive analytics for Chinese university admissions with {count} records across {years} years',
    'dashboard.search.placeholder': 'Search universities...',
    'dashboard.search.button': 'Search',
    'dashboard.stats.universities': 'Universities',
    'dashboard.stats.records': 'Admission Records',
    'dashboard.stats.years': 'Years of Data',
    'dashboard.stats.avgRanking': 'Avg. Ranking',
    'dashboard.search.results': 'University Search Results',
    'dashboard.university.admissionScore': 'Admission Score',
    'dashboard.university.minRanking': 'Min Ranking',
    'dashboard.university.group': 'Group',
    'dashboard.loadMore': 'Load More ({remaining} remaining)',
    'dashboard.searchResults.count': 'Found {count} results',
    'dashboard.searchResults.query': 'Search: "{query}"',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.liveSnapshot': 'Live Snapshot',
    'dashboard.topUniversities': 'Top Universities',
    'dashboard.exploreByYear': 'Explore by year',
    'dashboard.filters.title': 'Filters',
    'dashboard.filters.rankOnly': 'Ranked only',
    'dashboard.filters.enabled': 'Enabled',
    'dashboard.filters.disabled': 'Disabled',
    'dashboard.sortBy': 'Sort by',
    'dashboard.sort.orderAsc': 'Ascending',
    'dashboard.sort.orderDesc': 'Descending',
    'dashboard.sort.name': 'Name',
    'dashboard.sort.score': 'Score',
    'dashboard.sort.ranking': 'Min ranking',
    'dashboard.view': 'View density',
    'dashboard.view.compact': 'Compact',
    'dashboard.view.comfort': 'Comfortable',
    'dashboard.actions.startSearch': 'Start exploring',
    'dashboard.actions.viewTrends': 'View trends',
    'dashboard.actions.viewCompare': 'Start comparison',
    'dashboard.actions.viewLookup': 'Ranking lookup',
    'dashboard.results.empty': 'No matching results',
    'dashboard.results.emptyHint': 'Try adjusting filters or year',
    'dashboard.logoCloud.title': 'University badges',
    'dashboard.logoCloud.subTitle': 'Featured',
    'dashboard.heroInsights.title': 'Live insights',
    'dashboard.heroInsights.subtitle': 'Understand the admission landscape at a glance',
    'dashboard.heroInsights.badge': 'Live',
    'dashboard.heroInsights.ranked': 'With rankings',
    'dashboard.heroInsights.signals': 'Key signals',
    'dashboard.heroInsights.signalYear': 'Selected year: {year}',
    'dashboard.heroInsights.signalResults': 'Filtered results: {count}',
    'dashboard.heroInsights.signalUniversities': 'Universities covered: {count}',
    'dashboard.heroInsights.cta': 'Open filters',
    
    // Smart Search
    'smartSearch.avgRanking': 'Avg. Ranking: {rank}',
    'smartSearch.programsCount': '{count} programs',
    'smartSearch.tip': 'Tip: You should search with the official 4-word abbreviation.',
    'smartSearch.noResults': 'No results found for "{query}".',
    
    // Library Page (formerly Trends + Compare)
    'library.title': 'University Library',
    'library.subtitle': 'Explore admission trends and compare universities and major groups',
    'library.byUniversity': 'By University',
    'library.byMajorGroup': 'By Major Group',
    'library.addUniversity': 'Add University',
    'library.addMajorGroup': 'Add Major Group',
    'library.searchUniversities': 'Search universities...',
    'library.searchMajorGroups': 'Search major groups...',
    'library.noUniversitiesSelected': 'Add universities to start analyzing',
    'library.noMajorGroupsSelected': 'Add major groups to start analyzing',
    'library.maxUniversities': '{count} more universities can be added',
    'library.maxMajorGroups': '{count} more major groups can be added',
    'library.universityTrendComparison': 'Admission Trend Comparison',
    'library.majorGroupTrendComparison': 'Major Group Trend Comparison',
    'library.universitiesComparing': 'universities comparing',
    'library.majorGroupsComparing': 'major groups comparing',
    'library.majorGroupDetails': 'Major Group Details',
    'library.yearlyComparison': 'Yearly Data Comparison',
    'library.majorGroup': 'Major Group',
    'library.university': 'University',
    'library.avgRanking': 'Avg Ranking',
    'library.addMajorGroupHint': 'Click "Add Major Group" button above to select major groups for comparison',
    'library.selectUniversity': 'Select a university to view admission trends',
    
    // Trends Page (kept for backwards compatibility)
    'trends.title': 'University Library',
    'trends.subtitle': 'Explore university admission trends',
    'trends.analysisMode': 'Analysis Mode',
    'trends.byUniversity': 'By University',
    'trends.byMajorGroup': 'By Major Group',
    'trends.searchUniversities': 'Search Universities',
    'trends.searchUniversities.placeholder': 'Search for a university...',
    'trends.selectedUniversity': 'Selected University',
    'trends.searchMajorGroups': 'Search Major Groups',
    'trends.searchMajorGroups.placeholder': 'Search for major groups...',
    'trends.selectedMajorGroups': 'Selected Major Groups ({count}/6)',
    'trends.noMajorGroups': 'No major groups selected',
    'trends.selectUniversity': 'Select a university to view trends',
    'trends.popularUniversities': 'Other Universities Trends',
    'trends.marketSummary': 'Market Trends Summary',
    'trends.programGrowth': 'Program Growth (2024 vs 2023)',
    'trends.totalUniversities': 'Total Universities',
    'trends.historicalCoverage': 'Historical Data Coverage',
    'trends.years': 'Years',
    'trends.majorGroupsTable': 'Major Groups Details',
    'trends.majorGroupsTable.subtitle': 'All major groups for this university across different years',
    'trends.majorGroupsTable.groupName': 'Major Group Name',
    'trends.majorGroupsTable.groupNumber': 'Group Number',
    'trends.majorGroupsTable.admissionScore': 'Admission Score',
    'trends.majorGroupsTable.minRanking': 'Min Ranking',
    'trends.majorGroupsTable.year': 'Year',
    'trends.majorGroupsTable.filterByYear': 'Filter by Year',
    'trends.majorGroupsTable.allYears': 'All Years',
    
    // Compare Page
    'compare.title': 'University Comparison',
    'compare.subtitle': 'Compare admission statistics and trends side by side',
    'compare.comparisonMode': 'Comparison Mode',
    'compare.compareUniversities': 'Compare Universities',
    'compare.compareMajorGroups': 'Compare Major Groups',
    'compare.quickSummary': 'Quick Comparison Summary',
    'compare.universitiesSelected': 'Universities Selected',
    'compare.majorGroupsSelected': 'Major Groups Selected',
    'compare.totalPrograms': 'Total Programs',
    'compare.avgRankingAll': 'Avg Ranking (All)',
    'compare.yearsCovered': 'Years Covered',
    
    // Lookup Page
    'lookup.title': 'Ranking Lookup',
    'lookup.subtitle': 'Find available major groups based on your ranking',
    'lookup.enterRanking': 'Enter Your Ranking',
    'lookup.yourRanking': 'Your Ranking',
    'lookup.yourRanking.placeholder': 'Enter your ranking (e.g., 5000)',
    'lookup.yourRanking.help': 'Enter your ranking position (lower number = better ranking)',
    'lookup.academicYear': 'Academic Year',
    'lookup.searchResults': 'Search Results: Found {count} available major groups for ranking {ranking} in {year}',
    'lookup.availableMajorGroups': 'Available Major Groups',
    'lookup.sortedByCompetitiveness': 'Sorted by competitiveness',
    'lookup.minRanking': 'Min Ranking',
    'lookup.yourMargin': 'Your Margin',
    'lookup.gap': 'Gap',
    'lookup.scoreLine': 'Score Line',
    'lookup.safetyLevel': 'Safety Level',
    'lookup.allLevels': 'All Levels',
    'lookup.possiblySafe': '🔵 Possibly Safe',
    'lookup.safe': '🟢 Safe',
    'lookup.moderate': '🟡 Moderate',
    'lookup.risky': '🔴 Risky',
    'lookup.noResults': 'No Results Found',
    'lookup.noResults.message': 'No major groups found for ranking {ranking} in {year}. Try adjusting your ranking or selecting a different year.',
    'lookup.showingResults': 'Showing top 50 results ({total} total found)',
    
    // Unified Compare Component
    'unified.universityComparison': 'University Comparison',
    'unified.majorGroupComparison': 'Major Group Comparison',
    'unified.addUniversity': 'Add University',
    'unified.addMajorGroup': 'Add Major Group',
    'unified.searchUniversities.placeholder': 'Search universities...',
    'unified.searchMajorGroups.placeholder': 'Search major groups...',
    'unified.noUniversitiesSelected': 'No universities selected for comparison',
    'unified.noMajorGroupsSelected': 'No major groups selected for comparison',
    'unified.clickToStart.university': 'Click "Add University" to start comparing',
    'unified.clickToStart.majorGroup': 'Click "Add Major Group" to start comparing',
    'unified.programs': 'Programs',
    'unified.records': 'Records',
    'unified.avgRanking': 'Avg Ranking',
    'unified.bestRanking': 'Best Ranking',
    'unified.recentPrograms': 'Recent Programs',
    'unified.recentRecords': 'Recent Records',
    'unified.years': 'Years',
    'unified.trend': 'Trend',
    'unified.trend.stable': 'Stable',
    'unified.trend.up': 'Up',
    'unified.trend.down': 'Down',
    
    // University Detail Modal
    'detail.universityDetails': 'University Details & Customization',
    'detail.selectYears': 'Select Years',
    'detail.selectMajorGroups': 'Select Major Groups ({selected}/{total})',
    'detail.majorGroupStatistics': 'Major Group Statistics',
    'detail.records': 'Records',
    'detail.avgRanking': 'Avg Ranking',
    'detail.bestRanking': 'Best Ranking',
    'detail.years': 'Years',
    'detail.scoreHistory': 'Score History',
    'detail.selectionSummary': 'Selection Summary',
    'detail.selectedYears': 'Selected Years',
    'detail.selectedMajorGroups': 'Selected Major Groups',
    'detail.totalRecords': 'Total Records',
    'detail.clickForDetails': '(Click for details)',
    'detail.filtered': 'Filtered',
    'detail.filterInfo': '{groups} major groups, {years} years',
    
    // Trend Chart
    'chart.admissionTrends': 'Admission Trends',
    'chart.line': 'Line',
    'chart.bar': 'Bar',
    'chart.noData': 'No trend data available for {name}',
    'chart.averageRanking': 'Average Ranking',
    'chart.applications': 'Applications',
    'chart.bestYear': 'Best Year',
    'chart.trend': 'Trend',
    'chart.years': 'Years',
    'chart.improving': '↗️ Improving',
    'chart.declining': '↘️ Declining',
    'chart.stable': '→ Stable',
    
    // Help Sections
    'help.howToUse': 'How to Use',
    'help.understandingComparisons': 'Understanding Comparisons',
    'help.understandingTrends': 'Understanding Trends',
    
    // Help Content - Compare
    'help.compare.instruction1': '• Add up to 5 {type} for comparison',
    'help.compare.instruction2': '• View key metrics including average rankings, program counts, and trends',
    'help.compare.instruction3': '• Compare historical performance and recent program offerings',
    'help.compare.instruction4': '• Use the trend indicators to understand admission difficulty changes',
    'help.compare.universities': 'universities',
    'help.compare.majorGroups': 'major groups',
    'help.compare.tip1': '• Lower rankings indicate more competitive/prestigious programs',
    'help.compare.tip2': '• Trend indicators: ↗️ Improving (becoming more competitive), ↘️ Declining (less competitive), → Stable',
    'help.compare.tip3': '• Recent programs show data from 2022-2024 for current relevance',
    'help.compare.tip4': '• Total programs indicates the breadth of offerings at each {type}',
    
    // Help Content - Lookup
    'help.lookup.instruction1': '• Ranking: Enter your ranking position (1 is the best, higher numbers are lower rankings)',
    'help.lookup.instruction2': '• Safety Levels: 🟢 Safe (1000+ margin), 🟡 Moderate (500-1000 margin), 🔴 Risky (<500 margin)',
    'help.lookup.instruction3': '• Margin: The difference between the minimum ranking and your ranking (higher is safer)',
    'help.lookup.instruction4': '• Results: Shows all major groups where your ranking meets or exceeds the minimum requirement',
    
    // Help Content - Trends
    'help.trends.instruction1': '• Analysis Modes: Switch between university and major group analysis for different perspectives',
    'help.trends.instruction2': '• Trend Indicators: Rising trends mean becoming more competitive (harder to get in)',
    'help.trends.instruction3': '• Multi-selection: Compare up to 6 major groups side by side in major group mode',
    'help.trends.instruction4': '• Time Range: Charts show admission ranking changes over the available years',
    'help.trends.instruction5': '• Best Year: Indicates when admission was least competitive for that program',
    
    // Language
    'language.chinese': '中文',
    'language.english': 'English',
    'language.select': 'Select Language',
  }
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('zh') // Default to Chinese
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount (client-side only)
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language
      if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  // Save language to localStorage when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  // Translation function with interpolation support
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = (translations[language] as any)[key] || key
    
    // Simple interpolation for {variable} syntax
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(value))
      })
    }
    
    return translation
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'zh', setLanguage: handleSetLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 