import { useEffect, useState } from 'react'
import { onValue, off } from 'firebase/database'
import { ref } from '../api/firebase'

export function useRtdbSubscribe(path: string) {
  const [value, setValue] = useState<any>(null)
  useEffect(() => {
    const r = ref(path)
    const unsub = onValue(r, (snap) => setValue(snap.val()))
    return () => off(r, 'value', unsub)
  }, [path])
  return value
}


