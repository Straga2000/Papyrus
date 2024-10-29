import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Projects from '../components/projects';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";
import {
    Alert,
    AlertTitle,
    Avatar,
    Breadcrumbs,
    Chip,
    IconButton,
    LinearProgress,
    Link,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    useTheme
} from "@mui/material";
import Input from "@mui/material/Input";
import React, {useEffect, useState} from "react";
import axios from "axios";
import ProjectExplorer from "../components/project-explorer";
import FolderIcon from "@mui/icons-material/Folder";
import {ChevronRight} from "@mui/icons-material";
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import InfoIcon from '@mui/icons-material/Info';
import env from "react-dotenv";
import {useNavigate} from "react-router-dom";

function DeleteIcon() {
    return null;
}

const Home = () => {
    const theme = useTheme();

    const [projectList, setProjectList] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState("");
    const SERVER_URL = process.env.REACT_APP_SERVER_URL;
    const navigate = useNavigate()

    console.log(SERVER_URL)

    useEffect(() => {
        if(projectList.length === 0)
        {
            getProjectList()
        }
    }, [setProjectList]);


    const getProjectList = () => {
        axios.get(
            SERVER_URL + "project/list/",
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

    const goToProjectBrowser = (url) => {
        navigate("/browser?url=" + url);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // getProject(url)
        goToProjectBrowser(url)
    };

    const handleInput = (e) => {
        setUrl(e.target.value);
    };

    const handleProjectExit = () => {
        // setCurrentTree(null)
        setLoading(false)
        setLoaded(false)
        getProjectList()
    }

    const handleBreadcrumbs = () => {
    //     here we add the code for the update of the breadcrumbs
    }

    // the homepage should contain a list of projects and an island that let you upload a project
    return (
        <Grid container spacing={4} p={2}>
            <Grid item xs={12} sx={{display: "flex", justifyContent: "center"}}>
                <Typography variant="h1" sx={{textAlign: "center"}}>Welcome to <span style={{color: theme.palette.secondary.dark}}>Papyrus</span></Typography>
                {/*<Typography variant="h1" color="secondary"></Typography>*/}
            </Grid>
            <Grid item xs={12} container gap={1}>
                <Grid item xs={12}>
                    <Paper elevation={1} sx={{padding: "1rem"}}>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Link underline="hover" color="inherit" href="/">
                                Home
                            </Link>
                        </Breadcrumbs>
                    </Paper>
                </Grid>
                {/*<Grid item xs={2}>*/}
                {/*    /!* here it should be a list of favourite projects for example*!/*/}
                {/*    <Paper elevation={4} sx={{padding: "1rem"}}>*/}
                {/*        <p>Hellooooooooooo</p>*/}
                {/*    </Paper>*/}
                {/*</Grid>*/}
                <Grid item xs>
                    <Grid item xs={12} m="auto">
                        <Paper elevation={1} sx={{padding: "1rem"}}>
                            {projectList.length === 0 && !loading &&
                                <Grid xs={12} sx={{display: "flex"}} gap={1} mb={1}>
                                    <InfoIcon color="secondary"/>
                                    <p style={{margin: 0}}>The list of uploaded projects will appear
                                        here. Add a github repository link to start the documentation process.</p>
                                </Grid>
                                // <Alert severity="info" color="secondary" variant="outlined"></Alert>
                            }
                            {!loaded && <>


                                {/*add here list of projects or text if the list is empty */}
                                {

                                    <>
                                        <form onSubmit={handleSubmit}
                                              style={{display: 'flex', alignItems: 'center', gap: "1rem", marginBottom: "1rem"}}>
                                            <TextField
                                                required
                                                label="Project URL"
                                                size="small"
                                                defaultValue="Hello World"
                                                onChange={handleInput}
                                                value={url}
                                                placeholder="https://github.com/author/project/tree/master"
                                                color="secondary"
                                                sx={{flexGrow: 1}} disabled={loading}
                                            />
                                            <Button type="submit" variant="contained" disabled={loading} color="secondary">Add
                                                new
                                                project</Button>
                                        </form>
                                        {
                                            loading && <>
                                                <p style={{marginBottom: "0.5rem", marginTop: 0}}>The project is read, please
                                                    wait...</p>
                                                <LinearProgress color="secondary"/>
                                            </>
                                        }
                                        <TableContainer component={Paper} elevation={3}>
                                            <Table aria-label="simple table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>
                                                            <h3 style={{"margin": 0}}>
                                                                Author
                                                            </h3>
                                                        </TableCell>
                                                        <TableCell>
                                                            <h3 style={{"margin": 0}}>
                                                                Project
                                                            </h3>
                                                        </TableCell>
                                                        <TableCell align={"right"}>
                                                            {/*<ChevronRight color="secondary"/>*/}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {projectList.map((item) => <TableRow key={item.url}>
                                                            <TableCell sx={{border: 0}}>{item.author}</TableCell>
                                                            <TableCell sx={{border: 0}}>
                                                                <Typography component="a" color="secondary" href={item.url}>
                                                                    {item.name}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{border: 0}} align="right">
                                                                <IconButton onClick={() => {
                                                                    console.log(item.url)
                                                                    goToProjectBrowser(item.url)
                                                                }} disabled={loading}>
                                                                    <ChevronRight/>
                                                                </IconButton>
                                                            </TableCell>
                                                    </TableRow>)}
                                                </TableBody>
                                                {/*<TableBody>*/}
                                                {/*    {rows.map((row) => (*/}
                                                {/*        <TableRow*/}
                                                {/*            key={row.name}*/}
                                                {/*            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}*/}
                                                {/*        >*/}
                                                {/*            <TableCell component="th" scope="row">*/}
                                                {/*                {row.name}*/}
                                                {/*            </TableCell>*/}
                                                {/*            <TableCell align="right">{row.calories}</TableCell>*/}
                                                {/*            <TableCell align="right">{row.fat}</TableCell>*/}
                                                {/*            <TableCell align="right">{row.carbs}</TableCell>*/}
                                                {/*            <TableCell align="right">{row.protein}</TableCell>*/}
                                                {/*        </TableRow>*/}
                                                {/*    ))}*/}
                                                {/*</TableBody>*/}
                                            </Table>
                                        </TableContainer>


                                        {/*<List>*/}
                                        {/*    {*/}
                                        {/*        projectList && projectList.map((item, index) => {*/}
                                        {/*            return <ListItem disablePadding*/}
                                        {/*            >*/}
                                        {/*                /!*<ListItemIcon>*!/*/}
                                        {/*                /!*    <ImportContactsIcon/>*!/*/}
                                        {/*                /!*</ListItemIcon>*!/*/}
                                        {/*                <ListItemText*/}
                                        {/*                    primary={*/}
                                        {/*                        <span style={{*/}
                                        {/*                            display: "flex",*/}
                                        {/*                            alignItems: "center",*/}
                                        {/*                            gap: "0.5rem"*/}
                                        {/*                        }}>*/}
                                        {/*                        <Chip label={item.name} sx={{fontWeight: "bold"}}*/}
                                        {/*                              color="secondary" component="a" href={item.url}*/}
                                        {/*                              clickable disabled={loading}/>*/}
                                        {/*                        <p>{" by @" + item.author}</p>*/}
                                        {/*                    </span>*/}
                                        {/*                    }*/}
                                        {/*                />*/}
                                        {/*                <IconButton onClick={() => {*/}
                                        {/*                    console.log(item.url)*/}
                                        {/*                    goToProjectBrowser(item.url)*/}
                                        {/*                }} disabled={loading}>*/}
                                        {/*                    <ChevronRight/>*/}
                                        {/*                </IconButton>*/}
                                        {/*            </ListItem>*/}
                                        {/*        })*/}
                                        {/*    }*/}
                                        {/*</List>*/}
                                    </>
                                }

                            </>}
                        </Paper>

                        {/*{!!currentTree &&*/}
                        {/*    <ProjectExplorer tree={currentTree} name={currentName} onExit={handleProjectExit}/>}*/}
                    </Grid>
                </Grid>
            </Grid>


            {/*<Projects></Projects>*/}
        </Grid>)

}

export default Home;