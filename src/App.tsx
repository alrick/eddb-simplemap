import { Map } from './components/Map'
import { MapTrifold } from '@phosphor-icons/react'

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <MapTrifold size={28} weight="duotone" className="text-primary" />
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Interactive Map
          </h1>
        </div>
      </header>
      
      <main className="flex-1">
        <Map />
      </main>
    </div>
  )
}

export default App