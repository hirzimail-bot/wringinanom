import https from 'https';
import http from 'http';

const urls = [
  "https://beritajatim.com/desa-wisata-wringinanom-malang-masuk-50-besar-adwi-2024",
  "https://disparbud.malangkab.go.id/berita/disparbud-opd@3507-masuk-50-besar-adwi-2024-desa-wisata-wringinanom-pertahankan-tradisi-kabupaten-malang",
  "https://tugumalang.id/desa-wringinanom-poncokusumo-juara-ii-adwi-2024-desa-sanankerto-turen-dinobatkan-desa-wisata-berkelanjutan/",
  "https://ketik.com/berita/adwi-2024-dewi-anom-kabupaten-malang-raih-juara-2-kategori-desa-maju",
  "https://malangpagi.com/desa-wisata-wringinanom-masuk-50-besar-anugerah-desa-wisata-indonesia-2024/",
  "https://kabarbaik.co/masuk-50-besar-desa-wringinanom-kabupaten-malang-bersaing-dengan-5-966-desa-di-seluruh-indonesia/",
  "https://lifestyle.sindonews.com/read/1424215/156/sandiaga-uno-beberkan-alasan-desa-wisata-wringinanom-malang-masuk-50-besar-adwi-2024-1722121636",
  "https://netralnews.com/kekayaan-desa-wisata-wringinanom-di-malang/RWRubnZjOW45VUx0azRWSGs0QW1iQT09",
  "https://matic.malangkab.go.id/artikel/jelajah-desa-di-wringinanom-poncokusumo",
  "https://www.tempo.co/hiburan/6-aktivitas-seru-di-desa-wisata-wringin-anom-malang-susur-sungai-hingga-tur-gunung-bromo-37069",
  "https://sisiplus.katadata.co.id/berita/lainnya/2117/wringinanom-desa-wisata-dengan-sejuta-keunikan-di-kabupaten-malang",
  "https://www.wearemania.net/ngalam/destinasi/tubing-wringinanom-wisata-adrenalin-yang-seru/5165",
  "https://www.jatimsatunews.com/2026/01/desa-wisata-wringinanom-kembangkan.html",
  "https://radarmalang.jawapos.com/wisata-kuliner/816712406/tiga-desa-kelola-rest-area-wringinanom-di-kecamatan-poncokusumo-mulai-disusun",
  "https://poncokusumo.malangkab.go.id/berita?page=15"
];

async function fetchUrlContent(urlStr) {
  return new Promise((resolve) => {
    const lib = urlStr.startsWith('https') ? https : http;
    const req = lib.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrlContent(new URL(res.headers.location, urlStr).toString()));
      }
      let html = '';
      res.on('data', chunk => {
        html += chunk;
        if (html.length > 1000000) res.destroy(); // stop reading after 1MB
      });
      res.on('end', () => resolve(html));
    });
    
    req.on('error', (e) => {
      resolve('');
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve('');
    });
  });
}

function extractMeta(html, property) {
  const regex = new RegExp(`<meta\\s+(?:property|name)=["']${property}["']\\s+content=["']([^"']+)["']`, 'i');
  const match = html.match(regex);
  if (match) return match[1];
  
  const regex2 = new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${property}["']`, 'i');
  const match2 = html.match(regex2);
  if (match2) return match2[1];
  
  return null;
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"') : null;
}

async function scrapeAll() {
  const results = [];
  
  for (const url of urls) {
    console.log("Fetching", url);
    const html = await fetchUrlContent(url);
    if (!html) {
      console.log("Failed", url);
      const parts = new URL(url).pathname.split('/');
      let fallbackTitle = parts[parts.length - 1].replace(/-/g, ' ');
      if (fallbackTitle === '') fallbackTitle = parts[parts.length - 2].replace(/-/g, ' ');
      results.push({
        title: fallbackTitle,
        link: url,
        img: 'https://jadesta.kemenpar.go.id/imgpost/138139.jpg', // Default tubing image
        desc: 'Berita seputar pengembangan wisata dan aktivitas seru di Desa Wisata Wringinanom.',
        date: '2024'
      });
      continue;
    }
    
    let title = extractMeta(html, 'og:title') || extractTitle(html) || 'Berita Desa Wisata Wringinanom';
    let img = extractMeta(html, 'og:image') || 'https://jadesta.kemenpar.go.id/imgpost/138139.jpg';
    let desc = extractMeta(html, 'og:description') || extractMeta(html, 'description') || 'Berita dan update terbaru seputar pengembangan Desa Wisata Wringinanom dan prestasi yang diraih.';
    
    title = title.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
    desc = desc.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
    if (desc.length > 150) desc = desc.substring(0, 147) + '...';
    
    results.push({
      title,
      link: url,
      img,
      desc,
      date: '2024'
    });
  }
  
  console.log("RES:", JSON.stringify(results, null, 2));
}

scrapeAll();
