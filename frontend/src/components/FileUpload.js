import React, { useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file.');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('File uploaded successfully!');
      onUploadSuccess?.();
      setFile(null);
    } catch (error) {
      console.error(error);
      alert('File upload failed');
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CloudUploadIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">Upload CSV</Typography>
        </Box>
        <Box>
          <Button variant="contained" component="label">
            Choose File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {file && (
            <Typography sx={{ mt: 1 }}>
              {file.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleUpload}>
            Upload
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default FileUpload;
