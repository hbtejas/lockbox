// /lib/fetcher.ts

export async function fetcher<T>(url: string): Promise<T | null> {
  const MAX_RETRIES = 3;
  const TIMEOUT = 10000;

  for (let i = 0; i < MAX_RETRIES; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Fetch attempt ${i + 1} failed for ${url}:`, error);
      
      if (i === MAX_RETRIES - 1) return null;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  return null;
}
