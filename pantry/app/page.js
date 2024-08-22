'use client';

import PantryClient from './PantryClient/page';
import { usePathname } from 'next/navigation';


const Page = () => {
  const pathname = usePathname();

  return <PantryClient />;

};

export default Page;