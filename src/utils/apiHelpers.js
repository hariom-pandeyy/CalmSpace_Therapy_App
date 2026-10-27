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

async function waitForSuccessfulPing(socketProtocol2, hostAndPath, ms = 1e3) {
  const pingHostProtocol = socketProtocol2 === "wss" ? "https" : "http";
  
  const ping = async () => {
    try {
      const response = await fetch(`${pingHostProtocol}://${hostAndPath}`, {
        mode: "no-cors",
        headers: {
          Accept: "text/x-vite-ping"
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.type === 'opaque') {
        return true; // no-cors mode returns opaque response
      }
      return true;
    } catch (error) {
      console.error('Ping failed:', error.message);
      return false;
    }
  };

  // Add retry logic
  const retry = async (attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      if (await ping()) {
        return true;
      }
      // Wait between retries
      await new Promise(resolve => setTimeout(resolve, ms));
    }
    return false;
  };

  return retry();
}

export { waitForSuccessfulPing };
