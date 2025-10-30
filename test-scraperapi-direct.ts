/**
 * Test directo de ScraperAPI para debug
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

async function testDirect() {
  const apiKey = process.env.SCRAPERAPI_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NO CONFIGURADA');

  // Probar URL simple de Idealista
  const targetUrl = 'https://www.idealista.com/venta-viviendas/madrid-madrid/';

  console.log(`\n🔍 Probando: ${targetUrl}\n`);

  // Intentar diferentes configuraciones de ScraperAPI
  const configs = [
    { name: 'Básica', params: { api_key: apiKey, url: targetUrl } },
    { name: 'Con render', params: { api_key: apiKey, url: targetUrl, render: 'true' } },
    { name: 'Con country_code', params: { api_key: apiKey, url: targetUrl, render: 'true', country_code: 'es' } },
    { name: 'Premium', params: { api_key: apiKey, url: targetUrl, render: 'true', country_code: 'es', premium: 'true' } },
  ];

  for (const config of configs) {
    try {
      console.log(`\n📡 Probando configuración: ${config.name}`);
      const params = new URLSearchParams(config.params as any);
      const scraperUrl = `http://api.scraperapi.com/?${params.toString()}`;

      console.log(`   URL: ${scraperUrl.substring(0, 100)}...`);

      const response = await fetch(scraperUrl, {
        method: 'GET',
        headers: { 'Accept': 'text/html' },
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const html = await response.text();
        console.log(`   ✅ HTML recibido: ${html.length} caracteres`);
        console.log(`   Contiene "item-info-container": ${html.includes('item-info-container')}`);
        console.log(`   Contiene "item-link": ${html.includes('item-link')}`);
        break; // Si funciona, no probar más
      } else {
        const error = await response.text();
        console.log(`   ❌ Error: ${error.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`   ❌ Exception:`, error instanceof Error ? error.message : error);
    }
  }
}

testDirect();
