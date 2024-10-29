import React, { useState, setState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import axios from "axios";
import Input from '@mui/material/Input';
import Documentation from "./documentation";
import ProjectExplorer from "./project-explorer";
import {LinearProgress} from "@mui/material";


const Projects = () => {

    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState("");
    const [currentTree, setCurrentTree] = useState(null);
    const [currentName, setCurrentName] = useState("");




    const handleSubmit = (e) => {
        setLoading(true)
        e.preventDefault();
        axios.post(
            "http://192.168.0.248:8080/project/",
            { url: url },
            {
                withCredentials: false,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then((response) => {
            console.log(response.data)
            setCurrentTree({...response.data.project})
            setCurrentName(response.data.name)
            setLoaded(true)
            setLoading(false)
            // on submit, we should waith for the response and load the component for project explorer
        })

        return () => {
            setCurrentTree(false)
        }

    };

    const handleInput = (e) => {
        setUrl(e.target.value);
    };

    return (
        <Grid container sx={{display: "flex", alignItems: "center", flexDirection: "column", width: "100%"}}>
            {/*<Documentation></Documentation>*/}
            <Grid item style={{ width: '100%' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Input
                        onChange={handleInput}
                        value={url}
                        placeholder="Enter GitHub repo URL"
                        style={{ width: '60%', margin: '10px', fontSize: '1.2rem' }} disabled={loading}
                    />
                    <Button type="submit" variant="contained" style={{ padding: '10px 36px' }} disabled={loading}>Submit Project</Button>
                </form>
            </Grid>
            {
                loading &&
                <Grid item xs={12}>
                    <Grid container xs={8}>
                        <Grid item xs={12}>
                            <p>The project is read, please wait...</p>
                        </Grid>
                        <Grid item xs={12}>
                            <LinearProgress />
                        </Grid>
                    </Grid>
                </Grid>

            }
            {
                loaded &&
                <Grid xs={10} ms={8} md={6} sx={{width: "100%"}}>
                    {!!currentTree && <ProjectExplorer tree={currentTree} name={currentName}/>}
                </Grid>
            }
        </Grid>
    );
};

export default Projects;
