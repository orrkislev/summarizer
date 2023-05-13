import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic'
const NewReader = dynamic(() => import('../components/NewReader'), { ssr: false, })

export default function Home() {
  const [file, setFile] = useState(null);

  const loadDefault = () => {
    fetch('/files/book2.epub')
      .then(res => res.blob())
      .then(blob => {
        setFile(blob)
      })
  }

  const handleFileUpload = (e) => {
    console.log(e.target.files[0])
    setFile(e.target.files[0]);
  };

  return (
    <div style={{color:'white'}}>
      {!file && (
        <div>
          <h1>Upload an EPUB file</h1>
          <input type="file" onChange={handleFileUpload} />
        </div>
      )}
      <NewReader file={file} />
    </div>
  )

}
