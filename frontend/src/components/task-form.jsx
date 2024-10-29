import {Alert, FormControl, IconButton, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import React, {useEffect, useState} from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";

const TaskForm = (props) => {
    const [projectList, setProjectList] = useState([]);
    const [url, setUrl] = useState("");
    const [task, setTask] = useState("");
    const [submit, setSubmit] = useState(false);

    useEffect(() => {
        // on init, set project list
        getProjectList()
        return () => {
            setProjectList([])
            setTask("")
            setUrl("")
            setSubmit(false)
        }
    }, []);


    const getProjectList = () => {
        axios.get(
            "http://192.168.0.248:8080/project/list/",
            {
                withCredentials: false,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then((response) => {
            console.log("List of projects", response.data)
            setProjectList([...response.data.projects])
        })
    }

    const handleProjectChange = (event) => {
        setUrl(event.target.value);
        setSubmit(false)
        // props.onSubmit({task, url: event.target.value})
    };

    const handleTaskSubmit = (event) => {
        event.preventDefault()

        if(!submit)
        {
            setSubmit(true)
            // console.log("TASK READY", "LOADING TRUE")
            props.onSubmit({task, url})
        }
    }


    const handleTaskChange = (e) => {
        setTask(e.target.value);
        setSubmit(false)
    }


    return <>
        {/*<h2 style={{margin: 0}}>Documented projects</h2>*/}

        <Alert severity="info" color="secondary" elevation={2} sx={{marginBottom: "1rem"}}>
            Select a project, type a task and it will be solved based on the docs found suitable.
        </Alert>
        <form onSubmit={handleTaskSubmit}>
            <Grid container>
                <Grid item xs={12}>
                    <FormControl fullWidth color="secondary" sx={{marginBottom: "1rem"}}>
                        <InputLabel id="demo-simple-select-label">Project</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={url ?? "Select a project"}
                            defaultValue="Select a project"
                            label="Project"
                            required
                            onChange={handleProjectChange}
                            disabled={props.loading}
                        >

                            {
                                projectList && projectList.map((item, index) => {
                                    return <MenuItem value={item.url} key={index}>{item.url}</MenuItem>
                                })
                            }

                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sx={{display: "flex", alignItems: 'center', gap: "1rem"}}>
                    <TextField
                        size="small"
                        onChange={handleTaskChange}
                        value={task}
                        placeholder="write your task here"
                        color="secondary"
                        sx={{flexGrow: 1}}
                        name="chat"
                        disabled={props.loading}
                    />
                    <IconButton type="submit" variant="contained" color="secondary" disabled={props.loading}>
                        <SendIcon/>
                    </IconButton>
                </Grid>
            </Grid>
        </form>
    </>
}

export default TaskForm;