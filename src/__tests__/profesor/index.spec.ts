import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('index.html', () => {
  it('contains the app mount point and correct script', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html')
    const html = fs.readFileSync(indexPath, 'utf-8')

    // Check mount point
    expect(html).toContain('<div id="app"></div>')

    // Check viewport meta
    expect(html).toMatch(/<meta[^>]*name="viewport"[^>]*content="width=device-width, initial-scale=1.0"[^>]*>/)

    // Check main script
    expect(html).toContain('<script type="module" src="/src/main.ts"></script>')
  })
})
