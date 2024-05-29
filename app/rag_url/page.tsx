import { ChatWindow } from "@/components/ChatWindow";

export default function QuickStart() {
  return (
    <>
      <ChatWindow
        endpoint="api/chat/rag_url"
        titleText="RAG with URLs"
        placeholder="Upload URL to get better results"
        // showModelOptions={true}
        showURLIngestForm={true}
      ></ChatWindow>
    </>
  );
}
