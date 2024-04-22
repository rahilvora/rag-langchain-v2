import { ChatWindow } from "@/components/ChatWindow";

export default function QuickStart() {
 
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">
        ▲ Next.js + LangChain.js 🦜🔗
      </h1>
      <ul>
        <li className="text-l">
          🤝
          <span className="ml-2">
            This template showcases a simple chatbot using{" "}
            <a href="https://js.langchain.com/" target="_blank">
              LangChain.js
            </a>{" "}
            and the Vercel{" "}
            <a href="https://sdk.vercel.ai/docs" target="_blank">
              AI SDK
            </a>{" "}
            in a{" "}
            <a href="https://nextjs.org/" target="_blank">
              Next.js
            </a>{" "}
            project.
          </span>
        </li>
        <li className="hidden text-l md:block">
          💻
          <span className="ml-2">
            You can find the prompt and model logic for this use-case in{" "}
            <code>app/api/chat/quick_start/route.ts</code>.
          </span>
        </li>
        <li>
          <span className="ml-2">
            It is a well behaved bot that is polite and direct.️
          </span>
        </li>
        <li className="hidden text-l md:block">
          🎨
          <span className="ml-2">
            The main frontend logic is found in <code>app/page.tsx</code>.
          </span>
        </li>
        
        <li className="text-l">
          <span className="ml-2">
          This system is configured chat with JS MDN does. Click `Prime the system button` to ingest MDN docs. Once you see success message start chatting with it.
          </span>
        </li>
      </ul>
    </div>
  );
  return (
    <>
      <ChatWindow
        endpoint="api/chat/quick_start"
        emoji="🏴‍☠️"
        titleText="RAG with URLs"
        placeholder="Tell me something about different types of rock formations? 🏞️"
        emptyStateComponent={InfoCard}
        showModelOptions={true}
        showURLIngestForm={true}
      ></ChatWindow>
    </>
  );
  // test commit
}
