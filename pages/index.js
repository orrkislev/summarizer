import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic'
const NewReader = dynamic(() => import('../components/NewReader'), { ssr: false, })

export default function Home() {
  const [file, setFile] = useState(null);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div>
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
