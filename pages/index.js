import { useEffect, useState } from 'react'
import JSZip from 'jszip'
import cheerio from 'cheerio'
import BookPart from '@/components/BookPart'
import BookSection from '@/components/BookSection'

export default function Home() {
  const [sections, setSections] = useState([])

  useEffect(() => {
    loadBook()
  }, [])

  const filename = 'files/book2.epub'
  const loadBook = async () => {

    const zip = await JSZip.loadAsync(await fetch(filename).then(res => res.arrayBuffer()))
    let keys = Object.keys(zip.files).sort().filter(key => key.includes('htm'))

    const newSections = []
    for (const key of keys) {
      const firstFile = await zip.file(key).async('string')
      const html = cheerio.load(firstFile)
      const body = html('body')

      let section = []

      function breakParagraphs(el) {
        if (el.tagName == 'section') {
          el.children.forEach(child => breakParagraphs(child))
          return
        }
        section.push({ content: html(el).text(), html: html(el).html() })
      }

      body.children().each((i, el) => {
        breakParagraphs(el)
      })

      section = section.filter(part => part.content.length > 1)
      if (section.length > 0) newSections.push(section)
    }

    setSections(newSections)
  }

  return (
    <div style={{ width: '55em', margin: '0 auto', padding: '1em' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
        {sections.map((section, i) =>
          <BookSection key={i} section={section} />)
        }
      </div>
    </div >
  )
}