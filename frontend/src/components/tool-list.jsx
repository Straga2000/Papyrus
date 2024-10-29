import {Button, Grid} from "@mui/material";
import Paper from '@mui/material/Paper';
// import ProductDesigner from
import "../styles/tool-list.css"
import AddIcon from '@mui/icons-material/Add';
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';
const ToolList = (props) => {
  return (<Grid container spacing={2} p={2}>
      <Grid item xs={4} height={10}>
          <Paper className="image-card" sx={{backgroundImage: 'url("../images/product design.jpg")'}}>
              <Grid xs={6} p={2} className="blur-background">
                  <h2 style={{marginTop: "unset"}}>
                      Product designer
                  </h2>
                  <p>
                      Make professional presentation images for your product
                  </p>
                  <Button variant="contained"
                          color="primary"
                          endIcon={<ArrowRightOutlinedIcon/>}
                          href={"/product-designer"}
                  >Run</Button>
              </Grid>
              {/*<img src={ProductDesigner} className="image-card"/>*/}


          </Paper>
      </Grid>
      <Grid item xs={4}>
          <Paper sx={{padding: 2}} elevation={3}>
              xs=8
          </Paper>
      </Grid>
  </Grid>);
}

export default ToolList;