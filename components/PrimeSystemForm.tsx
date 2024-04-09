"use client";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useChat } from "ai/react";
import { useRef, useState, ReactElement } from "react";
import type { FormEvent } from "react";
import type { AgentStep } from "langchain/schema";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { UploadDocumentsForm } from "@/components/UploadDocumentsForm";
import { IntermediateStep } from "./IntermediateStep";

export function PrimeSystemForm() {
  async function primeSystem(e: FormEvent<HTMLFormElement>) {
    const url = e.target.getElementsByClassName("doc-site-url-input")[0].value;
    e.preventDefault();
    const response = await fetch("/api/chat/quick_start", {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        },
      });
    }
  return (
    <form onSubmit={primeSystem} className="flex w-full flex-col">
      <input
        id='doc-site-url'
        className="mr-8 p-4 rounded doc-site-url-input"
        placeholder="Please add URL of the doc site you want to chat with"
      />
      <button type="submit" className="shrink-0 px-16 py-4 bg-sky-600 rounded w-56"> Prime the system </button>
    </form>
  );
}
