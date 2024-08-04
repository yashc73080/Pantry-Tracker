import PantryClient from './PantryClient';
import { Analytics } from "@vercel/analytics/react"

export default function Home() {
  return (
    <>
      <PantryClient />
      <Analytics />
    </>
  );
}