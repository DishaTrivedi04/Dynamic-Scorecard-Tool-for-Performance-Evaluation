import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Radar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function ScoresChart({ scores, selectedEntities }) {
  // 'bar', 'line', 'radar', or 'pie'
  const [chartType, setChartType] = useState('bar');

  // Filter by selected entities if any
  const filtered = selectedEntities.length
    ? scores.filter((s) => selectedEntities.includes(s.entityId))
    : scores;

  // Group by entityId
  const groups = {};
  filtered.forEach((item) => {
    if (!groups[item.entityId]) {
      groups[item.entityId] = [];
    }
    groups[item.entityId].push(item);
  });

  // We'll compute average productivity, quality, timeliness for each entity
  const labels = ['Productivity', 'Quality', 'Timeliness'];
  const datasets = Object.keys(groups).map((entityId, idx) => {
    const dataArr = groups[entityId];
    let sumProd = 0, sumQual = 0, sumTime = 0;
    dataArr.forEach((r) => {
      sumProd += r.productivity;
      sumQual += r.quality;
      sumTime += r.timeliness;
    });
    const count = dataArr.length;
    const avgProd = sumProd / count;
    const avgQual = sumQual / count;
    const avgTime = sumTime / count;

    return {
      label: entityId,
      data: [avgProd, avgQual, avgTime],
      backgroundColor: `rgba(${(idx * 100) % 255}, 99, 132, 0.6)`
    };
  });

  const data = { labels, datasets };
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Scores Chart (${chartType.toUpperCase()})`
      }
    },
    scales: { y: { beginAtZero: true } }
  };

  // If we do a Pie chart, we sum or average across selected entities
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'line':
        return <Line data={data} options={options} />;
      case 'radar':
        return <Radar data={data} options={options} />;
      case 'pie':
        // Summation approach
        if (datasets.length > 0) {
          const total = [0, 0, 0];
          datasets.forEach((ds) => {
            ds.data.forEach((val, i) => {
              total[i] += val;
            });
          });
          const pieData = {
            labels,
            datasets: [
              {
                label: 'Totals',
                data: total,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
              }
            ]
          };
          return <Pie data={pieData} />;
        }
        return <Pie data={data} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Scores Visualization
        </Typography>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Chart Type</InputLabel>
          <Select
            value={chartType}
            label="Chart Type"
            onChange={(e) => setChartType(e.target.value)}
          >
            <MenuItem value="bar">Bar</MenuItem>
            <MenuItem value="line">Line</MenuItem>
            <MenuItem value="radar">Radar</MenuItem>
            <MenuItem value="pie">Pie</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ height: 400, mt: 2 }}>
        {renderChart()}
      </Box>
    </Box>
  );
}

export default ScoresChart;
