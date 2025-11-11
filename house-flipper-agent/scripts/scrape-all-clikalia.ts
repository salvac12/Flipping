/**
 * Script para scrappear TODAS las propiedades de Clikalia en Madrid
 *
 * Uso:
 *   npx tsx scripts/scrape-all-clikalia.ts
 *
 * Opciones:
 *   npx tsx scripts/scrape-all-clikalia.ts --max 50  (máximo 50 propiedades)
 */

import { scrapeAllClikaLiaMadrid } from '../lib/scraper/clikalia-full-scraper';

async function main() {
  console.log('\n🏠 SCRAPER COMPLETO DE CLIKALIA MADRID\n');
  console.log('═'.repeat(60));
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   • Este scraper puede tardar 10-30 minutos');
  console.log('   • Extrae TODAS las propiedades disponibles en Clikalia Madrid');
  console.log('   • Respeta delays entre requests (2-4 segundos)');
  console.log('   • Todas las propiedades de Clikalia son REFORMADAS ALTA CALIDAD');
  console.log('\n' + '═'.repeat(60) + '\n');

  // Leer argumentos de línea de comandos
  const args = process.argv.slice(2);
  const maxPropertiesArg = args.find(arg => arg.startsWith('--max='));
  const maxProperties = maxPropertiesArg
    ? parseInt(maxPropertiesArg.split('=')[1])
    : 200;

  console.log(`📋 Configuración:`);
  console.log(`   Máximo de propiedades: ${maxProperties}`);
  console.log(`   Máximo de páginas: 20`);
  console.log('\n');

  try {
    const result = await scrapeAllClikaLiaMadrid({
      maxProperties,
      maxPages: 20,
    });

    console.log('\n' + '═'.repeat(60));
    console.log('\n🎉 ¡SCRAPING COMPLETADO EXITOSAMENTE!\n');
    console.log('📊 ESTADÍSTICAS FINALES:');
    console.log('═'.repeat(60));
    console.log(`   URLs encontradas:        ${result.totalFound}`);
    console.log(`   Propiedades procesadas:  ${result.totalProcessed}`);
    console.log(`   Guardadas en BD:         ${result.saved} ✅`);
    console.log(`   Duplicadas (saltadas):   ${result.skipped}`);
    console.log(`   Errores:                 ${result.errors} ${result.errors > 0 ? '⚠️' : '✅'}`);
    console.log('═'.repeat(60));

    if (result.saved > 0) {
      console.log('\n💡 Próximos pasos:');
      console.log('   1. Ve a /dashboard/comparables para ver las estadísticas');
      console.log('   2. Las estimaciones de precio ahora son más precisas');
      console.log('   3. Tienes ' + result.saved + ' comparables reformados de alta calidad');
    }

    console.log('\n');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error('\n💡 Posibles soluciones:');
    console.error('   1. Verifica tu conexión a internet');
    console.error('   2. Asegúrate de que Playwright está instalado: npx playwright install');
    console.error('   3. Revisa que la base de datos esté accesible');
    console.error('\n');
    process.exit(1);
  }
}

main();
