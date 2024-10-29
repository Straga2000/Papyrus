import {useState} from "react";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {Chip, List, ListItem, ListSubheader} from "@mui/material";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const ViewerBlock = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const doc = props.doc;
    const elevation = props.elevation;

    const renderArguments = (args) => {
        if(!args)
            return null;

        let new_args = args.map((arg) => {
            console.log("Arguments here", arg)
            const name = arg?.name;
            const type = arg?.type;
            if(type && name)
                return "" + name + ":" + type;

            return null;
        }).filter((elem) => elem !== null)
        return new_args
        // return <List subheader={
        //     <ListSubheader component="div" sx={{
        //         backgroundColor: "unset"
        //     }}>
        //         Arguments
        //     </ListSubheader>}
        // >
        //     {new_args.map((arg) => <ListItem>{arg}</ListItem>)}
        // </List>
    }

    const renderReturn = (value) => {
        if(!value)
            return "void"
        // if the return is a dict, return the value

        if(typeof value === "string")
            return value;

        if(Object.keys(value).length !== 0)
            return Object.keys(value).map((key) => {
                return value[key]
            }).join("/")

        return JSON.stringify(value) ?? "void"
    }

    const renderDefinition = (data) => {
        const args = renderArguments(data.args)
        const returnValue = renderReturn(data.return)

        return <div style={{display: "flex", gap: "0.1rem"}}><span style={{fontWeight: "bold"}}>{data.name}(</span>{
            args.join(",")
        }<span style={{fontWeight: "bold"}}>)</span> <ArrowRightAltIcon/> {returnValue}</div>
    }


    return <Accordion elevation={elevation} expanded={isOpen} onChange={() => {setIsOpen(!isOpen)}} disableGutters={true}>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon/>}
            aria-controls={doc.name}
            id={"" + doc.name + "-def"}
            // sx={{margin: "-0.5rem 0"}}
        >
            <div style={{display: "flex", alignItems: "center", gap: "0.5rem", width: "100%"}}>
                <Chip label={doc.name + ":" + doc.type} color={isOpen ? "secondary" : "default"} sx={{fontWeight: "bold"}}/>
                {
                    !isOpen && <p style={{
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "50ch"
                    }}>{doc.description}</p>
                }

            </div>
        </AccordionSummary>
        <AccordionDetails>
            {
                doc.args && doc.return && doc.name && renderDefinition(
                    {args: doc.args, return: doc.return, name: doc.name}
                )
            }
            <Typography gutterBottom variant="p" component="div" mb={doc.children ? 3 : 0}>
                {JSON.stringify(doc.description)}
            </Typography>
            {/*<Typography gutterBottom variant="p" component="div">*/}
            {/*    Return: {JSON.stringify(doc.return)}*/}
            {/*</Typography>*/}
            {/*<Typography>*/}
            {/*    Type: {JSON.stringify(doc.type)}*/}
            {/*</Typography>*/}
            {doc.children && doc.children.map(elem => <ViewerBlock doc={elem} elevation={elevation >= 4 ? elevation : elevation + 1}/>)}
            {/*{JSON.stringify(doc.children)}*/}
        </AccordionDetails>
    </Accordion>
}

export default ViewerBlock;