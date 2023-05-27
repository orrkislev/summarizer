import Reader from '@/components/Reader';
import { useRouter } from 'next/router';
 
export default function Page() {
  const router = useRouter();
  if (!router.query.slug) return null;
  return <Reader filename={router.query.slug + '.tsv'} />
}