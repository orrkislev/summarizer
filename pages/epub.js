import NewReader from '@/components/NewReader';
import NoSsrWrapper from '@/components/NoSsrWrapper';
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';


const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width:100vw;
  background: radial-gradient(circle at 10% 20%, #FE6B8B 30%, #FF8E53 90%), radial-gradient(circle at 90% 90%, #FF8E53 30%, #FE6B8B 90%);
  overflow: hidden;

  ${({ done }) => done && `
    transition: all .5s ease-in-out;
    height: 0;
  `}
`

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  transition: 0.2s ease-in-out;
  z-index: 2;


  ${({ focus }) => focus && `
    transform: scale(1.05);
    transition: 0.6s cubic-bezier(.17,.67,.83,.67);
  `}

  ${({ dragOver }) => dragOver && `
    transform: perspective(500px) rotateX(5deg) scale(1.05);
    transition: .2s ease-in-out;
    box-shadow: 0 10px 15px rgba(0,0,0,0.2);
  `}

  ${({ isTop }) => isTop && `
    transform: perspective(400px) scale(1.1);
    transition: 0.2s ease-in-out;
    box-shadow: 0 10px 15px rgba(0,0,0,0.2);
    `}
`

const goDown = keyframes`
    0% {
      max-height: 0;
      margin-top: 0;
    }
    100% {
      max-height: 100vh;
      margin-top: 100vh;
    }
  `;

const Loader = styled.div`
    z-index: 1;
    background-color: white;
    border: 20px solid white;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
    animation: ${goDown} 10s ease-out;
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

  const FileUpload = styled.input`
    display: none;
  `;
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


export default function epubPage() {
  const [epubFile, setEpubFile] = useState(null);
  const [screenDrag, setScreenDrag] = useState(false);
  const [cardDrag, setCardDrag] = useState(false);
  const [readyToRead, setReadyToRead] = useState(false);
  const [hideUI, setHideUI] = useState(false);

  const handleFileUpload = (e) => {
    setEpubFile(e.target.files[0]);
  };

  const updateScreenDrag = (e, val) => {
    e.preventDefault()
    e.stopPropagation()
    setScreenDrag(val);
  }

  const updateCardDrag = (e, val) => {
    e.preventDefault()
    e.stopPropagation()
    setCardDrag(val);
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setEpubFile(e.dataTransfer.files[0]);
  }

  const doneLoading = () => {
    setTimeout(() => setReadyToRead(true), 1000)
    setTimeout(() => setHideUI(true), 1500)
  }

  return (
    <NoSsrWrapper>
      {!hideUI && (
        <Centered done={readyToRead} onDragEnter={e => updateScreenDrag(e, true)} onDragLeave={e => updateScreenDrag(e, false)}>

          <Card focus={screenDrag} isTop={epubFile} dragOver={cardDrag}
            onDragEnter={e => updateCardDrag(e, true)} onDragLeave={e => updateCardDrag(e, false)} onDrop={handleDrop}
            onMouseEnter={() => setCardDrag(true)} onMouseLeave={() => setCardDrag(false)}>
            <FileUploadLabel for="file-upload" class="custom-file-upload">
              Upload .epub file
            </FileUploadLabel>
            <FileUpload id="file-upload" type="file" onChange={handleFileUpload}/>
          </Card>

          {epubFile && <FakeWords />}
        </Centered>
      )}
      {epubFile && <NewReader file={epubFile} doneLoading={doneLoading} />}
    </NoSsrWrapper>
  )
}

function FakeWords() {
  const [words, setWords] = useState([])

  useEffect(() => {
    const newWords = Array(1000).fill(0).map(() =>
      Math.random().toString(36).substring(2, Math.random() * 10 + 2))
    setWords(newWords)
  }, [])

  return (
    <Loader>
      {words.map((word, i) => {
        if (i % 30 == 0) return <br key={i} />
        else return <span key={i}>{word} </span>
      })}
    </Loader>
  )
}