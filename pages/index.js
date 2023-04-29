import { useEffect, useState } from 'react'
import JSZip from 'jszip'
import cheerio from 'cheerio'
import BookPart from '@/components/BookPart'
import BookSection from '@/components/BookSection'

export default function Home() {
  const [file, setFile] = useState(null)
  const [sections, setSections] = useState([])

  const loadFile = async (e) => {
    setFile(e.target.files[0])

    const arrayBuffer = await new Response(e.target.files[0]).arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)
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

  if (!file) {
    // button to upload file
    return (
      <div style={{ width: '55em', margin: '0 auto', padding: '1em' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
          <input type="file" onChange={loadFile} />
        </div>
      </div >
    )
  }

  if (!sections) return null

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