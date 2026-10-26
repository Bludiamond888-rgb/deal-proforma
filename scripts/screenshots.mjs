// Playwright WebKit screenshots at iPhone 16 Pro Max size (440x956 @3x) -> screens/
import { webkit } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { serve } from './serve.mjs'

const { server, url } = await serve('dist')
await mkdir('screens', { recursive: true })
const browser = await webkit.launch()
const ctx = await browser.newContext({
  viewport: { width: 440, height: 956 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
})
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(String(e)))
const shot = async (n) => {
  await page.waitForTimeout(450)
  await page.screenshot({ path: `screens/${n}.png` })
  console.log(`screens/${n}.png`)
}

await page.goto(url)
await page.waitForSelector('[data-testid="dash"]')
await shot('01-deal-top')

// scroll to results
await page.locator('[data-testid="results"]').scrollIntoViewIfNeeded()
await shot('02-results')

// hold / IRR
await page.locator('[data-testid="hold"]').scrollIntoViewIfNeeded()
await page.waitForTimeout(200)
await page.evaluate(() => window.scrollBy(0, 40))
await shot('03-hold-irr')

// sensitivity
await page.locator('text=Sensitivity').scrollIntoViewIfNeeded()
await page.waitForTimeout(200)
await page.evaluate(() => window.scrollBy(0, 80))
await shot('04-sensitivity')

// LTV/LTC toggle
await page.locator('text=Capital stack').scrollIntoViewIfNeeded()
await page.click('.seg >> text=LTC')
await shot('05-capital-ltc')
await page.click('.seg >> text=LTV')

// Saved tab
await page.click('.tabs button:nth-child(2)')
await page.waitForTimeout(300)
await shot('06-saved-empty')

// Save a deal then revisit
await page.click('.tabs button:nth-child(1)')
await page.click('text=Save deal')
await page.waitForTimeout(400)
await page.click('.tabs button:nth-child(2)')
await page.waitForSelector('.saved li')
await shot('07-saved-list')

// More / About
await page.click('.tabs button:nth-child(3)')
await page.waitForSelector('.about')
await shot('08-about')

const sw = await page.evaluate(() => navigator.serviceWorker?.getRegistration().then((r) => !!r))
console.log('sw registered:', sw, 'errors:', errs.length ? errs : 'none')
await browser.close()
server.close()
