export async function fetchWithRetry(url, opts={}, retries=3, delay=1000){
  for(let i=0;i<retries;i++){
    try{
      const res = await fetch(url, opts);
      if(res.ok) return res;
      if(res.status===429 || res.status>=500){
        await new Promise(r=>setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw new Error(await res.text());
    }catch(e){
      if(i===retries-1) throw e;
      await new Promise(r=>setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error('Max retries reached');
}
