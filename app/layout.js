'use client';
import SignIn from '@/components/SignIn';
import '../styles/main.css'
import { RecoilRoot } from 'recoil';

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <body>
          <RecoilRoot>
            <SignIn />
            {children}
          </RecoilRoot>
        </body>
      </html>
  )
}