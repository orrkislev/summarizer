import Reader from '@/components/Reader';
 
export default function Page({params}){
  if (!params.slug) return null;
  return <Reader filename={params.slug + '.tsv'} />
}

// this is the example from the next.js documentation
// export default function Page({ params }: { params: { slug: string } }) {
//     return <div>My Post: {params.slug}</div>
//   }