import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Typography
} from '@mui/material';

function ScoresTable({ scores }) {
  const [order, setOrder] = useState('desc');

  const sorted = [...scores].sort((a, b) => {
    return order === 'asc' ? a.score - b.score : b.score - a.score;
  });

  const handleSortToggle = () => {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  };

  if (!scores || scores.length === 0) {
    return <Typography>No data available</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ m: 2 }}>
        All Scores
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Entity ID</TableCell>
            <TableCell>Productivity</TableCell>
            <TableCell>Quality</TableCell>
            <TableCell>Timeliness</TableCell>
            <TableCell sortDirection={order}>
              <TableSortLabel active direction={order} onClick={handleSortToggle}>
                Score
              </TableSortLabel>
            </TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.entityId}</TableCell>
              <TableCell>{item.productivity}</TableCell>
              <TableCell>{item.quality}</TableCell>
              <TableCell>{item.timeliness}</TableCell>
              <TableCell>{item.score}</TableCell>
              <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ScoresTable;
