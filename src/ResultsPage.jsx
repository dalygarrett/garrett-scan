import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Popover from '@mui/material/Popover';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid'; // Import Grid component
import Box from '@mui/material/Box';

import './App.css'; // Import App.css

function ResultsPage({ data, yextData }) {
  const [isLoading, setIsLoading] = useState(true);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [error, setError] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const openPopover = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (data && yextData) {
      try {
        console.log("yextData:", yextData); // Add this console log
        if (data.lighthouseResult && data.lighthouseResult.audits) {
          
          const audits = data.lighthouseResult.audits;

          // Define weights for each metric
          const weights = {
            'first-contentful-paint': 10,
            'speed-index': 10,
            'largest-contentful-paint': 25,
            'total-blocking-time': 30,
            'cumulative-layout-shift': 25,
          };

          let totalScore = 0;
          let totalWeight = 0;

          for (const metric in weights) {
            if (audits[metric] && audits[metric].score !== undefined && audits[metric].score !== null) {
              const weight = weights[metric];
              totalScore += audits[metric].score * weight;
              totalWeight += weight;
            }
          }

          const calculatedScore = (totalScore / totalWeight).toFixed(2) * 100;
          setPerformanceScore(isNaN(calculatedScore) ? 0 : calculatedScore); // Ensure it's a valid number

          setAnchorEl(null);

          setIsLoading(false);
        } else {
          setError(new Error('No audit data available'));
          setIsLoading(false);
        }
      } catch (error) {
        setError(error);
        setIsLoading(false);
      }
    }
  }, [data, yextData]);

  // Function to get the color for the progress bar
  const getProgressBarColor = (score) => {
    const red = Math.min(255, 255 - score * 2.55);
    const green = Math.min(255, score * 2.55);
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <Container style={{ width: '100%', overflowY: 'scroll', height: '90%' }}>
      <Typography variant="h4" gutterBottom align="center">
        Results Page
      </Typography>
      {isLoading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <Box style={{ width: '100%' }}>
          <Box
            border="1px solid #ccc"
            padding="10px"
            textAlign="center"
            height="100%"
            position="relative"
          >
            <Typography variant="h6">Website Performance</Typography>
            <LinearProgress
              variant="determinate"
              value={Math.round(performanceScore)}
              style={{
                backgroundColor: '#f1f1f1',
                height: '20px',
              }}
            />
            <Typography
              variant="body1"
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Score: {Math.round(performanceScore)}%
            </Typography>
            <IconButton
              aria-label="info"
              aria-owns={openPopover ? 'performance-metrics' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
              }}
            >
              <InfoIcon />
            </IconButton>
            <Popover
              id="performance-metrics"
              open={openPopover}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              style={{ maxWidth: '300px' }}
            >
              <Typography variant="body2" style={{ padding: '20px' }}>
                <ul>
                  <li>First Contentful Paint (10%): ...</li>
                  <li>Speed Index (10%): ...</li>
                  <li>Largest Contentful Paint (25%): ...</li>
                  <li>Total Blocking Time (30%): ...</li>
                  <li>Cumulative Layout Shift (25%): ...</li>
                </ul>
              </Typography>
            </Popover>
          </Box>
          {yextData && yextData.response ? (
            <Grid container spacing={2}> {/* Add Grid component */}
              {yextData.response.map((site, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}> {/* Specify the grid size */}
                  <Box
                    border="1px solid #ccc"
                    padding="10px"
                    margin="20px 0"
                    textAlign="center"
                    height="100%"
                    position="relative"
                  >
                    <Typography variant="h6">{site.name}</Typography>
                    {site.logo && (
                      <img
                        src={site.logo.url}
                        alt={`${site.name} Logo`}
                        width={site.logo.width}
                        height={site.logo.height}
                      />
                    )}
                    <Typography variant="body1">
                      Status: {site.status}
                    </Typography>
                    <Typography variant="body1">
                      Match Name: {site.match_name ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1">
                      Match Address: {site.match_address ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1">
                      Match Phone: {site.match_phone ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1">
                      Review Rating: {site.review_rating}
                    </Typography>
                    <Typography variant="body1">
                      Review Count: {site.review_count}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : null}
        </Box>
      )}
    </Container>
  );
}

export default ResultsPage;
