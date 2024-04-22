"use client";
import { useState, type FormEvent } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function IngestURLForm() {
  const [isUploaded, setUpLoaded] = useState(false);
  const [url, setUrl] = useState('');

  async function uploadURL(e: FormEvent<HTMLFormElement>) {
    const urnInputElm = (e.target as HTMLFormElement).getElementsByClassName("doc-site-url-input")[0] as HTMLInputElement;
    setUrl(urnInputElm.value);
    e.preventDefault();
    setUpLoaded(false);
    const response = await fetch("/api/retrieval/ingest-url", {
        method: "POST",
        body: JSON.stringify({
          url: urnInputElm.value
        }),
        headers: {
        "Content-Type": "application/json",
        },
      });
    const json = await response.json();
      if (response.status === 200) {
        // Represent intermediate steps as system messages for display purposes
        toast(`${json.message}` , {
          theme: "dark"
        });
        setUpLoaded(true);
      } else {
        if (json.error) {
          toast(json.error, {
            theme: "dark"
          });
          throw new Error(json.error);
        }
      }
  }
  
  const showForm = !isUploaded && (
    <form onSubmit={uploadURL} className="flex w-full mt-4">
      <input
        id='doc-site-url'
        className="grow mr-8 p-4 rounded doc-site-url-input"
        placeholder="Please add URL of the doc site you want to chat with"
      />
      <button type="submit" className="shrink-0 px-8 py-4 bg-sky-600 rounded w-28"> Upload URL </button>
    </form>
  );

  const showSuccess = isUploaded && (
    <div className="flex w-full mt-4">
      <h2>
        <code>{url}</code> URL is uploaded.
      </h2>
    </div>
  );
  
  return (
    <>
      {showForm}
      {showSuccess}
      <ToastContainer/>
    </>
  );
}
