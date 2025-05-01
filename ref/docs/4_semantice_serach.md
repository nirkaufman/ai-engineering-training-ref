# Semantic search application


## Step #1
- install: `@langchain/community` and `pdf-parse`

```bash
  npm i @langchain/community pdf-parse 
```

- under `server` create a new file named: search
- under `app` create a new folder named: `search` with a single file named `page.tsx`



## Create documents 
- open `server/search` and add the following:

__search.ts__
```typescript
'use server'
import { Document } from "@langchain/core/documents";

const documents = [
  new Document({
    pageContent:
        "Dogs are great companions, known for their loyalty and friendliness.",
    metadata: { source: "mammal-pets-doc" },
  }),
  new Document({
    pageContent: "Cats are independent pets that often enjoy their own space.",
    metadata: { source: "mammal-pets-doc" },
  }),
];


export async function logDocuments() {
  console.log(documents);
}

```

- open `app/search/page.tsx` and add the following:

__search/page.tsx__
```tsx
'use client';
import React from 'react';
import {logDocuments} from "@/server/search";

export default function SearchPage() {

  const handleClick = async () => {
    await logDocuments();
  };

  return (
      <button
          onClick={handleClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Click me
      </button>
  );
}
```

- open the console on your web browser and inspect the results


## Load a PDF document

- LangChain has a built-in PDF loader for us to use.
- install `@langchain/community`

```bash
  npm i @langchain/community
```

- download a PDF, or use your own,
- create a `resources` folder under `server` and put it there

- in `server/search.ts` add the following code:

```ts
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function logPDF() {
  const loader = new PDFLoader("../../data/nke-10k-2023.pdf");
  const docs = await loader.load();

  console.log(docs.length);
}
```
