# Working with templates


- open `chat-action.ts`
- create a `system temaplte` as follows

__chat-action.ts__
```ts
  import { ChatPromptTemplate } from "@langchain/core/prompts";

  const systemTemplate = "Translate the following from English into {language}";
```

- create the PromptTemplate. a combination of the systemTemplate and a simple template for where to put the text.


__chat-action.ts__
```ts
  import { ChatPromptTemplate } from "@langchain/core/prompts";

  const systemTemplate = "Translate the following from English into {language}";

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);
```

- Note that ChatPromptTemplate supports multiple message roles in a single template. 
- format the messages and pass it to the model


__chat-action.ts__
```ts
  export async function streamChatWithPromptTemplate(
    language: string,
    text: string
) {
  const systemTemplate = "Translate the following from English into {language}";

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);

  const messages = await promptTemplate.formatMessages({
    language: language,
    text: text,
  });

  const stream = await model.stream(messages);

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(chunk.content);
      }
      controller.close();
    },
  });
}
```

- re implement the handle function on the client:

```tsx

const handleWithTemplate = async (e: FormEvent) => {
  e.preventDefault()

  if (!inputValue.trim() || isStreaming) return

  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content: inputValue.trim()
  }

  setMessages(prev => [...prev, userMessage])
  const userPrompt = inputValue
  const browserLanguage = window.navigator.language.split('-')[0]

  setInputValue('')
  setIsStreaming(true)

  try {
    const aiMessageId = generateId()
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: 'ai',
      content: ''
    }])

    const stream = await streamChatWithPromptTemplate(browserLanguage, userPrompt)
    const reader = stream.getReader()

    while (true) {
      const {done, value} = await reader.read()
      if (done) break

      setMessages(prev => {
        const aiMessage = prev.find(msg => msg.id === aiMessageId)
        if (!aiMessage) return prev

        return prev.map(msg =>
            msg.id === aiMessageId
                ? {...msg, content: msg.content + value}
                : msg
        )
      })
    }
  } catch (error) {
    console.error('Streaming error:', error)
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'ai',
      content: 'Sorry, there was an error processing your request.'
    }])
  } finally {
    setIsStreaming(false)
  }
}
```

- to test it: open devtools --> sensors and change location to Japan
- prompt something and see the results
