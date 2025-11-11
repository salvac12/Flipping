import { scrapeAllGilmarMadrid } from './lib/scraper/gilmar-full-scraper.js';

console.log('🚀 Iniciando scraper de Gilmar (primeras 2 páginas)...\n');

scrapeAllGilmarMadrid({
  maxProperties: 20,
  maxPages: 2
}).then(result => {
  console.log('\n✅ RESULTADO FINAL:');
  console.log(`URLs encontradas: ${result.totalFound}`);
  console.log(`Procesadas: ${result.totalProcessed}`);
  console.log(`Guardadas: ${result.saved}`);
  console.log(`Saltadas: ${result.skipped}`);
  console.log(`Errores: ${result.errors}`);
  process.exit(0);
}).catch(err => {
  console.error('❌ ERROR:', err.message);
  process.exit(1);
});
