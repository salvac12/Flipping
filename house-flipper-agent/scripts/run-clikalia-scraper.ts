/**
 * Script para ejecutar el scraper de Clikalia directamente
 * Uso: npx tsx scripts/run-clikalia-scraper.ts
 */

import { runClikaLiaScraper } from '../lib/scraper/clikalia-scraper';

async function main() {
  console.log('\n🚀 Ejecutando scraper de Clikalia...\n');

  try {
    const result = await runClikaLiaScraper({
      zones: ['guindalera', 'delicias', 'pacifico', 'prosperidad', 'retiro', 'arguelles'],
      maxProperties: 50,
      onlyReformed: true,
    });

    console.log('\n✅ Scraping completado con éxito!\n');
    console.log('📊 Resumen:');
    console.log(`   Propiedades encontradas: ${result.properties.length}`);
    console.log(`   Guardadas: ${result.saved}`);
    console.log(`   Saltadas (duplicadas): ${result.skipped}`);
    console.log(`   Errores: ${result.errors}`);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al ejecutar scraper:', error);
    process.exit(1);
  }
}

main();
