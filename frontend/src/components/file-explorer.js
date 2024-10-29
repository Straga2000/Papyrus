import {useEffect, useState} from "react";
import {Breadcrumbs, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FolderIcon from "@mui/icons-material/Folder";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {useNavigate, useNavigation} from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import "../styles/file-explorer.css";

const FileExplorer = (props) => {
    const [path, setPath] = useState([]);
    const tree = props.tree;
    const meta = props.meta;
    let files = props.files;
    const navigate = useNavigate();

    useEffect(() => {
        setPath([meta.name])
    }, []);

    useEffect(() => {
        files = props.files
    }, [props.files])

    // TODO load project using websockets

    const getTree = (path) => {
        let exploreTree = tree;

        path.forEach((item) => {
            for(let i = 0; i < exploreTree.content.length; i++) {
                const elem = exploreTree.content[i];
                if(elem.name === item)
                {
                    exploreTree = elem;
                    break;
                }
            }
        })
        console.log("This is the explored tree", exploreTree)
        return exploreTree.content
    }

    const addToPath = (name) => {
        setPath([...path, name]);
    }

    const removeFromPath = () => {
        path.pop()
        setPath([...path]);
    }

    const truncatePath = (idx) => {
        setPath([...path.slice(0, idx + 1)])
    }

    const createLinkParameters = (params) => {
        return Object.keys(params).map((key) => {
            return "" + key + "=" + params[key]
        }).join("&")
    }

    const renderTree = (path) => {
        const content = getTree(path)
        // here we return a list component with list items
        return <List>
            {content.map((item) => {
                if(item.type === "str")
                    return <ListItem key={item.name} disableGutters>
                        <ListItemButton onClick={() => {
                            console.log("Needs to go to the 'file' page", item.name)
                            console.log(item)
                            console.log(files[item.key])
                            console.log(files)

                            const fileData = {
                                url: files[item.key],
                                elevation: 1,
                                ...item,
                            }
                            console.log("These are the complete data information", fileData)
                            navigate("/file?" + createLinkParameters(fileData));
                        }}>
                            <ListItemIcon><InsertDriveFileIcon/></ListItemIcon>
                            <ListItemText
                                primary={item.name}
                            ></ListItemText>
                        </ListItemButton>
                    </ListItem>

                if(item.type === "dict")
                    return <ListItem key={item.name} disableGutters>
                        <ListItemButton onClick={() => {
                            console.log("Needs to add to path", item.name)
                            addToPath(item.name)
                        }}>
                            <ListItemIcon><FolderIcon color="secondary"/></ListItemIcon>
                            <ListItemText
                                primary={item.name}
                                primaryTypographyProps={{color: "secondary"}}
                            ></ListItemText>
                        </ListItemButton>
                    </ListItem>

            })}
        </List>
    }


    return <>
        <Paper elevation={2} sx={{padding: 1, marginBottom: 2}}>
            <Grid container sx={{ display: "flex", flexDirection: "row", alignItems: "center"}} gap={1}>
                <IconButton aria-label="Back" onClick={() => {
                    if(path.length !== 1)
                        removeFromPath()
                    else
                        navigate(-1)

                }}>
                    <ChevronLeftIcon/>
                </IconButton>
                {
                    path &&
                    <Paper elevation={0} sx={{paddingX: 0.5, paddingY: 0.5, flexGrow: 1}}>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Button sx={{minWidth: "unset"}} onClick={()=>{navigate(-1)}}>
                                <HomeIcon/>
                            </Button>
                            {/*<Button variant="text" onClick={reset} disabled={pathList.length === 0}>{name}</Button>*/}
                            {
                                path.map((item, index) => {
                                    return <Button sx={{minWidth: "unset"}} onClick={() => truncatePath(index)}>
                                        {item}
                                    </Button>

                                })
                            }
                        </Breadcrumbs>
                    </Paper>
                }
            </Grid>
            {renderTree(path)}
        </Paper>
    </>
}

export default FileExplorer;