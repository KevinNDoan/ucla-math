import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
export default function NotFound() { return <div className="site-container not-found"><p className="eyebrow">404 · An unsolved problem</p><h1>Let’s find another way.</h1><p>This page couldn’t be found. Search the department or head back to a familiar starting point.</p><div className="flex flex-wrap justify-center gap-4"><Link href="/search/" className="solid-button">Search the website<ArrowRight size={17}/></Link><Link href="/" className="outline-button">Back to home<ArrowRight size={17}/></Link></div></div>; }
