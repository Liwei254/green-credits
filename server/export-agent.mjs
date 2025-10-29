// export-agent.mjs
import * as AgentData from '@storacha/client/agent-data'
import fs from 'fs'

async function main() {
  // Export the locally stored agent data (keys + proofs)
  const data = await AgentData.export()

  // Save it to a JSON file
  fs.writeFileSync('./agent-export.json', JSON.stringify(data, null, 2))

  console.log('✅ Agent exported successfully to agent-export.json')
}

main().catch(err => {
  console.error('❌ Failed to export agent:', err)
  process.exit(1)
})
