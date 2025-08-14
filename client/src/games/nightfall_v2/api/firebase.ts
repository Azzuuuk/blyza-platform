import { auth as authJs, db as firestoreJs, rtdb as rtdbJs } from '../../../lib/firebase'
import { ref as rtdbRef } from 'firebase/database'

export const auth = authJs
export const firestore = firestoreJs
export const rtdb = rtdbJs
export const ref = (path: string) => rtdbRef(rtdb, path)


