'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getSvgPath } from '../lib/utils'

const universities = [
  { name: 'Tsinghua', file: 'Tsinghua.svg' },
  { name: 'PKU', file: 'PKU.svg' },
  { name: 'FDU', file: 'FDU.svg' },
  { name: 'SJTU', file: 'SJTU.svg' },
  { name: 'ZJU', file: 'ZJU.svg' },
  { name: 'NJU', file: 'NJU.svg' },
  { name: 'Beihang', file: 'Beihang.svg' },
  { name: 'Tongji', file: 'Tongji.svg' },
  { name: 'Nankai', file: 'Nankai.svg' },
]

export default function UniversityBanner() {
  // Triple the array to create seamless loop
  const tripleUniversities = [...universities, ...universities, ...universities]
  
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="w-full overflow-hidden py-6">
      <div className="relative">
        <motion.div
          className="flex items-center gap-6 md:gap-12"
          animate={{
            x: [`0%`, `-${100 / 3}%`],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: isMobile ? 30 : 50,
              ease: "linear",
            },
          }}
          style={{ width: `300%` }}
        >
          {tripleUniversities.map((university, index) => (
            <div
              key={`${university.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center"
            >
              <div className="h-28 w-28 flex items-center justify-center mx-3 md:mx-6">
                <img
                  src={getSvgPath(university.file)}
                  alt={`${university.name} logo`}
                  className="h-full w-full object-contain opacity-40 hover:opacity-70 transition-opacity duration-300 filter grayscale hover:filter-none"
                  style={{
                    maxHeight: '112px',
                    maxWidth: '112px',
                  }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
} 