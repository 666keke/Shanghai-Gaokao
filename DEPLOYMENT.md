# Deployment Guide for Gaokao Analytics

This guide provides step-by-step instructions for deploying your Gaokao Analytics website to different platforms.

## 🚀 Quick Deploy Options

### Option 1: GitHub Pages (Free, Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Actions**
   - The `.github/workflows/deploy.yml` file is already configured
   - Go to your repository settings → Actions → General
   - Enable "Allow all actions and reusable workflows"

3. **Configure Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Add your Supabase credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Your site will be available at: `https://your-username.github.io/gaokao-analytics`

### Option 2: Hugging Face Spaces (Free)

1. **Create a Space**
   - Go to [Hugging Face Spaces](https://huggingface.co/spaces)
   - Click "Create new Space"
   - Choose "Static" as the Space SDK

2. **Build and Deploy**
   ```bash
   npm run build
   export HF_TOKEN=your_huggingface_token
   python scripts/deploy-hf.py
   ```

3. **Manual Upload (Alternative)**
   - Build the project: `npm run build`
   - Upload the contents of the `out/` folder to your Space

### Option 3: Vercel (Easiest, Free)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Add your Supabase credentials in the Vercel dashboard

3. **Deploy**
   - Vercel will automatically deploy on every push to main

## 🗄️ Database Setup (Supabase)

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Create Database Tables

Run this SQL in the Supabase SQL Editor:

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

### 3. Import Data

1. **Using the Dashboard:**
   - Go to Table Editor → university_data
   - Click "Insert" → "Insert via CSV"
   - Upload your `data.json` file (you may need to convert it to CSV first)

2. **Using the API (Recommended):**
   ```javascript
   // You can create a script to import the JSON data
   // See the lib/supabase.ts file for helper functions
   ```

### 4. Set Row Level Security (Optional but Recommended)

```sql
-- Enable RLS
ALTER TABLE university_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Allow public read access to university data
CREATE POLICY "Allow public read access" ON university_data FOR SELECT USING (true);

-- Allow users to manage their own favorites
CREATE POLICY "Users can manage their own favorites" ON user_favorites 
FOR ALL USING (auth.uid()::text = user_id);
```

## 🔧 Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)

## 📊 Data Structure

Your `data.json` should contain university admission records with this structure:

```json
[
  {
    "组名": "复旦大学(01)",
    "院校名": "复旦大学",
    "组号": "01",
    "投档线": "580及以上",
    "语文数学合计": null,
    "外语": null,
    "选考最高": null,
    "选考次高": null,
    "选考最低": null,
    "加分": null,
    "最低排名": 1293.0,
    "年份": 2020
  }
]
```

## 🎨 Customization

### Colors and Styling
- Edit `tailwind.config.js` for color themes
- Modify `app/globals.css` for global styles

### Features
- Add new pages in the `app/` directory
- Create new components in the `components/` directory
- Update navigation in `components/Navigation.tsx`

## 🚨 Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`
- Verify environment variables are set correctly

### Deployment Issues
- **GitHub Pages**: Check Actions tab for build logs
- **Vercel**: Check deployment logs in dashboard
- **Hugging Face**: Ensure the `out/` directory contains all files

### Database Issues
- Verify Supabase credentials in environment variables
- Check that tables exist and have correct structure
- Ensure Row Level Security policies allow necessary access

## 📈 Performance Optimization

1. **Enable Caching**
   - The app uses Next.js static generation for optimal performance
   - Data is loaded client-side for interactivity

2. **Optimize Images**
   - Add university logos to `public/images/`
   - Use Next.js Image component for optimization

3. **Bundle Analysis**
   ```bash
   npm run build
   npx @next/bundle-analyzer
   ```

## 🔐 Security

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use platform-specific environment variable systems

2. **Supabase Security**
   - Enable Row Level Security (RLS)
   - Use proper authentication for user-specific features

3. **API Keys**
   - Only use public/anon keys in frontend code
   - Keep service role keys server-side only

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/gaokao-analytics/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/gaokao-analytics/discussions)
- **Documentation**: This deployment guide and README.md

---

**Happy Deploying! 🚀** 