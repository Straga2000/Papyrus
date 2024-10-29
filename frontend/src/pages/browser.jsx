import {useParams, useSearchParams} from "react-router-dom";
import axios from "axios";
import {useEffect, useRef, useState} from "react";
import ProjectExplorer from "../components/project-explorer";
import FileExplorer from "../components/file-explorer";
import {Checkbox, Chip, FormControlLabel} from "@mui/material";
import Grid from "@mui/material/Grid";
import ExtensionForm from "../components/extension-form";
import Paper from "@mui/material/Paper";
import LinearProgress from '@mui/material/LinearProgress';


const Browser = () => {
    let [searchParams, setSearchParams] = useSearchParams();
    const SERVER_URL = process.env.REACT_APP_SERVER_URL;
    const [loading, setLoading] = useState(true);
    const [projectTree, setProjectTree] = useState(null);
    const [projectMeta, setProjectMeta] = useState(null);
    const [projectFiles, setProjectFiles] = useState(null);
    const [fileFormats, setFileFormats] = useState(null);
    const [fileDocs, setFileDocs] = useState(null);
    const [fileDocsNumber, setFileDocsNumber] = useState(0);
    // const [fileGenerator, setFileGenerator] = useState(null);

    let socket = useRef(new WebSocket("ws://localhost:8001"))

    useEffect(() => {
        // on init, make websocket
        socket.current.addEventListener("open", () => {
            console.log("Websocket open")
            socket.current.send(JSON.stringify({"type": "heartbeat"}))
        })
        socket.current.addEventListener("message", ({data}) => {
            console.log("RAW RAW STUFF", data)
            const event = JSON.parse(data);
            console.log("NEW EVENT", event)
            switch (event.type) {
                // case "dummy":
                //     socket.send(JSON.stringify({type: "dummy"}))
                //     break;
                case "file_formats":
                    console.log("Response from websocket on file format", event)
                    setFileFormats({
                        id: event.id,
                        result: null
                    })
                    socket.current.send(JSON.stringify({
                        type: "file_formats:res",
                        id: event.id
                    }))

                    break;
                    // send res
                case "file_formats:res":
                    console.log("The event will be set", event)
                    if(event.status === false)
                        setTimeout(() => {
                            socket.current.send(JSON.stringify({
                                type: "file_formats:res",
                                id: event.id
                            }))
                        }, 1000)
                    else {
                        setFileFormats({...fileFormats, result: event.result.data})
                        console.log("got the file formats", event.result)
                        socket.current.send(JSON.stringify({
                            "type": "heartbeat"
                        }))
                    }

                    break;
                case "file_docs":
                    // make the file docs one by one
                    console.log("The file documentation has started", event)
                    socket.current.send(JSON.stringify({
                        type: "file_docs:res",
                        id: event.id
                    }))
                    break;
                case "file_docs:res":
                    console.log("got the files with documentation", event)
                    if(event.status === false) {
                        // set the percentage in the file docs for update
                        setTimeout(() => {
                            socket.current.send(JSON.stringify({
                                type: "file_docs:res",
                                id: event.id
                            }))
                            setFileDocs(event)
                        }, 1000)
                    }
                    else {
                        console.log("This is the documentation data", event)
                        setFileDocs(event)
                        // setFileDocs([...fileDocs, event])
                        // if(nextFileGen.done === false) {
                        //     socket.current.send(JSON.stringify({
                        //         "type": "file_docs",
                        //         "args": [nextFileGen.value]
                        //     }))
                        // }
                    }
                    break;
                default:
                    // setTimeout(() => {
                    //     socket.current.send(JSON.stringify({
                    //         "type": "heartbeat"
                    //     }))
                    // }, 000)
                    console.log("Event goes on default", event)
                    break;

                // case "fib:res":
                // console.log("Enter fib res")
                // console.log("This is the fib id", fib_id)
                //
                // // check status
                // const result = event.result
                // const status = event.status
                //
                // if(status === false)
                //     websocket.send(JSON.stringify({"type": "fib:res", "id": fib_id}))
                // else
                // {
                //     console.log(result)
                //     fibRes.innerText = fibRes.innerText + " " + result.data
                // }
                // break;


            }
        })
        socket.current.addEventListener("close", () => {
            console.log("Socket already closed")
        })


        getProject(searchParams.get("url"))
    }, []);

    useEffect(() => {

    }, [projectFiles])

    const getProject = (url) => {
        setLoading(true)
        axios.post(
            SERVER_URL + "project/structure/",
            { url: url },
            {
                withCredentials: false,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                }
            }
        ).then((response) => {
            console.log("This is the structure", response.data)
            setProjectTree(response.data.tree)
            setProjectMeta({
                author: response.data.author,
                name: response.data.name,
            })
            setProjectFiles({...response.data.files})

            console.log("Received files; send socket msg", response.data.files)
            // TODO better init for websocket
            socket.current.send(JSON.stringify({
                type: "file_formats",
                kwargs: {
                    files: response.data.files
                }
            }))
            // setCurrentTree({...response.data.project})
            // setCurrentName(response.data.name)
            // setLoaded(true)
            // setLoading(false)
            // on submit, we should wait for the response and load the component for project explorer
        })

        return () => {
            // setCurrentTree(false)
        }
    }

    const getFileDataRecursive = (tree) => {

    }

    const getDocumentation = () => {
        // files with formats first
        axios.post(
            SERVER_URL + "project/file2format/",
            { url: searchParams.get("url") },
            {
                withCredentials: false,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                }
            }
        ).then((response) => {
            // update files with format
            console.log("These are the original file formats", fileFormats)
            const filesWithFormat = []

            Object.keys(response.data.files).map(key => {
                filesWithFormat.push({
                    url: response.data.files[key].url,
                    ...fileFormats.result[response.data.files[key].format],
                })
            })
            console.log("Files with format", filesWithFormat)
            // make socket sends for all files, update the files as the content comes

            // const generatorFiles = function* (files) {
            //     for(const file of files) {
            //         yield file;
            //     }
            // }
            //
            // const fileGen = generatorFiles(filesWithFormat);
            // setFileGenerator(fileGen)
            //
            // const firstFileGen = fileGen.next()
            // console.log("first file gen element", firstFileGen)

            socket.current.send(JSON.stringify({
                "type": "file_docs",
                "args": filesWithFormat
            }))
        })

        // socket.send(JSON.stringify({
        //     type: "file_docs",
        //     args: []
        // }))

        // here should be a call for a group task;
        // when the task is finished, the leafs of the file tree should be accessible
    }


    // useEffect(() => {
    //     if(socketStatus && !!projectFiles)
    //     {
    //
    //     }
    // }, [socketStatus, projectFiles]);

    return <>
        <Grid container xs={12} p={2}>
            {
                !!projectTree && <Grid item xs={8} px={1}>
                    <FileExplorer tree={projectTree} meta={projectMeta} files={projectFiles}/>
                    {!!fileDocs && <LinearProgress variant="determinate" value={fileDocs.percent}/>}
                </Grid>
            }
            {
                !!fileFormats && <Grid item xs={4} px={1}>
                    <Paper elevation={2}>
                        <Grid sx={{maxHeight: "450px", overflowY: "scroll", msOverflowStyle: "none"}} style={{"::-webkit-scrollbar": "none"}} p={1}>
                            <ExtensionForm formats={fileFormats} getDocumentation={getDocumentation}/>
                        </Grid>
                    </Paper>
                </Grid>
            }
        </Grid>
    </>
}

export default Browser;