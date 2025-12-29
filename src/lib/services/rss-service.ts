import Parser from 'rss-parser'

const parser = new Parser()

export async function fetchRssFeed(url: string) {
  try {
    // Primary: let rss-parser fetch and parse
    const feed = await parser.parseURL(url)
    return {
      title: feed.title,
      items: feed.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        guid: item.guid,
        pubDate: item.pubDate,
        isoDate: item.isoDate,
        content: item.contentSnippet || item.content,
        enclosure: item.enclosure,
      })),
    }
  } catch (primaryErr) {
    try {
      // Fallback: fetch XML and parse string (handles some redirect/cert edge cases)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`)
      const xml = await res.text()
      const feed = await parser.parseString(xml)
      return {
        title: feed.title,
        items: feed.items.map((item: any) => ({
          title: item.title,
          link: item.link,
          guid: item.guid,
          pubDate: item.pubDate,
          isoDate: item.isoDate,
          content: item.contentSnippet || item.content,
          enclosure: item.enclosure,
        })),
      }
    } catch (fallbackErr) {
      console.error(`Failed to parse RSS feed ${url}:`, primaryErr, fallbackErr)
      const msg = (fallbackErr as any)?.message || (primaryErr as any)?.message || 'RSS parsing failed'
      throw new Error(msg)
    }
  }
}
