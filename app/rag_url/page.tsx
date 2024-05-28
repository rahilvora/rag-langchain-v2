import { ChatWindow } from "@/components/ChatWindow";

export default function QuickStart() {
  return (
    <>
      <ChatWindow
        endpoint="api/chat/rag_url"
        titleText="RAG with URLs"
        placeholder="As questions about the content of the upload URL?"
        // showModelOptions={true}
        showURLIngestForm={true}
      ></ChatWindow>
    </>
  );
}
