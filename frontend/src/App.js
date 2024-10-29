import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ToolList from "./components/tool-list";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./pages/about";
import ProductDesigner from "./pages/product-designer";
import Home from "./pages/home"
import Issues from './components/issues';
import Solver from "./pages/solver";
import Browser from "./pages/browser";
import Viewer from "./components/viewer";
// // ...
// import About from "./pages/About"

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// https://semaphoreci.com/blog/routing-layer-react#:~:text=In%20a%20single%2Dpage%20React,components%20based%20on%20user%20interaction.

function App() {
    // init routes for pages

    // const router = createBrowserRouter([
    //     {
    //         path: "/",
    //         element: ,
    //     },
    //     {
    //         path: "/browser",
    //         element: <Browser/>
    //     },
    //     // // other pages....
    //     {
    //         path: "/about",
    //         element: <About />,
    //     },{
    //         path: "/home",
    //         element: <Home />,
    //     },{
    //         path: "/issues",
    //         element: <Issues />,
    //     },
    //     {
    //         path: "/solver",
    //         element: <Solver/>,
    //     },
    //     {
    //         path: "/product-designer",
    //         element: <ProductDesigner/>
    //     }
    // ])


    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <main>
                <Router>
                    <Routes>
                        <Route index path="/" element={<Home/>}/>
                        <Route path="/browser" element={<Browser/>}/>
                        <Route path="/file" element={<Viewer/>}/>
                    </Routes>
                </Router>

                {/*<RouterProvider router={router} />*/}
            </main>
        </ThemeProvider>
    );
}


export default App;
