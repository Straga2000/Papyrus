import {useEffect, useState} from "react";
import {Card, CardActions, CardContent, Chip, Divider, Icon, Tooltip} from "@mui/material";
import Grid from "@mui/material/Grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CalculateSharpIcon from '@mui/icons-material/CalculateSharp';
import AutoAwesomeMosaicSharpIcon from '@mui/icons-material/AutoAwesomeMosaicSharp';
import CodeSharpIcon from '@mui/icons-material/CodeSharp';

const Documentation = (props) => {

    const [documentation, setDocumentation] = useState(props.docs);
    // useEffect(() => {
    //     const data = JSON.parse("{\"main.py\": {\"language\": \"python\", \"name\": \"main.py\", \"documentation\": {\"function\": [{\"name\": \"sendimage\", \"description\": \"Handles the event when an image is sent\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the image information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"handle_message\", \"description\": \"Handles the event when a message is sent\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the message information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"handle_createWorkspace\", \"description\": \"Handles the event when a new workspace is created\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the workspace information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"handle_createChannel\", \"description\": \"Handles the event when a new channel is created\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the channel information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"joinRoom\", \"description\": \"Handles the event when a user joins a room\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the room information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"sendChannels\", \"description\": \"Handles the event when the channels are sent\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the workspace information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"get_workspaceName\", \"description\": \"Handles the event when the workspace name is requested\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the workspace information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"chat_msg\", \"description\": \"Handles the event when a chat message is sent\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the chat message information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"sendMessages\", \"description\": \"Handles the event when the messages are sent\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the message information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"addWorkspace\", \"description\": \"Adds a user to a workspace\", \"parameters\": [{\"name\": \"data\", \"description\": \"Data containing the workspace and user information\", \"type\": \"dict\"}], \"return\": \"None\"}, {\"name\": \"random_string\", \"description\": \"Generates a random string\", \"parameters\": [{\"name\": \"letter_count\", \"description\": \"Number of letters in the string\", \"type\": \"int\"}, {\"name\": \"digit_count\", \"description\": \"Number of digits in the string\", \"type\": \"int\"}], \"return\": \"str\"}, {\"name\": \"not_found\", \"description\": \"Handles the 404 error\", \"parameters\": [{\"name\": \"e\", \"description\": \"Error object\", \"type\": \"error\"}], \"return\": \"None\"}]}}, \"readme.md\": {\"language\": \"markdown\", \"name\": \"readme.md\", \"documentation\": null}, \"website\": {\"__init__.py\": {\"language\": \"python\", \"name\": \"__init__.py\", \"documentation\": {\"class\": [{\"name\": \"User\", \"description\": \"Represents a user in the system\", \"function\": [{\"name\": \"set_password\", \"description\": \"Sets the password for the user\", \"parameters\": [{\"name\": \"password\", \"description\": \"The password to be set\", \"type\": \"str\"}], \"return\": \"None\"}, {\"name\": \"check_password\", \"description\": \"Checks if the provided password matches the user's password\", \"parameters\": [{\"name\": \"password\", \"description\": \"The password to be checked\", \"type\": \"str\"}], \"return\": \"bool\"}, {\"name\": \"getJsonData\", \"description\": \"Returns user data in JSON format\", \"return\": \"dict\"}]}, {\"name\": \"Workspace\", \"description\": \"Represents a workspace in the system\", \"function\": [{\"name\": \"getJsonData\", \"description\": \"Returns workspace data in JSON format\", \"return\": \"dict\"}]}, {\"name\": \"Channel\", \"description\": \"Represents a channel in the system\", \"function\": [{\"name\": \"getJsonData\", \"description\": \"Returns channel data in JSON format\", \"return\": \"dict\"}]}, {\"name\": \"Chats\", \"description\": \"Represents a chat message in the system\", \"function\": [{\"name\": \"getJsonData\", \"description\": \"Returns chat message data in JSON format\", \"return\": \"dict\"}]}], \"function\": [{\"name\": \"create_app\", \"description\": \"Creates and configures the Flask app\", \"return\": \"Flask app\"}]}}, \"auth.py\": {\"language\": \"python\", \"name\": \"auth.py\", \"documentation\": {\"function\": [{\"name\": \"signup_post\", \"description\": \"Handles the signup form submission and creates a new user in the database\", \"parameters\": [{\"name\": \"request\", \"description\": \"The request object containing the form data\", \"type\": \"flask.request\"}], \"return\": \"None\"}, {\"name\": \"login_post\", \"description\": \"Handles the login form submission and authenticates the user\", \"parameters\": [{\"name\": \"request\", \"description\": \"The request object containing the form data\", \"type\": \"flask.request\"}], \"return\": \"None\"}, {\"name\": \"logout\", \"description\": \"Logs out the user and clears the session\", \"return\": \"None\"}]}}, \"static\": {\"css\": {\"chat.css\": {\"language\": \"css\", \"name\": \"chat.css\", \"documentation\": null}, \"landingpage.css\": {\"language\": \"css\", \"name\": \"landingpage.css\", \"documentation\": null}, \"nav.css\": {\"language\": \"css\", \"name\": \"nav.css\", \"documentation\": null}, \"style.css\": {\"language\": \"css\", \"name\": \"style.css\", \"documentation\": null}}, \"js\": {\"app.js\": {\"language\": \"javascript\", \"name\": \"app.js\", \"documentation\": null}, \"chat.js\": {\"language\": \"javascript\", \"name\": \"chat.js\", \"documentation\": null}, \"landingpage.js\": {\"language\": \"javascript\", \"name\": \"landingpage.js\", \"documentation\": null}, \"nav.js\": {\"language\": \"javascript\", \"name\": \"nav.js\", \"documentation\": null}, \"socketIO.js\": {\"language\": \"javascript\", \"name\": \"socketIO.js\", \"documentation\": null}}}, \"templates\": {\"auth\": {\"login-register.html\": {\"language\": \"html\", \"name\": \"login-register.html\", \"documentation\": null}}, \"views\": {\"404.html\": {\"language\": \"html\", \"name\": \"404.html\", \"documentation\": null}, \"base.html\": {\"language\": \"html\", \"name\": \"base.html\", \"documentation\": null}, \"chat.html\": {\"language\": \"html\", \"name\": \"chat.html\", \"documentation\": null}, \"landingPage.html\": {\"language\": \"html\", \"name\": \"landingPage.html\", \"documentation\": null}}}, \"views.py\": {\"language\": \"python\", \"name\": \"views.py\", \"documentation\": {\"function\": [{\"name\": \"landing_page\", \"description\": \"Renders the landing page template\", \"parameters\": [{\"name\": \"None\", \"description\": \"No parameters\", \"type\": \"None\"}], \"return\": {\"type\": \"html\"}}, {\"name\": \"main_page\", \"description\": \"Renders the main page template\", \"parameters\": [{\"name\": \"None\", \"description\": \"No parameters\", \"type\": \"None\"}], \"return\": {\"type\": \"html\"}}, {\"name\": \"uploadImage\", \"description\": \"Handles the image upload and saves the image details to the database\", \"parameters\": [{\"name\": \"None\", \"description\": \"No parameters\", \"type\": \"None\"}], \"return\": {\"type\": \"redirect\"}}, {\"name\": \"chat\", \"description\": \"Renders the chat page template\", \"parameters\": [{\"name\": \"None\", \"description\": \"No parameters\", \"type\": \"None\"}], \"return\": {\"type\": \"html\"}}]}}}}")
    //     console.log(data)
    //     // console.log(data["main.py"].documentation[0])
    //     // console.log("This is the function from the main.py", documentation["main.py"].documentation.function[0])
    //     setDocumentation({...data})
    // }, []);


    const functionDisplay = (functionData, elevation=2) => {
        // create the display for a function
        return (
                <Accordion key={functionData.name} elevation={elevation}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls={functionData.name}>
                        <Grid  sx={{alignItems: "center", display: "flex", width: "100%"}} gap={2}>
                            {
                                functionData?.description ?
                                    <Tooltip title={functionData.description} arrow placement="right">
                                        <Chip label={functionData.name}
                                              icon={<CalculateSharpIcon/>}
                                              sx={{borderRadius: "5px", fontWeight: "bold"}} color="secondary"/>
                                    </Tooltip> :
                                    <Chip label={functionData.name}
                                          icon={<CalculateSharpIcon/>}
                                          sx={{borderRadius: "5px", fontWeight: "bold"}} color="secondary"/>
                            }
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <h4 style={{marginBottom: "0.5rem", marginTop: "0"}}>Description</h4>
                        <p style={{marginTop: 0}}>{functionData.description}</p>
                        {
                            functionData.parameters &&
                            functionData.parameters.length !== 0 &&
                            functionData.parameters.filter(x => x.type !== null || x.type.lower !== "none").length !== 0 &&
                            <>
                                <Divider />
                                <h4 style={{marginBottom: "0.5rem"}}>Parameters</h4>
                                {
                                    functionData.parameters.map((parameter, index) => {
                                        return (
                                            <Accordion key={parameter.name} elevation={elevation + 1}>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    aria-controls={parameter.name}
                                                    id={parameter.name}
                                                    style={{margin: 0}}
                                                >
                                                    <Grid  sx={{alignItems: "center", display: "flex"}} gap={2}>
                                                        <Chip label={parameter.type} sx={{borderRadius: "5px"}}/>
                                                        <Typography>{parameter.name}</Typography>
                                                    </Grid>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <p style={{margin: 0}}>{parameter.description}</p>
                                                </AccordionDetails>
                                            </Accordion>
                                        )
                                    })
                                }
                            </>
                        }
                        {
                            functionData.return && <>
                                <Divider sx={{marginBlock: "1rem"}}/>
                                <Grid gap={1} sx={{display: "flex", alignItems: "center"}}>
                                    <h4 style={{margin: 0, fontWeight: "bold"}}>Return</h4>
                                    <Chip label={
                                        typeof  functionData == "object" ?
                                        JSON.stringify(functionData.return) : functionData.return}
                                          sx={{borderRadius: "5px", fontWeight: "bold"}}/>
                                </Grid>
                            </>
                        }
                    </AccordionDetails>
                </Accordion>
        )
    }

    const functionListDisplay = (functionList, elevation) => {
        return (<Grid container spacing={0.5} sx={{flexDirection: "column"}}>
                {functionList.map((item) => {
                    console.log(item)
                    return <Grid item sx={{flexGrow: 1}}>
                        {functionDisplay(item, elevation)}
                    </Grid>

                })}
            </Grid>)
            // <Card variant="outlined">
            // {/*<CardContent>*/}

            // {/*</CardContent>*/}
            // {/*<CardActions>*/}
            // {/*    <Button size="small">Learn More</Button>*/}
            // {/*</CardActions>*/}
        // </Card>
    }

    const classDisplay = (classData, elevation) => {
        return (
            <div>
                {/*<p>sometihng {JSON.stringify(classData)}</p>*/}
                <Accordion key={classData.name} elevation={elevation}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls={classData.name}>
                        <Grid  sx={{alignItems: "center", display: "flex", width: "100%"}} gap={2}>
                            {
                                classData?.description ?
                                    <Tooltip title={<h3 style={{margin: 0}}>{classData.description}</h3>} arrow placement="right">
                                        <Chip label={classData.name}
                                              icon={<AutoAwesomeMosaicSharpIcon/>}
                                              sx={{borderRadius: "5px", fontWeight: "bold"}} color="primary"/>
                                    </Tooltip> :
                                    <Chip label={classData.name}
                                          icon={<AutoAwesomeMosaicSharpIcon/>}
                                          sx={{borderRadius: "5px", fontWeight: "bold"}} color="primary"/>
                            }


                            {/*{*/}
                            {/*     &&*/}
                            {/*    <div style={{width: "100%"}}>*/}
                            {/*        <Typography sx={{*/}
                            {/*            overflow: "hidden",*/}
                            {/*            whiteSpace: "nowrap",*/}
                            {/*            textOverflow: "ellipsis",*/}
                            {/*            width: "70%"*/}
                            {/*        }}>{classData.description}</Typography>*/}
                            {/*    </div>*/}
                            {/*}*/}
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <h4 style={{marginBottom: "0.5rem", marginTop: "0"}}>Description</h4>
                        <p style={{marginTop: 0}}>{classData.description}</p>
                        {
                            classData.function && <>
                                <Divider/>
                                <h4 style={{marginBottom: "0.5rem"}}>Methods</h4>
                                {
                                    functionListDisplay(classData.function, elevation + 1)
                                }
                            </>
                        }
                    </AccordionDetails>
                </Accordion>
                {/*{functionListDisplay(classData.function)}*/}
            </div>
        )
    }

    const fileDisplay = (fileData, elevation) => {
        return <>
            <Card elevation={elevation}>
                <CardContent>
                    <Grid container sx={{display: "flex", alignItems: "end"}} gap={2} mb={1}>
                        <Grid item>
                            <Chip label={fileData.language}
                                  icon={<CodeSharpIcon/>}
                                  sx={{borderRadius: "5px", fontWeight: "bold"}}/>
                        </Grid>
                        <Grid item>
                            <h3 style={{margin: 0}}>{fileData.name}</h3>
                        </Grid>
                    </Grid>
                    {
                        fileData.language !== "python" &&
                        <p style={{marginBottom: 0}}>This file wasn't processed, only python code documentation is supported at the moment.</p>
                    }
                    {
                        fileData.language === null &&
                        <p style={{marginBottom: 0}}>This file wasn't processed as it was considered not to be code.</p>
                    }
                    {
                        fileData.documentation &&
                        <Grid container spacing={0.5} sx={{flexDirection: "column"}} gap={0.5}>
                            <Grid item xs={12} my={2} sx={{display: "flex", alignItems: "center", flexWrap: "wrap"}} rowGap={1} columnGap={0.5}>
                                {
                                    fileData.tags && fileData.tags.filter((x, index) => index < 10).map((item, index) => {
                                        return <Chip label={"#" + item.word}/>
                                    })
                                }
                            </Grid>
                            {
                                !!fileData?.documentation?.function &&
                                fileData.documentation.function.length !== 0 &&
                                <>
                                    <h4 style={{margin: "0.5rem"}}>Functions</h4>
                                    {
                                        fileData.documentation.function.map((item) => {
                                            console.log(item)
                                            return <Grid item sx={{flexGrow: 1}}>
                                                {functionDisplay(item, elevation + 1)}
                                            </Grid>

                                        })}
                                </>
                            }
                            {
                                !!fileData?.documentation?.class &&
                                fileData.documentation.class.length !== 0 &&
                                <>
                                    <h4 style={{margin: "0.5rem"}}>Classes</h4>
                                    {
                                        fileData.documentation.class.map((item) => {
                                        return <Grid item sx={{flexGrow: 1}}>
                                            {classDisplay(item, elevation + 1)}
                                        </Grid>

                                    })}
                                </>
                            }
                        </Grid>
                    }
                </CardContent>
                {/*<CardActions>*/}
                {/*    <Button size="small">Learn More</Button>*/}
                {/*</CardActions>*/}
            </Card>
        </>
    }


    return (<div style={{marginBottom: "1rem"}}>{documentation && fileDisplay(documentation, 1)}</div>)
}

export default Documentation;