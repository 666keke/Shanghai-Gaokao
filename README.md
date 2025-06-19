# Gaokao Analytics 🎓

A modern, interactive web application for analyzing Chinese university admission data (Gaokao) from 2020-2024. Built with Next.js, TypeScript, and Tailwind CSS.

![Gaokao Analytics](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔍 University Search & Discovery
- **Smart Search**: Real-time search across 650+ universities
- **Advanced Filtering**: Filter by year, admission scores, and rankings
- **Detailed Information**: Comprehensive admission data for each program

### 📊 Interactive Analytics
- **Trend Visualization**: Interactive charts showing admission trends over time
- **Statistical Insights**: Average rankings, score distributions, and performance metrics
- **Comparative Analysis**: Side-by-side university comparisons

### 🎯 Smart Tools
- **University Comparison**: Compare multiple universities with detailed metrics
- **Historical Analysis**: Track admission trends from 2020-2024
- **Ranking Intelligence**: Understand ranking patterns and changes

### 💾 Data Management
- **Supabase Integration**: Cloud database for user preferences and favorites
- **Real-time Updates**: Dynamic data loading and caching
- **Export Capabilities**: Download analysis results

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion for animations
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel, GitHub Pages, Hugging Face Spaces

## 📈 Data Overview

- **6,715 admission records** across 5 years (2020-2024)
- **653 unique universities** from across China
- **Multiple program tracks** per university
- **Comprehensive metrics**: Admission scores, rankings, subject requirements

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/gaokao-analytics.git
   cd gaokao-analytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Production Build

```bash
npm run build
npm run start
```

## 🗄️ Database Setup (Supabase)

### Create Tables

```sql
-- University admission data table
CREATE TABLE university_data (
  id SERIAL PRIMARY KEY,
  组名 TEXT NOT NULL,
  院校名 TEXT NOT NULL,
  组号 TEXT NOT NULL,
  投档线 TEXT NOT NULL,
  语文数学合计 INTEGER,
  外语 INTEGER,
  选考最高 INTEGER,
  选考次高 INTEGER,
  选考最低 INTEGER,
  加分 INTEGER,
  最低排名 INTEGER,
  年份 INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites table
CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  university_name TEXT NOT NULL,
  university_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, university_name, university_group)
);

-- Create indexes for better performance
CREATE INDEX idx_university_data_name ON university_data(院校名);
CREATE INDEX idx_university_data_year ON university_data(年份);
CREATE INDEX idx_university_data_ranking ON university_data(最低排名);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
```

### Import Data

Use the Supabase dashboard or CLI to import the `data.json` file into the `university_data` table.

## 🚀 Deployment

### GitHub Pages / Hugging Face Spaces

1. **Build for static export**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   - Enable GitHub Pages in repository settings
   - Select "Deploy from a branch" and choose `gh-pages`
   - The site will be available at `https://your-username.github.io/gaokao-analytics`

3. **Deploy to Hugging Face Spaces**
   - Create a new Space on Hugging Face
   - Upload the `out/` directory contents
   - Configure as a static site

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

## 🎨 Features in Detail

### University Search
- **Instant Results**: Real-time search with debounced input
- **Smart Filtering**: Filter by admission scores, rankings, and years
- **Detailed Cards**: Rich information cards with key metrics

### Trend Analysis
- **Interactive Charts**: Line and bar charts for trend visualization
- **Historical Data**: 5 years of admission data trends
- **Ranking Analysis**: Track how university rankings change over time

### Comparison Tool
- **Multi-University**: Compare up to 5 universities simultaneously
- **Key Metrics**: Average rankings, best performance, program counts
- **Trend Indicators**: Visual trend indicators (up/down/stable)

### Data Insights
- **Statistical Overview**: Comprehensive statistics dashboard
- **Performance Metrics**: Average rankings, score distributions
- **Yearly Breakdown**: Year-over-year analysis and trends

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Enhanced experience on tablets
- **Desktop**: Full-featured desktop interface
- **Cross-Browser**: Compatible with all modern browsers

## 🔧 Configuration

### Customization Options

- **Theme Colors**: Modify `tailwind.config.js` for custom colors
- **Chart Styling**: Update chart configurations in components
- **Animation Settings**: Adjust Framer Motion animations
- **Search Behavior**: Configure search debounce and filters

### Performance Optimization

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component for optimized loading
- **Caching**: Intelligent caching for API responses
- **Bundle Analysis**: Use `npm run analyze` to analyze bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Data Source**: Chinese Ministry of Education admission data
- **UI Inspiration**: Modern data visualization best practices
- **Icons**: Lucide React icon library
- **Charts**: Recharts library for beautiful visualizations

## 📞 Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/your-username/gaokao-analytics/issues)
- **Discussions**: Join discussions on [GitHub Discussions](https://github.com/your-username/gaokao-analytics/discussions)
- **Email**: support@gaokao-analytics.com

---

**Made with ❤️ for Chinese students and families navigating university admissions**
