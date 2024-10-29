import Input from "@mui/material/Input";
import {Alert, Card, CardActions, CardContent, Divider, IconButton, Skeleton, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import React, {useEffect, useState} from "react";
import SendIcon from '@mui/icons-material/Send';
import Paper from "@mui/material/Paper";
import Editor from "@monaco-editor/react";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import axios from "axios";
import Grid from "@mui/material/Grid";



const TaskSolver = (props) => {
    const [url, setUrl] = useState(null);
    const [task, setTask] = useState(null);

    const [taskContinue, setTaskContinue] = useState(false);
    const [taskSteps, setTaskSteps] = useState("");
    const [solution, setSolution] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasContent, setHasContent] = useState(false);

    useEffect(() => {

        setUrl(props.projectURL)
        setTask(props.task)
        console.log("INIT with", props.projectURL, props.task)

        return () => {
            setUrl(null)
            setTask(null)
            setTaskContinue(false)
            setSolution(null)
            setLoading(false)
        }
    }, [props.projectURL, props.task]);

    useEffect(() => {
        if(props.projectURL && props.task)
        {
            console.log("SET with", url, task)
            setTaskSteps("")
            setSolution("")
            setLoading(true)
            setHasContent(true)
            resolveTaskParts(url, task).then(r => {
                console.log("Task were resolved")
                setLoading(false)
                props.onFinish()
            })
        }
    }, [url, task])


    async function* getIterableStream(body) {
        const reader = body.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { value, done } = await reader.read()
            if (done) {
                break
            }
            const decodedChunk = decoder.decode(value, { stream: true })
            yield JSON.parse(decodedChunk)
        }
    }

    const resolveTask = async (url, task) => {
        // setLoading(true)
        const response = await fetch("http://192.168.0.248:8080/task/resolve/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({project: url, task}),
        });

        console.log(response)
        if (response.status !== 200) throw new Error(response.status.toString())
        if (!response.body) throw new Error('Response body does not exist')
        return getIterableStream(response.body)
    }



    const resolveTaskParts = async (url, task) => {
        const stream = await resolveTask(url, task)
        for await (const chunk of stream) {
            if(chunk.continue === false && taskContinue === false) {
                setSolution(chunk.answer)
                console.log("Solution was already found", chunk.answer)
            }

            if(chunk.continue === true && taskContinue === false) {
                setTaskSteps(chunk.answer)
                setTaskContinue(true)
                console.log("Intermidate response", chunk.answer)
            }

            if(chunk.continue === false && taskContinue === true) {
                setSolution(chunk.answer)
                console.log("Final response")
            }
        }
        // setUrl("")
        // setTask("")
        // setTaskSteps("")
        // setSolution({})
        // setTaskContinue(false)
    }

    const postIssue = () => {
        const response = axios.post(
            "http://192.168.0.248:8080/task/send/",
            {
                url: url,
                content: {
                    task,
                    plan: taskSteps,
                    solution
                }},
            {
                withCredentials: false,
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                console.log(response.data)
        })
    }

    return <> {
        hasContent &&
        <Card sx={{padding: "1.5rem", marginTop: "2rem"}} elevation={2}>
            {/*TODO make cursor animation on waiting the response*/}
            {/*https://www.amitmerchant.com/simple-blinking-cursor-animation-using-css/*/}
            {
                <div style={{marginBottom: "1.5rem"}}>
                    <h1 style={{marginTop: 0, marginBottom: "0.5rem"}}>Task</h1>
                    {
                        !!task ?
                            <p style={{margin: 0, whiteSpace: "pre-line"}}>"{task}"</p>:
                            <Skeleton animation="wave" variant="rectangular"/>
                    }
                </div>
            }
            {
                !taskSteps && loading &&
                <div style={{marginBottom: "1.5rem"}}>
                    <h1 style={{marginTop: 0, marginBottom: "0.5rem"}}>Task execution plan</h1>
                    <Skeleton animation="wave" variant="rectangular" sx={{marginBottom: "0.5rem"}}/>
                    <Skeleton animation="wave" variant="rectangular" sx={{marginBottom: "0.5rem"}}/>
                    <Skeleton animation="wave" variant="rectangular" sx={{marginBottom: "0.5rem"}}/>
                </div>
            }
            {
                !!taskSteps &&
                <div style={{marginBottom: "1.5rem"}}>
                    <h1 style={{marginTop: 0, marginBottom: "0.5rem"}}>Task execution plan</h1>
                    <p style={{margin: 0, whiteSpace: "pre-line"}}>{taskSteps}</p>
                </div>
            }
            {
                !solution && loading &&
                <CardContent sx={{paddingX: 0}}>
                    <h1 style={{marginTop: 0, marginBottom: "0.5rem"}}>Solution</h1>
                    <Skeleton animation="wave" variant="rectangular" sx={{marginBottom: "0.5rem"}} height="300px"/>
                </CardContent>
            }
            {
                !!solution &&
                <CardContent sx={{paddingX: 0}}>
                    <h1 style={{marginTop: 0, marginBottom: "0.5rem"}}>Solution</h1>
                        {
                            solution?.text && <p style={{margin: 0, whiteSpace: "pre-line"}}>{solution.text}</p>
                        }
                        {
                            solution?.code && solution.code.length > 0 &&
                            solution.code.map((item, index) => {
                                return <>
                                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                        <h3>Snippet #{index + 1}</h3>
                                        <Button color="secondary"
                                                variant="outlined"
                                                startIcon={<ContentPasteIcon/>}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.content);
                                                }}
                                        >Copy</Button>
                                    </div>
                                    <Editor
                                        height="300px"
                                        language={item.language}
                                        theme="vs-dark"
                                        value={item.content}
                                        options={{
                                            minimap: {enabled: false},
                                            automaticLayout: true,
                                            scrollBeyondLastLine: false,
                                            trimAutoWhitespace: true
                                        }}
                                    />
                                </>})
                        }
                </CardContent>
            }
            {
                !!solution && !!taskSteps &&
                <>
                    <CardActions sx={{padding: 0, marginTop: "0.5rem", marginBottom: 0, float: "right"}}>
                        <Button variant="contained" color="secondary">Save solution</Button>
                        <Button variant="contained" color="secondary" onClick={() => {postIssue()}}>Send as issue</Button>
                    </CardActions>
                </>
            }
        </Card>
    }
    </>
}

export default TaskSolver;