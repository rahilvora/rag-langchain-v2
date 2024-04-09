"use client";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import type { FormEvent } from "react";

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
      const json = await response.json();
      if (response.status === 200) {
        // Represent intermediate steps as system messages for display purposes
        toast(`${json.message}. System is primed` , {
          theme: "dark"
        });
      } else {
        if (json.error) {
          toast(json.error, {
            theme: "dark"
          });
          throw new Error(json.error);
        }
      }
    }
  return (
    <>
      <form onSubmit={primeSystem} className="flex w-full flex-col">
        <input
          id='doc-site-url'
          className="mr-8 p-4 rounded doc-site-url-input"
          placeholder="Please add URL of the doc site you want to chat with"
        />
        <button type="submit" className="shrink-0 px-16 py-4 bg-sky-600 rounded w-56"> Prime the system </button>
      </form>
      <ToastContainer/>
    </>
    
  );
}
