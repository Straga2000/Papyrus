import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const Issues = () => {
    const issues = ['issue0', 'issue1', 'issue2'];
    const [showIssues, setShowIssues] = useState(true); // Controls the display of issues
    const [selectedIssue, setSelectedIssue] = useState(""); // Stores the selected issue name

    const handleIssueClick = (issue) => {
        setSelectedIssue(issue); // Set the selected issue name
        setShowIssues(false); // Hides issues list and shows "Hello World"
    };

    const handleBackClick = () => {
        setShowIssues(true); // Hides "Hello World" and shows issues list
    };

    return (
        <Grid 
            container
            spacing={0}
            alignItems="center"
            justifyContent="center" 
            style={{ minHeight: '100vh' }}
        >
            <Stack 
                alignItems='center'
                justifyContent="center"
                style={{ width: '100%', height: '100%' }}
            >
                {showIssues ? (
                    issues.map((issue, index) => (
                        <Button 
                            key={index} 
                            variant="outlined" 
                            style={{ width: '700px', margin: '10px' }}
                            onClick={() => handleIssueClick(issue)} // Pass the issue name to the click handler
                        >
                            {issue}
                        </Button>
                    ))
                ) : (
                    <div>
                        <Typography variant="h5" style={{ marginBottom: '20px' }}>{selectedIssue}</Typography>  {/* Display the selected issue name */}
                        <div>Hello World</div>
                        <Button 
                            variant="outlined" 
                            style={{ marginTop: '20px' }}
                            onClick={handleBackClick}
                        >
                            Back
                        </Button>
                    </div>
                )}
            </Stack>
        </Grid>
    );
};

export default Issues;
