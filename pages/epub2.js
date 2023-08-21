import { useEffect, useState } from 'react';
import epub from 'epubjs';
import Reader from '@/components/Reader';

export default function Home() {
  const [file, setFile] = useState(null);
  const [texts, setTexts] = useState(null);

  const handleFileUpload = (e) => {
    console.log(e.target.files[0])
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    if (file) {
      loadBook(file)
    }
  }, [file])

  const loadBook = async () => {
    const book = new epub(file);
    await book.ready;

    const parts = []
    for (let i = 0; i < book.spine.length; i++) {
      const spineItem = book.spine.get(i);
      const chapterDocument = await book.load(spineItem.href);
      let body = chapterDocument.querySelector('body');
      const docParts = parseDocument(body)
      parts.push(...docParts)
    }
    setTexts(parts.map(part => {
      if (part.type == 'title') return [part.txt,'','']
      else return [part.txt,'...','...']
    }))
  }

  return (
    <div>
      {!file && (
        <div style={{ color: 'white' }}>
          <h1>Upload an EPUB file</h1>
          <input type="file" onChange={handleFileUpload} />
        </div>
      )}
      {texts && (
        <Reader texts={texts} />
      )}
    </div>
  )

}


function parseDocument(doc) {
  const parts = []
  if (doc.children.length === 1) return parseDocument(doc.children[0])
  if (doc.children.length === 0) return [{ type: getType(doc), txt: doc.innerText }]
  for (const child of doc.children) {
    const partType = getType(child)
    parts.push({ type: partType, txt: child.innerText })
  }
  return parts
}

const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
function getType(el) {
  const tag = el.tagName
  if (headingTags.includes(tag)) return 'title'
  const className = el.className
  if (className.includes('title')) return 'title'
  if (className.includes('heading')) return 'title'
  if (className.includes('note')) return 'note'
  let fontSize = el.style.fontSize
  if (fontSize){
    fontSize = fontSize.replace('px', '')
    if (fontSize > 20) return 'title'
    if (fontSize < 10) return 'note'
  }

  return 'text'
}