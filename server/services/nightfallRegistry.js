// Simple in-memory registry to allow REST routes to access realtime state
let realtimeInstance = null

export function registerNightfallRealtime(instance){
  realtimeInstance = instance
}

export function getNightfallRealtime(){
  return realtimeInstance
}
