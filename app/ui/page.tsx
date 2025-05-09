'use client';

import { useState } from 'react';
import {streamComponent} from "@/server/generative-ui-action";


export default function Page() {
  const [component, setComponent] = useState<React.ReactNode>();

  return (
      <div className="flex flex-col items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <form
            onSubmit={async e => {
              e.preventDefault();
              setComponent(await streamComponent());
            }}
        >
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Stream Component
          </button>
        </form>
        <div className="py-5">{component}</div>
      </div>
  );
}
