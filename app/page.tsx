import Link from "next/link";

export default function Home() {
  return (
      <div
          className="flex flex-col items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="flex-grow flex flex-col items-center justify-center">
          <h1 className="text-5xl mb-1"><span className='font-bold'>AI Engineering</span> Training :: <span
              className="text-orange-400">Reference</span></h1>

          <Link href="/chat" className="mt-4">
            Nir Kaufman | 2025
          </Link>
        </div>
      </div>
  );
}
