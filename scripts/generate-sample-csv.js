/**
 * Generate sample CSV file for bulk results upload
 * Usage: node scripts/generate-sample-csv.js
 */

const fs = require('fs');
const path = require('path');

function generateSampleCSV() {
  const rows = ['date,firstRound,secondRound'];
  const today = new Date();

  // Generate last 30 days of sample data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dateStr = date.toISOString().split('T')[0];
    const firstRound = Math.floor(Math.random() * 100);
    const secondRound = Math.floor(Math.random() * 100);

    rows.push(`${dateStr},${firstRound},${secondRound}`);
  }

  const csvContent = rows.join('\n');
  const outputPath = path.join(__dirname, '..', 'sample-results.csv');

  fs.writeFileSync(outputPath, csvContent);
  console.log(`✅ Sample CSV generated: ${outputPath}`);
  console.log('📋 You can use this file to test bulk upload in the admin panel');
}

generateSampleCSV();
