import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValueFromPath(record: any, path: string): any[] {
  const parts = path.split('.')
  let current = record
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    
    if (current === null || current === undefined) {
      return []
    }
    
    if (Array.isArray(current)) {
      const remaining = parts.slice(i).join('.')
      const results: any[] = []
      
      for (const item of current) {
        const values = getValueFromPath(item, remaining)
        results.push(...values)
      }
      
      return results
    }
    
    current = current[part]
  }
  
  if (current === null || current === undefined) {
    return []
  }
  
  if (Array.isArray(current)) {
    return current
  }
  
  return [current]
}
