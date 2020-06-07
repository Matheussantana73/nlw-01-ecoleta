import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload } from "react-icons/fi";
import './style.css'

interface Props{
  onFileUploaded: (file: File) => void,
}

const Dropzone: React.FC<Props> = ({onFileUploaded}) => {

  const [selectedFileUrl, setSelectedFileUrl] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const url = URL.createObjectURL(file);
    setSelectedFileUrl(url);
    onFileUploaded(file);
  }, [onFileUploaded])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} />       
        { selectedFileUrl
          ? <img src={selectedFileUrl} alt={`${'Upload'} ${'Image'}`}/>
          : <p>
          <FiUpload />
          Emagem do Estabelecimento
        </p>}
    </div>
  )
}

export default Dropzone;