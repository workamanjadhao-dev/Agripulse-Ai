import { initDatabase } from './database/schema.js';
import { marketDataService } from './services/marketDataService.js';

export { initDatabase };

export async function runFullSeed() {
  await initDatabase();
  await marketDataService.syncMarketData();
  console.log('✅ Full database seed and market sync complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runFullSeed().catch(console.error);
}
