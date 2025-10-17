import { useState } from 'react'
import { Map } from './components/Map'
import { MapTrifold, MapPin } from '@phosphor-icons/react'
import unifrLogo from '@/assets/images/unifr-logo.jpg'

function App() {
  const [pointCount, setPointCount] = useState<number | null>(null)

  return (
    <div className="fixed inset-0 flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-border">
              <img 
                src={unifrLogo}
                alt="UniFr Logo" 
                className="w-9 h-9 object-contain"
              />
              <MapTrifold size={32} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Ludus
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Data from{' '}
                <a 
                  href="https://eddb.unifr.ch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  EDDB service
                </a>
              </p>
            </div>
          </div>
          
          {pointCount !== null && (
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
              <MapPin size={20} weight="fill" className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {pointCount.toLocaleString()} {pointCount === 1 ? 'point' : 'points'}
              </span>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <Map onPointCountChange={setPointCount} />
      </main>
    </div>
  )
}

export default App