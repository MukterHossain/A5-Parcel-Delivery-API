export const getTrackingId = (counter:number): string =>{
const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
return `TRK-${date}-${String(counter).padStart(6, "0")}`
}  