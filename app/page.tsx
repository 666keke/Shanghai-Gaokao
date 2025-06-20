import HomePageClient from './HomePageClient'
import fs from 'fs/promises'
import path from 'path'

interface UniversityData {
  组名: string
  院校名: string
  组号: string
  投档线: string
  语文数学合计: number | null
  外语: number | null
  选考最高: number | null
  选考次高: number | null
  选考最低: number | null
  加分: number | null
  最低排名: number | null
  年份: number
}

async function getData(): Promise<UniversityData[]> {
  const filePath = path.join(process.cwd(), 'public', 'data.json')
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error reading or parsing data.json:', error)
    return []
  }
}

export default async function HomePage() {
  const data = await getData()
  return <HomePageClient data={data} />
}