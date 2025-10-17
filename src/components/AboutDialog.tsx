import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info } from '@phosphor-icons/react'
import { marked } from 'marked'
import { config } from '@/config'

export function AboutDialog() {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAboutContent = async () => {
      try {
        const response = await import(`../about/${config.appName}.md?raw`)
        const markdown = response.default
        const html = await marked.parse(markdown)
        setContent(html)
      } catch (error) {
        console.error('Error loading about content:', error)
        setContent(`<p>About content for ${config.appName} not found.</p>`)
      } finally {
        setLoading(false)
      }
    }

    loadAboutContent()
  }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="shadow-lg"
        >
          <Info size={18} weight="fill" className="mr-2" />
          About
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
