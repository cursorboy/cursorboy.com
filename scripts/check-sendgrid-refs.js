// This is a Node.js script you can run to find SendGrid references
// Run with: node scripts/check-sendgrid-refs.js

const fs = require("fs")
const path = require("path")

function findSendGridReferences(dir, results = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && !filePath.includes("node_modules") && !filePath.includes(".next")) {
      findSendGridReferences(filePath, results)
    } else if (
      stat.isFile() &&
      (filePath.endsWith(".js") ||
        filePath.endsWith(".ts") ||
        filePath.endsWith(".jsx") ||
        filePath.endsWith(".tsx") ||
        filePath.endsWith(".json"))
    ) {
      const content = fs.readFileSync(filePath, "utf8")

      if (content.includes("sendgrid") || content.includes("SendGrid") || content.includes("SENDGRID")) {
        results.push({
          file: filePath,
          lines: content
            .split("\n")
            .map((line, i) => ({ line, number: i + 1 }))
            .filter(({ line }) => line.includes("sendgrid") || line.includes("SendGrid") || line.includes("SENDGRID"))
            .map(({ line, number }) => `Line ${number}: ${line.trim()}`),
        })
      }
    }
  }

  return results
}

const references = findSendGridReferences(".")

if (references.length === 0) {
  console.log("No SendGrid references found!")
} else {
  console.log(`Found ${references.length} files with SendGrid references:`)
  references.forEach(({ file, lines }) => {
    console.log(`\nFile: ${file}`)
    lines.forEach((line) => console.log(`  ${line}`))
  })
}

