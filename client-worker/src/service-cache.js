export class ServiceCache {
  async reset() {
    await caches.delete('v1');
  }

  async put(url, content, contentType) {
    console.log(`Service worker caches url ${url}`);
    const cache = await caches.open('v1');
    await cache.put(
      new Request(url, { mode: 'no-cors' }),
      new Response(content, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': contentType
        }
      })
    );
  }
}
