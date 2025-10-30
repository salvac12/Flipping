/**
 * Script de prueba local para ScraperAPI
 * Ejecutar: npx tsx test-scraperapi.ts
 */

import { config } from 'dotenv';
import { scrapeIdealistaWithScraperAPI } from './lib/scraper/idealista-scraperapi';

// Cargar variables de entorno de .env.local
config({ path: '.env.local' });

async function testScraperAPI() {
  console.log('🧪 Iniciando test de ScraperAPI...\n');
  console.log('📝 SCRAPERAPI_KEY:', process.env.SCRAPERAPI_KEY ? '✅ Configurada' : '❌ NO configurada');
  console.log('📝 Valor:', process.env.SCRAPERAPI_KEY?.substring(0, 10) + '...\n');

  try {
    const properties = await scrapeIdealistaWithScraperAPI(1);

    console.log('\n📊 RESULTADO:');
    console.log(`  Total propiedades: ${properties.length}`);

    if (properties.length > 0) {
      console.log('\n✅ Primeras propiedades encontradas:');
      properties.slice(0, 3).forEach((p, i) => {
        console.log(`\n  ${i + 1}. ${p.title}`);
        console.log(`     Precio: ${p.price}€`);
        console.log(`     M2: ${p.m2}m²`);
        console.log(`     URL: ${p.url}`);
        console.log(`     Score: ${p.score}`);
      });
    } else {
      console.log('\n❌ No se encontraron propiedades');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}

testScraperAPI();
