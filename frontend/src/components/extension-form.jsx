import Grid from "@mui/material/Grid";
import {
    Checkbox,
    Chip,
    FormControlLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import Paper from "@mui/material/Paper";
import ListContext from "@mui/material/List/ListContext";
import CodeIcon from '@mui/icons-material/Code';
import CodeOffIcon from '@mui/icons-material/CodeOff';
import Button from "@mui/material/Button";

const ExtensionForm = (props) => {
    const fileFormats = props.formats;

    return <List dense sx={{position: "relative", paddingTop: "0"}}>
        <ListItem sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            paddingTop: "unset"
        }}>
            <Button onClick={props.getDocumentation} variant="contained" color="secondary" sx={{
                justifyContent: "center",
                width: "100%",
            }}>
                Create documentation
            </Button>
        </ListItem>
        <ListItem>
            <ListItemIcon sx={{minWidth: "unset", padding: "0 8px 0 0"}}>
                <CodeIcon color="secondary"/>
            </ListItemIcon>
            <ListItemText
                primary="File extensions"
                primaryTypographyProps={{color: "secondary"}}
                component="h3"
            ></ListItemText>
        </ListItem>
        {fileFormats?.result && Object.keys(fileFormats.result).map(key => {

            // console.log("file format", key, fileFormats.result[key])

            const code = fileFormats.result[key].code;
            const language = fileFormats.result[key].language;
            const fileType = fileFormats.result[key].type;

            return <ListItem>
                    <Paper elevation={4} sx={{padding: 1, width: "100%"}}>
                        <Grid container gap={0.2} sx={{display: "flex", flexDirection: "column"}}>
                            <Grid item>
                                <ListItemText
                                    primary={key}
                                    secondary={(language ? language : "")}
                                    primaryTypographyProps={{color: "secondary"}}
                                ></ListItemText>
                            </Grid>
                            <Grid item sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                <FormControlLabel sx={{margin: "unset", gap: "4px"}}
                                                  labelPlacement="start"
                                                  control={<Checkbox
                                                      checked={code}
                                                      checkedIcon={<CodeIcon color="secondary"/>}
                                                      icon={<CodeOffIcon color="secondary"/>}
                                                  />}
                                                  label={code ? "code" : "no code"}
                                                  color="secondary"
                                    // icon={<BookmarkBorderIcon />}
                                    // checkedIcon={<BookmarkIcon />}
                                />
                                <Chip color="secondary" label={fileType}></Chip>
                            </Grid>
                        </Grid>
                    </Paper>
            </ListItem>

        })}
    </List>
    // <Paper elevation={2}>

    // </Paper>


}

export default ExtensionForm;