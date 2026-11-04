/*
 * Compile original free educational books into downloadable PDFs.
 * Dependencies already in the repository: pandoc system binary + Playwright.
 * npm run books:free   (or node scripts/build-free-motion-books.mjs)
 */
import { readFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { chromium } from '@playwright/test'

const css = readFileSync('scripts/book-motion-pdf.css', 'utf8')
const books = [
  {
    source: 'docs/books/tu-primer-mes-de-movimiento.md',
    target: 'public/downloads/sebastian-bayona/tu-primer-mes-de-movimiento.pdf',
    title: 'Tu primer mes de movimiento — SEBASTIAN BAYONA',
  },
  {
    source: 'docs/books/moverte-cada-dia.md',
    target: 'public/downloads/sebastian-bayona/moverte-cada-dia.pdf',
    title: 'Moverte cada día — SEBASTIAN BAYONA',
  },
]
mkdirSync('public/downloads/sebastian-bayona',{recursive:true})
const browser=await chromium.launch({headless:true})
for(const book of books){
  const htmlBody = execFileSync('pandoc',['--from=markdown','--to=html5',book.source],{encoding:'utf8'})
  const chapters=htmlBody.split(/(?=<h1(?:\s|>))/i).filter(s=>s.trim())
  const pages=chapters.map((chapter,index)=>'<section class="pdf-page'+(index===0?' pdf-cover':'')+'">'+chapter+(index===0?'':'<aside class="pdf-notes"><strong>TUS NOTAS / UNA IDEA PARA APLICAR</strong><span></span><span></span><span></span></aside>')+'</section>').join('\n')
  const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>'+book.title+'</title><style>'+css+'</style></head><body>'+pages+'</body></html>'
  const page=await browser.newPage({viewport:{width:980,height:1350}})
  await page.setContent(html,{waitUntil:'load'})
  // Workbook note space is optional. Drop it on long chapters before PDF export.
  const notesRemoved = await page.evaluate(() => {
    let removed = 0
    document.querySelectorAll('.pdf-page').forEach(section => {
      if(section.scrollHeight > section.clientHeight + 3 && section.querySelector('.pdf-notes')) {
        section.querySelector('.pdf-notes').remove()
        removed++
      }
    })
    return removed
  })
  const measures=await page.locator('.pdf-page').evaluateAll(elements=>elements.map((element,index)=>({
    index:index+1,
    scrollHeight:element.scrollHeight,
    clientHeight:element.clientHeight,
  })))
  const clipped=measures.filter(x=>x.scrollHeight>x.clientHeight+3)
  if (clipped.length) {
    console.warn('OVERFLOW',book.target,JSON.stringify(clipped))
    throw Error('PDF layout has clipped pages. Fix the book styles or content before shipping.')
  }
  await page.pdf({path:book.target,format:'A4',preferCSSPageSize:true,printBackground:true,margin:{top:'0',right:'0',bottom:'0',left:'0'},displayHeaderFooter:false})
  console.log('CREATED',book.target,'chapter-pages',chapters.length,'overflow',clipped.length,'optional-notes-removed',notesRemoved)
  await page.close()
}
await browser.close()
