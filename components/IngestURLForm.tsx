"use client";
import { useState, type FormEvent } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

export function IngestURLForm() {
  const inputStyle = {
    outline: 'none',
    flexGrow: 2
  }
  const inputWrapperStyle = {
    outline: '1px solid #000',
    flexDirection: 'row'
  }
  const uploadBtnStyle = {
    margin: '0.3rem'
  }
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  const [isUploaded, setUpLoaded] = useState(false);
  
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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
        handleClose();
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
    <div className="flex w-full mt-4">
    
      {/* <input
        id='doc-site-url'
        className="grow mr-8 p-4 rounded doc-site-url-input"
        placeholder="Please add URL of the doc site you want to chat with"
      /> */}

      <div className="flex w-full">
        <Fab color="primary" aria-label="add" onClick={handleOpen}>
          <AddIcon />
        </Fab>
      </div>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
        <form onSubmit={uploadURL}>
        <div className="flex" style={inputWrapperStyle}>
          <input
            id='doc-site-url'
            style={inputStyle}
            className="w-full grow p-4 rounded doc-site-url-input"
            placeholder="Please add URL of the doc site you want to chat with"
          />
          <button type="submit" className="px-2 py-2 bg-sky-600 rounded w-36" style={uploadBtnStyle}> Upload URL </button>
        </div>
        </form>
        </Box>
      </Modal>
    </div>
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
