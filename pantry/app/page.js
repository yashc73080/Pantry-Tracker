import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/react"

const PantryClient = dynamic(() => import('./PantryClient'), { ssr: false });

export default function Home() {
  return (
    <>
      <PantryClient />
      <Analytics />
    </>
  );
}