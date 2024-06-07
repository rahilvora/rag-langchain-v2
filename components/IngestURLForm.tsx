"use client";
import { useState, type FormEvent } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import LoadingButton from '@mui/lab/LoadingButton';


export function IngestURLForm() {
  const fabStyle = {
    backgroundColor: 'black',
  }
  const inputStyle = {
    outline: 'none',
  }
  const inputWrapperStyle = {
    outline: "1px solid #000",
    flexDirection: "row" as "row"
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
  // input state
  const [isUploaded, setUpLoaded] = useState(false);
  const [url, setUrl] = useState('');

  // Modal state
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = (_event: Object | undefined, reason: string | undefined) => {
    console.log(reason)
    if(reason !== 'backdropClick') {
      setOpen(false)
    }
  };

  // Loading btn state
  const [loading, setLoading] = useState(false);

  async function uploadURL(e: FormEvent<HTMLFormElement>) {
    const urnInputElm = (e.target as HTMLFormElement).getElementsByClassName("doc-site-url-input")[0] as HTMLInputElement;
    setUrl(urnInputElm.value);
    e.preventDefault();
    setUpLoaded(false);
    setLoading(true);
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
        setLoading(false)
      } else {
        if (json.error) {
          toast(json.error, {
            theme: "dark"
          });
          setLoading(false)
          throw new Error(json.error);
        }
      }
  }
  
  const showForm = !isUploaded && (
    <div>
      <Fab color="primary" aria-label="add" onClick={handleOpen} style={fabStyle}>
        <AddIcon />
      </Fab>
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
          <LoadingButton 
            type="submit" 
            className="px-2 py-2 w-36"
            style={uploadBtnStyle}
            loading={loading}
          > 
            Upload 
          </LoadingButton>
        </div>
        </form>
        </Box>
      </Modal>
    </div>
  );
  
  return (
    <div>
      {showForm}
      <ToastContainer/>
    </div>
  );
}
