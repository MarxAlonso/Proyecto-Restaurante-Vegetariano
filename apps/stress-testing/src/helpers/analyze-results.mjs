/**
 * Analizador de Resultados de Pruebas de Estrés
 *
 * Procesa los archivos JSON generados por k6 y genera:
 *   - Resumen ejecutivo
 *   - Comparación contra SLOs (Service Level Objectives)
 *   - Recomendaciones de escalado
 *
 * Uso: node src/helpers/analyze-results.mjs reports/results.json
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';

const SLOs = {
  p95_response_time: {
    auth: 2000,     // 2 segundos para login
    menu: 1000,     // 1 segundo para catálogo
    orders: 3000,   // 3 segundos para pedidos
    default: 2000,  // 2 segundos por defecto
  },
  error_rate: 0.01,  // Máximo 1% de errores
  availability: 0.99, // 99% de disponibilidad
};

function analyzeFile(filePath) {
  console.log(`\n📊 Analizando: ${filePath}`);
  console.log('═'.repeat(60));

  if (!existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`);
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const metrics = {};

  lines.forEach(line => {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'Point' && entry.metric) {
        if (!metrics[entry.metric]) metrics[entry.metric] = [];
        metrics[entry.metric].push(entry.data);
      }
    } catch (e) {
      // Ignorar líneas que no son JSON
    }
  });

  return metrics;
}

function calculateStats(values) {
  if (!values || values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  return {
    min: sorted[0],
    max: sorted[n - 1],
    avg: sorted.reduce((a, b) => a + b, 0) / n,
    p50: sorted[Math.floor(n * 0.5)],
    p90: sorted[Math.floor(n * 0.9)],
    p95: sorted[Math.floor(n * 0.95)],
    p99: sorted[Math.floor(n * 0.99)],
    count: n,
  };
}

function evaluateSLOs(stats, category = 'default') {
  const results = [];
  const slo = SLOs.p95_response_time[category] || SLOs.p95_response_time.default;

  if (stats && stats.p95) {
    const passed = stats.p95 <= slo;
    results.push({
      metric: `p95 response time (${category})`,
      slo: `${slo}ms`,
      actual: `${stats.p95.toFixed(0)}ms`,
      passed,
      severity: passed ? '✅' : '❌',
    });
  }

  return results;
}

function generateReport(metrics) {
  console.log('\n📈 RESUMEN DE MÉTRICAS:\n');

  for (const [metric, values] of Object.entries(metrics)) {
    const stats = calculateStats(values);
    if (!stats) continue;

    console.log(`  🔹 ${metric}:`);
    console.log(`     Avg: ${stats.avg.toFixed(0)}ms  |  P50: ${stats.p50.toFixed(0)}ms  |  P95: ${stats.p95.toFixed(0)}ms  |  P99: ${stats.p99.toFixed(0)}ms`);
    console.log(`     Min: ${stats.min.toFixed(0)}ms  |  Max: ${stats.max.toFixed(0)}ms  |  Muestras: ${stats.count}`);
    console.log();
  }
}

function evaluateHealth(stats) {
  console.log('\n🎯 EVALUACIÓN CONTRA SLOs:\n');

  const results = [];

  // Evaluar cada endpoint
  if (stats.login_duration) {
    results.push(...evaluateSLOs(calculateStats(stats.login_duration), 'auth'));
  }
  if (stats.menu_list_duration) {
    results.push(...evaluateSLOs(calculateStats(stats.menu_list_duration), 'menu'));
  }
  if (stats.create_order_duration) {
    results.push(...evaluateSLOs(calculateStats(stats.create_order_duration), 'orders'));
  }

  for (const r of results) {
    console.log(`  ${r.severity} ${r.metric}: SLO=${r.slo}, Actual=${r.actual}`);
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log(`\n  📋 Resultado: ${passedCount}/${totalCount} SLOs cumplidos`);
  
  if (passedCount === totalCount) {
    console.log('  🟢 ESTADO: SALUDABLE - El sistema cumple con los objetivos de rendimiento');
  } else if (passedCount >= totalCount * 0.7) {
    console.log('  🟡 ESTADO: TOLERABLE - Algunos SLOs no se cumplen, revisar cuellos de botella');
  } else {
    console.log('  🔴 ESTADO: CRÍTICO - Múltiples SLOs incumplidos, se requiere escalar o optimizar');
  }
}

function generateScalingRecommendations(metrics) {
  console.log('\n🚀 RECOMENDACIONES DE ESCALADO:\n');

  // Verificar métricas de cada módulo
  const hasHighLoad = (metric) => {
    const stats = calculateStats(metrics[metric]);
    return stats && stats.p95 > 3000;
  };

  if (hasHighLoad('login_duration') || hasHighLoad('register_duration')) {
    console.log('  ⚡ Autenticación:');
    console.log('    - Aumentar pods del servicio auth');
    console.log('    - Implementar caché de sesiones con Redis');
    console.log('    - Habilitar HPA (Horizontal Pod Autoscaler) para el Deployment de auth');
    console.log();
  }

  if (hasHighLoad('menu_list_duration') || hasHighLoad('category_duration')) {
    console.log('  ⚡ Catálogo/Menú:');
    console.log('    - Implementar caché Redis para GET /menu y GET /categories');
    console.log('    - Añadir read replicas a PostgreSQL');
    console.log('    - Configurar CDN para imágenes del menú via Cloudflare R2');
    console.log();
  }

  if (hasHighLoad('create_order_duration') || hasHighLoad('kitchen_view_duration')) {
    console.log('  ⚡ Pedidos:');
    console.log('    - Separar el módulo de pedidos en un microservicio independiente');
    console.log('    - Optimizar consultas Prisma con índices compuestos');
    console.log('    - Aumentar límites de conexiones en PostgreSQL pool');
    console.log();
  }

  if (!hasHighLoad('login_duration') && !hasHighLoad('menu_list_duration') && !hasHighLoad('create_order_duration')) {
    console.log('  ✅ No se requieren cambios de escalado. El rendimiento es adecuado.');
    console.log();
  }
}

// --- MAIN ---
const args = process.argv.slice(2);
const filePath = args[0] || 'reports/results.json';

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║    ANALIZADOR DE PRUEBAS DE ESTRÉS - RESTVEG        ║');
console.log('╚══════════════════════════════════════════════════════╝');

const metrics = analyzeFile(filePath);
if (metrics) {
  generateReport(metrics);
  evaluateHealth(metrics);
  generateScalingRecommendations(metrics);

  // Guardar reporte resumido
  const summary = {
    timestamp: new Date().toISOString(),
    file: filePath,
    analysis: 'Completado',
  };
  writeFileSync('reports/analysis-summary.json', JSON.stringify(summary, null, 2));
  console.log('\n📝 Resumen guardado en: reports/analysis-summary.json');
}
