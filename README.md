# Shanghai Gaokao Analytics 上海高考录取分析

A comprehensive web application for analyzing Shanghai university admission data with bilingual support (Chinese/English).

## 🌟 Features

### **📊 Dashboard**
- Interactive university search with real-time filtering
- Click on any university to view trend popup modals
- Load more functionality for browsing large datasets
- University statistics overview

### **📈 Trends Analysis**
- **By University Mode**: Analyze individual university admission trends
- **By Major Group Mode**: Compare up to 6 major groups side-by-side
- Auto-search functionality - results appear immediately as you type
- Interactive charts with line/bar view toggles
- Historical trend analysis across multiple years

### **⚖️ Compare Analysis**
- **University Comparison**: Compare multiple universities side-by-side
- **Major Group Comparison**: Detailed major group analysis
- **Interactive Detail Modals**: Click on universities to customize:
  - Select specific major groups to include
  - Choose particular years for analysis
  - Real-time statistics updates based on filters
- **Filter Persistence**: Applied filters are saved and reflected in comparison stats
- **Visual Indicators**: See which universities have custom filters applied

### **🎯 Ranking Lookup**
- Input your ranking to find available major groups
- **Safety Level System**:
  - 🟢 **Safe**: 1000+ ranking margin
  - 🟡 **Moderate**: 500-1000 ranking margin  
  - 🔴 **Risky**: <500 ranking margin
- Sorted results by competitiveness
- Year-specific searches for accurate analysis

### **🌍 Internationalization**
- **Complete Bilingual Support**: Chinese (default) & English
- 200+ translation keys covering entire application
- **Persistent Language Settings**: Choice saved in localStorage
- **Context-Aware Translations**: Smart parameter interpolation
- **SSR-Safe**: No hydration errors with server-side rendering

### **📱 User Experience**
- **Responsive Design**: Mobile-friendly layouts
- **Modern UI**: Tailwind CSS with Framer Motion animations
- **Collapsible Help Sections**: Contextual guidance on every page
- **Consistent Navigation**: Unified header and footer across all pages
- **Interactive Elements**: Hover effects, smooth transitions, visual feedback

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data**: Local JSON with university admission records
- **Deployment**: GitHub Pages with GitHub Actions

## 🚀 Live Demo

**Website**: https://666keke.github.io/Shanghai-Gaokao/

## 📊 Data Coverage

- **Universities**: 100+ Shanghai universities
- **Years**: 2020-2024 admission data
- **Records**: 10,000+ admission records
- **Major Groups**: Comprehensive coverage of all major categories

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Export static site
npm run export
```

## 📝 Usage Guide

### Dashboard
1. Search for universities using the search bar
2. Click on any university card to view trend popup modal
3. Use "Load More" to browse additional results

### Trends Analysis
1. Toggle between "By University" and "By Major Group" modes
2. Search for specific universities or major groups
3. In Major Group mode, select up to 6 groups for comparison
4. View interactive charts with line/bar toggle options

### Compare Analysis
1. Select comparison mode: Universities or Major Groups
2. Add items using the "Add" button and search functionality
3. **For Universities**: Click on any university card to open detailed customization
4. **Customize Filters**: Select specific major groups and years
5. **View Updated Stats**: All statistics reflect your custom filters
6. **Visual Indicators**: See "已筛选" (Filtered) badges on customized universities

### Ranking Lookup
1. Enter your ranking position (lower number = better ranking)
2. Select the academic year for analysis
3. Review results with safety level indicators
4. Use margin information to assess admission probability

## 🌏 Language Support

The application defaults to Chinese but supports seamless language switching:

- **Chinese (中文)**: Complete localization for Chinese users
- **English**: Full English interface for international users
- **Dynamic Switching**: Change language anytime via globe icon in navigation
- **Persistent Preference**: Language choice saved across sessions

## 📈 Recent Updates

- ✅ Complete bilingual internationalization system
- ✅ University detail modals with filter customization
- ✅ Filter persistence in comparison views  
- ✅ Auto-search functionality in trends page
- ✅ Safety-coded ranking lookup system
- ✅ Responsive design improvements
- ✅ SSR compatibility fixes
- ✅ Collapsible help sections
- ✅ Full-width footer consistency

---

**Last Updated**: $(date '+%Y-%m-%d %H:%M:%S')

*Built with ❤️ for Shanghai students and parents*
