import React, { useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box
} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

function ScoreForm({ onAddScore }) {
  const [entityId, setEntityId] = useState('');
  const [productivity, setProductivity] = useState('');
  const [quality, setQuality] = useState('');
  const [timeliness, setTimeliness] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/scores', {
        entityId,
        productivity,
        quality,
        timeliness
      });
      onAddScore?.();
      // reset
      setEntityId('');
      setProductivity('');
      setQuality('');
      setTimeliness('');
    } catch (error) {
      console.error(error);
      alert('Failed to submit score');
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonAddAltIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">Manual Score Entry</Typography>
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Entity ID"
            variant="outlined"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            required
          />
          <TextField
            label="Productivity"
            type="number"
            value={productivity}
            onChange={(e) => setProductivity(e.target.value)}
            required
          />
          <TextField
            label="Quality"
            type="number"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            required
          />
          <TextField
            label="Timeliness"
            type="number"
            value={timeliness}
            onChange={(e) => setTimeliness(e.target.value)}
            required
          />
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ScoreForm;
