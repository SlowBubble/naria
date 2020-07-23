
export function debug(msg, func) {
  const startTime = Date.now();
  const res = func();
  console.log(msg, (Date.now() - startTime) / 1000);
  return res;
 
}

export async function debugAsync(msg, func) {
  const startTime = Date.now();
  const res = await func();
  const durationMs = Date.now() - startTime;
  console.log(msg, durationMs / 1000);
  return [res, durationMs];
  
}