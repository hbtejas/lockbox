const fs = require('fs')
const path = require('path')
const { query, isDatabaseEnabled } = require('../src/config/db')

async function run() {
  if (!isDatabaseEnabled()) {
    console.error('DATABASE_URL is not configured. Skipping migrations.')
    process.exit(1)
  }

  const sqlDir = path.resolve(__dirname, '../sql')
  const files = fs
    .readdirSync(sqlDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sqlPath = path.join(sqlDir, file)
    const sql = fs.readFileSync(sqlPath, 'utf8')
    process.stdout.write(`Running migration: ${file} ... `)
    await query(sql)
    process.stdout.write('done\n')
  }

  console.log('All migrations completed.')
}

run().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
