'use client'

// Simplified 3D Hero Component for build compatibility
// Three.js dependencies temporarily removed to resolve build issues

import React from 'react'

export function Hero3D() {
  return (
    <div className="relative w-full h-full">
      {/* Simplified 3D hero placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-4">WebClone Pro</div>
            <div className="text-lg text-white/80">Advanced Web Cloning Technology</div>
          </div>
        </div>
      </div>
      
      {/* Floating elements simulation */}
      <div 
        className="absolute w-12 h-12 bg-blue-400 rounded-full opacity-70"
        style={{ top: '20%', left: '10%', animation: 'float 3s ease-in-out infinite' }}
      />
      <div 
        className="absolute w-8 h-8 bg-purple-400 rounded-full opacity-70"
        style={{ top: '60%', right: '15%', animation: 'float 4s ease-in-out infinite reverse' }}
      />
      <div 
        className="absolute w-10 h-10 bg-green-400 rounded-full opacity-70"
        style={{ bottom: '20%', left: '20%', animation: 'float 3.5s ease-in-out infinite' }}
      />
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

export default Hero3D