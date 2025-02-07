/******************************************************
 * FRONTEND: App.js
 ******************************************************/
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Grid,
  Card,
  CardContent,
  Container,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';

import ScoreForm from './components/ScoreForm';
import FileUpload from './components/FileUpload';
import ScoresChart from './components/ScoresChart';
import ScoresTable from './components/ScoresTable';

function App() {
  // --------------------- STATE ---------------------
  const [scores, setScores] = useState([]);
  const [weights, setWeights] = useState({
    productivity: 0.5,
    quality: 0.3,
    timeliness: 0.2,
  });
  const [entities, setEntities] = useState([]);
  const [selectedEntities, setSelectedEntities] = useState([]);

  // --------------------- THEME ---------------------
  const theme = createTheme({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#9c27b0' },
      background: {
        default: '#F5F7FA', // Light grey background
      },
    },
    typography: {
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
  });

  // --------------------- FETCH SCORES ---------------------
  const fetchScores = async () => {
    try {
      const res = await axios.get('/api/scores');
      setScores(res.data);
      // Extract unique entity IDs
      const uniqueEntities = [...new Set(res.data.map((item) => item.entityId))];
      setEntities(uniqueEntities);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch scores');
    }
  };

  // --------------------- FETCH WEIGHTS ---------------------
  const fetchWeights = async () => {
    try {
      const res = await axios.get('/api/weights');
      setWeights(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // --------------------- LIFECYCLE ---------------------
  useEffect(() => {
    fetchScores();
    fetchWeights();
  }, []);

  // --------------------- HANDLERS ---------------------
  // Called after form submit or file upload
  const handleDataChange = () => {
    fetchScores();
  };

  // Update weights on the server
  const handleUpdateWeights = async () => {
    try {
      await axios.post('/api/weights', weights);
      alert('Weights updated successfully!');
      fetchWeights(); // re-fetch to confirm
    } catch (err) {
      console.error(err);
      alert('Failed to update weights');
    }
  };

  // Export CSV/PDF/Excel
  const handleExport = (type) => {
    window.open(`/api/export/${type}`, '_blank');
  };

  // Entity selection (for chart comparison)
  const handleEntitySelection = (e) => {
    setSelectedEntities(e.target.value);
  };

  // --------------------- RENDER ---------------------
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: '100vh', // full page height
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        {/* APP BAR */}
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Dynamic Scorecard
            </Typography>
          </Toolbar>
        </AppBar>

        {/* MAIN CONTENT */}
        <Container sx={{ py: 2, flexGrow: 1 }}>
          {/* TITLE */}
          <Typography variant="h4" gutterBottom>
            Performance Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage performance scores, upload data, update weights, and visualize metrics.
          </Typography>

          {/* 2-COLUMN LAYOUT */}
          <Grid container spacing={2}>
            {/* LEFT COLUMN */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 1) Score Form */}
                <ScoreForm onAddScore={handleDataChange} />

                {/* 2) File Upload */}
                <FileUpload onUploadSuccess={handleDataChange} />

                {/* 3) Weights + Exports */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Update Weights
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                      <TextField
                        label="Productivity"
                        type="number"
                        value={weights.productivity}
                        onChange={(e) => setWeights({ ...weights, productivity: e.target.value })}
                        inputProps={{ step: '0.1' }}
                        size="small"
                      />
                      <TextField
                        label="Quality"
                        type="number"
                        value={weights.quality}
                        onChange={(e) => setWeights({ ...weights, quality: e.target.value })}
                        inputProps={{ step: '0.1' }}
                        size="small"
                      />
                      <TextField
                        label="Timeliness"
                        type="number"
                        value={weights.timeliness}
                        onChange={(e) => setWeights({ ...weights, timeliness: e.target.value })}
                        inputProps={{ step: '0.1' }}
                        size="small"
                      />
                    </Box>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleUpdateWeights}
                      sx={{ mt: 2 }}
                    >
                      Save Weights
                    </Button>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Current: {JSON.stringify(weights)}
                    </Typography>

                    {/* EXPORT BUTTONS */}
                    <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('csv')}
                        size="small"
                      >
                        CSV
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => handleExport('pdf')}
                        size="small"
                      >
                        PDF
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<TableViewIcon />}
                        onClick={() => handleExport('excel')}
                        size="small"
                      >
                        Excel
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            {/* RIGHT COLUMN */}
            <Grid item xs={12} md={8}>
              {/* Compare Entities */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Compare Entities</Typography>
                <FormControl sx={{ minWidth: 200, mt: 1 }} size="small">
                  <InputLabel id="entity-select-label">Select Entities</InputLabel>
                  <Select
                    labelId="entity-select-label"
                    multiple
                    value={selectedEntities}
                    onChange={handleEntitySelection}
                    label="Select Entities"
                  >
                    {entities.map((ent) => (
                      <MenuItem key={ent} value={ent}>
                        {ent}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Chart */}
              <ScoresChart scores={scores} selectedEntities={selectedEntities} />

              {/* Table */}
              <Box sx={{ mt: 3 }}>
                <ScoresTable scores={scores} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
