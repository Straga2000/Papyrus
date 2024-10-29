import {useNavigate, useSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axios from "axios";
import Paper from "@mui/material/Paper";
import {
    Alert,
    AlertTitle,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Tooltip
} from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Grid";
import CalculateSharpIcon from "@mui/icons-material/CalculateSharp";
import AccordionDetails from "@mui/material/AccordionDetails";
import Accordion from "@mui/material/Accordion";
import ViewerBlock from "./viewer-block";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import ReplayIcon from '@mui/icons-material/Replay';
import Editor from "@monaco-editor/react";
import Markdown from 'react-markdown'
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";


const Viewer = () => {
    let [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const SERVER_URL = process.env.REACT_APP_SERVER_URL;

    useEffect(() => {
        getFileDocumentation(false)
        console.log("Init use effect")
    }, []);

    useEffect(() => {

    }, [setFile]);

    const getFileDocumentation = (regenerate) => {
        const url = searchParams.get("url");
        const sentData = {
            file: file ? file: {url: url},
            regenerate: regenerate
        }

        axios.post(
            SERVER_URL + "project/documentation/",
            sentData,
            {
                withCredentials: false,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                }
            }
        ).then((response) => {
            console.log("This is the doc", response)
            if(response.data.status) {
                setFile(response.data.documentation)
                console.log("status was true")
            }

        })
    }

    const createDocumentation = (doc) => {
        try {
            return doc.map(elem => {
                return createDocumentationBlock(elem)
            })
        } catch (e) {
            console.log(e)
            return null;
        }


    }

    const createDocumentationBlock = (doc) => {
        console.log(doc)
        return <ViewerBlock doc={doc} elevation={parseInt(searchParams.get("elevation")) ?? 1}/>
    }

    return <>
        <Grid container p={2}>
            {/*<Grid item xs={12}>*/}
            {/*    <p>{file && JSON.stringify(file)}</p>*/}
            {/*</Grid>*/}
            {/*<Grid item xs={12}>*/}

            {/*</Grid>*/}
            <Grid item xs={12}>
                <Paper sx={{padding: 2}} elevation={1}>
                    <Grid container sx={{display: "flex", alignItems: "center"}}>
                        <Grid item sx={{flexGrow: 1}}>
                            <Grid container gap={0.5} mb={1}>
                                <IconButton aria-label="back" onClick={() => navigate(-1)} sx={{alignSelf: "center"}}>
                                    <ChevronLeftIcon />
                                </IconButton>
                                <Typography gutterBottom variant="h3" component="div" mb="unset">
                                    {searchParams.get("name")}
                                </Typography>
                            </Grid>

                            <Grid container gap={0.5}>
                                {file?.code && <Chip label={file.code ? "code" : "no code"} color="secondary"/>}
                                {file?.type && <Chip label={file.type} color="secondary"/>}
                                {file?.language && <Chip label={file.language} color="secondary"/>}
                            </Grid>
                        </Grid>

                        <Grid item gap={0.5} sx={{display: "flex", flexDirection: "column"}}>
                            <Button onClick={() => {getFileDocumentation(true)}}
                                    size="small"
                                    color="secondary"
                                    startIcon={<ReplayIcon/>}
                                    variant="contained"
                            >Regenerate</Button>
                            {file &&
                                <Button onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(file.content))}}
                                        startIcon={<ContentCopyIcon/>}
                                        size="small"
                                        color="secondary"
                                        variant="contained"
                                >Copy</Button>}
                        </Grid>
                    </Grid>
                </Paper>
                {/*<Alert severity="info" color="secondary" icon={false} sx={{width: "100%"}}>*/}
                {/*    /!*<AlertTitle>{file.language}</AlertTitle>*!/*/}
                {/*    /!*<Grid container>*!/*/}

                {/*    /!*</Grid>*!/*/}
                {/*    */}

                {/*</Alert>*/}
            </Grid>
            <Grid item xs={12} mt={2}>
                {!!file && file.code && createDocumentation(file.content)}
                {!! file && !file.code && file.type === "text" && <Paper elevation={2} sx={{py: 1, px: 2}}>
                {/*<Typography gutterBottom variant="h6" component="div" fontWeight="bold" mb={2}>*/}
                {/*    File summary*/}
                {/*</Typography>*/}
                <Markdown>{file.content}</Markdown>

                    {/*<Editor*/}
                {/*    height="500px"*/}
                {/*    language="markdown"*/}
                {/*    theme="vs-dark"*/}
                {/*    value={file.content}*/}
                {/*    options={{*/}
                {/*        minimap: {enabled: false},*/}
                {/*        automaticLayout: true,*/}
                {/*        scrollBeyondLastLine: false,*/}
                {/*        trimAutoWhitespace: true,*/}
                {/*        wordWrap: "on"*/}
                {/*    }}*/}
                {/*/>*/}


                {/*<Typography variant="p" component="div">*/}
                {/*    {file.content}*/}
                {/*</Typography>*/}
                </Paper>}
                {
                    !!file && !file.code && !file?.type && <Paper elevation={2} sx={{py: 1, px: 2}}>
                        <Grid container>
                            <Grid item xs={6}>
                                <Typography gutterBottom variant="h6" component="div" fontWeight="bold" mb={2}>
                                    Image description
                                </Typography>
                                <Typography variant="p" component="div" mb={2} textAlign="justify">
                                    {file.content}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sx={{display: "flex", justifyContent: "center"}}>
                                <img src={file.url} alt="documented image"/>
                            </Grid>
                        </Grid>
                    </Paper>
                }
            </Grid>
        </Grid>

        {/*<Card sx={{width: "100%"}} elevation={2}>*/}
        {/*    <CardContent>*/}

        {/*        /!*<Typography variant="body2" sx={{ color: 'text.secondary' }}>*!/*/}
        {/*        /!*    Lizards are a widespread group of squamate reptiles, with over 6,000*!/*/}
        {/*        /!*    species, ranging across all continents except Antarctica*!/*/}
        {/*        /!*</Typography>*!/*/}
        {/*    </CardContent>*/}
        {/*    <CardActions>*/}
        {/*        <Button size="small" color="primary">*/}
        {/*            Share*/}
        {/*        </Button>*/}
        {/*    </CardActions>*/}
        {/*</Card>*/}
    </>
}

export default Viewer;