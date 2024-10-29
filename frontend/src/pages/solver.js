import React, {useEffect, useState} from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import {
    Alert,
    Chip, FormControl,
    IconButton, InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemText, MenuItem, Select,
    TextField,
    useTheme
} from "@mui/material";
import {ChevronRight} from "@mui/icons-material";
import Button from "@mui/material/Button";
import ProjectExplorer from "../components/project-explorer";
import TaskSolver from "../components/chat";
import SendIcon from "@mui/icons-material/Send";
import TaskForm from "../components/task-form";

const Solver = () => {
    const theme = useTheme();
    const [task, setTask] = useState("");
    const [url, setUrl] = useState("");
    const [resolving, setResolving] = useState(false);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        return () => {
            setTask("")
            setUrl("")
            setResolving(false)
        }
    }, [])

    const handleTaskSubmit = (meta) => {
        setTask(meta.task)
        setUrl(meta.url)
        setResolving(true)
        setFinished(false)
        console.log("Received from submitter", meta.task, meta.url)
    }

    const handleTaskFinished = () => {
        setFinished(true)
        setResolving(false)
    }


    return (
        <Grid container spacing={2} p={2} gap={2}>
            <Grid item xs={12} sx={{display: "flex", justifyContent: "center"}}>
                <Typography variant="h1" sx={{textAlign: "center"}}>Welcome to <span style={{color: theme.palette.secondary.dark}}>CodeX</span></Typography>
                {/*<Typography variant="h1" color="secondary"></Typography>*/}
            </Grid>
            <Grid item xs={12}>
                <Grid item xs={8} m="auto">
                    <Paper elevation={1} sx={{padding: "1rem"}}>
                        {/*add here list of projects or text if the list is empty */}
                        <TaskForm loading={resolving} onSubmit={handleTaskSubmit}/>
                    </Paper>
                    {
                        <TaskSolver
                            projectURL={url}
                            task={task}
                            onFinish={handleTaskFinished}
                        />
                    }
                </Grid>

            </Grid>
        </Grid>)
}

export default Solver;