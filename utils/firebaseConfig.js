import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from "firebase/firestore";
import { atom, useRecoilState } from "recoil";

const firebaseConfig = {
  apiKey: "AIzaSyBSToBdhSIKPdXESzXXOCUbcYmqLGVn69w",
  authDomain: "book-summarizer-c97a8.firebaseapp.com",
  projectId: "book-summarizer-c97a8",
  storageBucket: "book-summarizer-c97a8.appspot.com",
  messagingSenderId: "668238495117",
  appId: "1:668238495117:web:46569f0ea13062d2a6d1c4",
  measurementId: "G-739QQMXWYR"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
const store = getFirestore(firebaseApp);

export const bookAtom = atom({ key:'book', default: null })

export function useBookData(){
    const [bookData, setBookData] = useRecoilState(bookAtom)

    const setBook = async (file) => {
      const fileSize = file.size % 100000
      const filename = file.name
      const bookId = `${filename}-${fileSize}`
      setBookData({bookId})

      if (!auth.currentUser) return
      const bookDoc = doc(store, `users/${auth.currentUser.uid}/books/${bookId}`)
      // check if doc exists
      const docSnap = await getDoc(bookDoc)
      if (docSnap.exists()) setBookData({bookId, savedCloud:true})
    }

    const saveSummary = async (pageNum, paragraphNum, summaries, gist) => {
      if (!auth.currentUser) return
      const paragraphDoc = doc(store, `users/${auth.currentUser.uid}/books/${bookData.bookId}/page_${pageNum}/paragraph_${paragraphNum}`)
      await setDoc(paragraphDoc, {
        'summaries': summaries,
        'gist': gist,
      })
    }

    const getPageSummaried = async (pageNum) => {
      if (!auth.currentUser) return
      const pageCollection = collection(store, `users/${auth.currentUser.uid}/books/${bookData.bookId}/page_${pageNum}`)
      const pageDocs = await getDocs(pageCollection)
      let pageSummaries = []
      pageDocs.forEach(doc => {
        pageSummaries.push(doc.data())
      })
      return pageSummaries
    }


    return {bookData, setBook, saveSummary, getPageSummaried}
}