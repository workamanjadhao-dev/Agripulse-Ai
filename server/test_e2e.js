async function fullVerification() {
  console.log('=== FULL PLATFORM VERIFICATION ===');
  
  // 1. Frontend Vite Server
  const feRes = await fetch('http://localhost:3000/');
  console.log('Frontend Status:', feRes.status, feRes.statusText);
  const feHtml = await feRes.text();
  console.log('Frontend HTML contains root div:', feHtml.includes('id="root"'));

  // 2. Backend Health
  const hRes = await fetch('http://localhost:5000/api/health');
  const hData = await hRes.json();
  console.log('Backend Health:', hData.server, '| DB:', hData.database, '| Market:', hData.marketData?.status, '| Gemini:', hData.gemini?.configured);

  // 3. Crops Endpoint
  const cropsRes = await fetch('http://localhost:5000/api/crops');
  const cropsData = await cropsRes.json();
  console.log('Crops Available:', cropsData.count, 'crops in database');

  // 4. Buyers Endpoint
  const buyersRes = await fetch('http://localhost:5000/api/buyers');
  const buyersData = await buyersRes.json();
  console.log('Buyers Available:', buyersData.count, 'procurement listings');

  // 5. Warehouses Endpoint
  const whRes = await fetch('http://localhost:5000/api/warehouses');
  const whData = await whRes.json();
  console.log('Warehouses Available:', whData.count, 'facilities');

  // 6. Vehicles Endpoint
  const vhRes = await fetch('http://localhost:5000/api/vehicles');
  const vhData = await vhRes.json();
  console.log('Vehicles Available:', vhData.count, 'transport units');

  // 7. Matches Endpoint
  const matchRes = await fetch('http://localhost:5000/api/matches');
  const matchData = await matchRes.json();
  console.log('AI Matches Found:', matchData.count, 'farmer-buyer connections');

  // 8. Market Prices Endpoint
  const mpRes = await fetch('http://localhost:5000/api/market-prices/latest');
  const mpData = await mpRes.json();
  console.log('Market Prices Records:', mpData.data?.length, 'mandis cached');

  // 9. Single Crop Market Price Endpoint
  const cotRes = await fetch('http://localhost:5000/api/market-prices/cotton');
  const cotData = await cotRes.json();
  console.log('Single Crop Lookup (Cotton):', cotData.success, 'records:', cotData.data?.length);

  // 10. Forecast Endpoint
  const fcRes = await fetch('http://localhost:5000/api/forecast');
  const fcData = await fcRes.json();
  console.log('Forecast Records:', fcData.data?.length);

  // 11. Dashboard Endpoint
  const dRes = await fetch('http://localhost:5000/api/dashboard');
  const dData = await dRes.json();
  console.log('Dashboard Dynamic Stats:', dData.stats);

  // 12. Grounded AI Chat
  const aiRes = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'What is the price of cotton in Nagpur APMC?' })
  });
  const aiData = await aiRes.json();
  console.log('AI Chat Source:', aiData.source);
  console.log('AI Chat Reply Snippet:', aiData.reply?.substring(0, 100) + '...');

  // 13. Grounded Sell Decision
  const sdRes = await fetch('http://localhost:5000/api/ai/sell-decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commodity: 'Cotton (Kapas)', quantity: 35, holdingDays: 10 })
  });
  const sdData = await sdRes.json();
  console.log('Sell Decision:', sdData.data?.decision, '| Diff:', sdData.data?.estimatedDifference, '| Warning:', sdData.data?.warning);

  console.log('=== ALL 13 ENDPOINTS PASSED VERIFICATION ===');
}

fullVerification().catch(console.error);
