'use client';

import NoSsrWrapper from '@/components/NoSSRWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import PDFReader from './PdfReader';
import { RecoilRoot } from 'recoil';
import EpubReader from './EpubReader';


const BG = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width:100vw;
  background: radial-gradient(circle at 10% 20%, #FE6B8B 30%, #FF8E53 90%), radial-gradient(circle at 90% 90%, #FF8E53 30%, #FE6B8B 90%);
  overflow: hidden;
`

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  transition: 0.2s ease-in-out;
  z-index: 2;

  &:hover {
    transform: perspective(500px) rotateX(10deg) scale(1.1);
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
  }
`

export default function EpubPage() {
  const [bookFile, setBookFile] = useState(null)
  const [readyToRead, setReadyToRead] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    setBookFile(file);
  };

  const doneLoading = () => {
    setTimeout(() => setReadyToRead(true), 1000)
  }

  const bookFormat = bookFile ? bookFile.name.split('.').pop().toLowerCase() : null

  return (
    <NoSsrWrapper>
        <AnimatePresence>
          {!readyToRead && (
            <BG exit={{ height: 0 }} transition={{ duration: 0.5 }}>
              {bookFile ?
                <FakeWords />
                :
                <Card>
                  <FileUpload onChange={handleFileUpload} />
                </Card>
              }
            </BG>
          )}
        </AnimatePresence>
      <RecoilRoot>
        {bookFormat == 'epub' && <EpubReader file={bookFile} doneLoading={doneLoading} />}
        {bookFormat == 'pdf' && <PDFReader file={bookFile} doneLoading={doneLoading} />}
      </RecoilRoot>
    </NoSsrWrapper>
  )
}






const LoaderContainer = styled.div`
    z-index: 1;
    height: 50vh;
    border-radius: 10px;
    overflow: hidden;
    `

const Loader = styled(motion.div)`
    background-color: white;
    border: 20px solid white;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
    color: #ccc;
    width: 40em;
    overflow-y: scroll;
    line-height: 10px;
    font-size: 5px;
    transform: rotate(180px);
    text-align: left;
    
    span {
      margin: 0 1px;
      background-color: #ccc;
    }
  `;

function FakeWords() {
  const [words, setWords] = useState([])

  useEffect(() => {
    const newWords = Array(1000).fill(0).map(() =>
      Math.random().toString(36).substring(2, Math.random() * 10 + 2))
    setWords(newWords)
  }, [])

  return (
    <LoaderContainer >
      <Loader
        initial={{ y: '-100%' }}
        animate={{ y: '100%' }}
        transition={{ duration: 10 }}>
        {words.map((word, i) => {
          if (i % 30 == 0) return <br key={i} />
          else return <span key={i}>{word} </span>
        })}
      </Loader>
    </LoaderContainer>
  )
}







const FileUploadLabel = styled.label`
    cursor: pointer;
    padding: 0.5em 1em;
    border-radius: 5px;
    font-family: 'CrimsonText', serif;
    font-size: 1.2rem;
    font-weight: 600;
    color: crimson;
    border: 2px solid crimson;
    transition: all 0.1s ease-in-out;
    &:hover {
      background-color: crimson;
      color: white;
    }
  `;


function FileUpload(props) {
  return (
    <>
      <FileUploadLabel htmlFor="file-upload">
        Upload file
      </FileUploadLabel>
      <input style={{ display: 'none' }} id="file-upload" type="file" onChange={props.onChange} />
    </>
  )
}