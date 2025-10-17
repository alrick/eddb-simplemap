import { useState } from 'react'
import { Map } from './components/Map'
import { MapTrifold, MapPin } from '@phosphor-icons/react'

function App() {
  const [pointCount, setPointCount] = useState<number | null>(null)

  return (
    <div className="fixed inset-0 flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-border">
              <img 
                src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==" 
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