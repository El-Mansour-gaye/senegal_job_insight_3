import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 1600})

        try:
            await page.goto('http://localhost:3000', wait_until='networkidle', timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            await browser.close()
            return

        print("Page loaded. Capturing Décideur view...")
        await page.wait_for_selector('text=Vue Décideur')
        await page.screenshot(path='verification/dashboard_decideur_v4.png', full_page=True)

        print("Navigating to Offres...")
        offres_link = page.locator('nav >> text=Offres')
        await offres_link.click()

        await page.wait_for_load_state('networkidle')
        await page.screenshot(path='verification/job_explorer_v4.png', full_page=True)

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('verification'):
        os.makedirs('verification')
    asyncio.run(run())
