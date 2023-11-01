import React, { useState, useEffect } from 'react';
import ResultsPage from './ResultsPage'; // Import the ResultsPage component
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

function FormComponent() {
  const [formData, setFormData] = useState({
    businessName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    websiteURL: '',
  });

  const [apiData, setApiData] = useState(null);
  const [yextData, setYextData] = useState({
    response1: null,
    response2: null,
  }); // For Yext API responses
  const [jobId, setJobId] = useState(null); // To store the jobId
  const CORS_PROXY_URL = 'https://corsproxy.io/?';

  const handleSubmit = async () => {
    const { websiteURL } = formData;

    try {
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${websiteURL}&strategy=mobile`
      );
      const data = await response.json();

      // Set API data for the ResultsPage
      setApiData(data);
      await handleYextApi();
    } catch (error) {
      console.error(error);
    }
  }

  const handleYextApi = async () => {
    try {
      // Create a POST request to Yext
      const yextRequestBody = {
        name: formData.businessName,
        address: formData.streetAddress,
        phone: formData.phoneNumber,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        includeReviewMetrics: true,
        performDuplicateSearch: true,
      };
  
      const yextResponse = await fetch(
        `${CORS_PROXY_URL}https://api.yext.com/v2/accounts/me/scan?api_key=3ee6f111d1805581c89f75172032f5d0&v=20230726`,
        {
          method: 'POST',
          body: JSON.stringify(yextRequestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (yextResponse.ok) {
        const yextData = await yextResponse.json();
        const yextJobId = yextData.response.jobId; // Adjust the path to jobId if necessary
  
        // Store the jobId
        setJobId(yextJobId);
  
        // Introduce a 10-second delay before making the Yext GET requests
        setTimeout(async () => {
          try {
            // Create GET requests to Yext using the jobId
            const yextResponses = await Promise.all([
              fetch(
                `${CORS_PROXY_URL}https://api.yext.com/v2/accounts/me/scan/${yextJobId}/FACEBOOK,BING,MAPQUEST,YELP?api_key=3ee6f111d1805581c89f75172032f5d0&v=20230726`
              ),
              fetch(
                `${CORS_PROXY_URL}https://api.yext.com/v2/accounts/me/metrics/${yextJobId}?api_key=3ee6f111d1805581c89f75172032f5d0&v=20230726`
              ),
            ]);
  
            if (yextResponses.every((response) => response.ok)) {
              const [yextResponse1, yextResponse2] = yextResponses;
              const yextData1 = await yextResponse1.json();
              const yextData2 = await yextResponse2.json();
  
              // Set the Yext API responses
              setYextData({ response1: yextData1, response2: yextData2 });
            }
          } catch (error) {
            console.error('Yext API Error:', error);
          }
        }, 10000); // 10-second delay (10000 milliseconds)
      }
    } catch (error) {
      console.error('Yext API Error:', error);
    }
  };
  

  // Conditional rendering: Display the form or the ResultsPage based on the presence of API data
  return (
    <Container style={{ maxWidth: '100%'}} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {apiData ? (
        <ResultsPage data={apiData} yextData={yextData}/>
      ) : (
        <Paper elevation={3} sx={{ padding: '2rem', marginTop: '2rem', width: '100%' }}>
          <Typography variant="h4" gutterBottom align="center">
            Garrett's Scan Tool
          </Typography>
          <TextField
            label="Business Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          />
          <TextField
            label="Street Address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.streetAddress}
            onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
          />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="City"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="State"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Zip Code"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </Grid>
          </Grid>
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
          <TextField
            label="Website URL"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.websiteURL}
            onChange={(e) => setFormData({ ...formData, websiteURL: e.target.value })}
          />
          <Button variant="contained" color="primary" fullWidth sx={{ padding: '1rem', marginTop: '1rem', fontSize: '1.25rem' }} onClick={handleSubmit}>
            Submit
          </Button>
        </Paper>
      )}
    </Container>
  );
}

export default FormComponent;
