import {useEffect, useState} from "react";
import axios from "axios";
import {Breadcrumbs, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Documentation from "./documentation";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const ProjectExplorer = (props) => {
    const [projectTree, setProjectTree] = useState(props.tree);
    const [visualizedTree, setVisualizedTree] = useState(props.tree);
    const [pathList, setPathList] = useState([]);
    const [name, setName] = useState(props.name);
    const [displayFile, setDisplayFile] = useState(null)

    // useEffect(() => {
    // }, [visualizedTree]);

    const back = () => {
        let newPathList = [...pathList];
        newPathList.pop()
        setPathList(newPathList)

        // original tree
        let newProjectTree = {...projectTree};
        for(let i = 0; i < newPathList.length; i++) {
            newProjectTree = newProjectTree[newPathList[i]]
        }

        setVisualizedTree({...newProjectTree})
        setDisplayFile(null)
    }

    const generalBack = (key) => {
        let newProjectTree = {...projectTree};
        let newPathList = [];
        setDisplayFile(null)
        for(let i = 0; i < pathList.length; i++) {
            if (pathList[i] === key) {
                setVisualizedTree({...newProjectTree[key]})
                setPathList([...newPathList, key])
                return;
            }

            newProjectTree = {...newProjectTree[pathList[i]]};
            newPathList.push(pathList[i])
        }
    }

    const reset = () => {
        setVisualizedTree(projectTree)
        setPathList([])
        setDisplayFile(null)
    }

    const getSubtreeList = () => {
        console.log(visualizedTree)
        return <List>{
            Object.keys(visualizedTree).map((treeKey) => {
                if(visualizedTree[treeKey]?.documentation !== undefined)
                    return <ListItem>
                        <ListItemButton onClick={() => {
                            setPathList([...pathList, treeKey])
                            setDisplayFile(visualizedTree[treeKey])
                            console.log("Should open file in here for", treeKey)
                        }}>
                            <ListItemIcon><InsertDriveFileIcon/></ListItemIcon>
                            <ListItemText
                                primary={visualizedTree[treeKey].name}
                            ></ListItemText>
                        </ListItemButton>

                    </ListItem>
                return <ListItem>
                    <ListItemButton onClick={() => {
                        // enter deeper in the tree
                        setVisualizedTree({...visualizedTree[treeKey]})
                        setPathList([...pathList, treeKey])
                    }}>
                        <ListItemIcon><FolderIcon color="primary"/></ListItemIcon>
                        <ListItemText
                            primary={treeKey}
                            primaryTypographyProps={{color: "primary"}}
                        ></ListItemText>
                    </ListItemButton>
                </ListItem>
            })
        }</List>
    }

    return (
        <>
            <Paper elevation={1} sx={{padding: 1, marginBottom: 2}}>
                <Grid container sx={{justifyContent: "space-between", display: "flex", flexDirection: "row", alignItems: "center"}}>
                        {

                            <Breadcrumbs aria-label="breadcrumb">
                                <Button variant="text" onClick={reset} disabled={pathList.length === 0}>{name}</Button>
                                {
                                    !!pathList && pathList.map((item, index) => {
                                        if(pathList.length - 1 === index)
                                            return <Button variant="text" disabled={true}>{item}</Button>
                                        else
                                            return <Button onClick={() => {generalBack(item)}} variant="text">{item}</Button>
                                    })
                                }
                            </Breadcrumbs>
                        }
                        {
                            <IconButton aria-label="Back" onClick={() => {
                                if(pathList.length !== 0)
                                    back()
                                else
                                    props.onExit()
                                }}>
                                <ChevronLeftIcon/>
                            </IconButton>
                        }
                </Grid>
            </Paper>
            {!!visualizedTree && !displayFile &&
                <Paper elevation={1}>
                    {getSubtreeList()}
                </Paper>}
            {displayFile && <Documentation docs={displayFile}/>}
        </>
    )
}

export default ProjectExplorer;