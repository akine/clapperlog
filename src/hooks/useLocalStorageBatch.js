import { useEffect, useRef } from 'react'

export function useLocalStorageBatch(data, delay = 100) {
  const timeoutRef = useRef(null)
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
        }
      })
    }, delay)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay])
}
