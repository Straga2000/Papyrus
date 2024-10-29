import ReactCompareImage from 'react-compare-image';
import {Button, Grid, Input} from "@mui/material";
import {useEffect, useState} from "react";
import useSlot from "@mui/material/utils/useSlot";
import axios from "axios";


const ProductDesigner = (props) => {
    const [selectedFile, setSelectedFile] = useState()
    const [depthMask, setDepthMask] = useState()
    const [preview, setPreview] = useState()
    const [backgroundPrompt, setBackgroundPrompt] = useState()


    useEffect(() => {
        if (!selectedFile) {
            setPreview(null)
            return
        }

        const objectUrl = URL.createObjectURL(selectedFile)
        setPreview(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [selectedFile])

    const onSelectFile = e => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined)
            return
        }

        setSelectedFile(e.target.files[0])
    }

    const handleGeneration = (e) => {
        e.preventDefault()

        let body = {
            "image": selectedFile,
            "prompt": backgroundPrompt
        }

        // let formData = new FormData()
        // Object.keys(body).forEach(fieldName => {
        //     console.log(fieldName, body[fieldName]);
        //     formData.append(fieldName, body[fieldName]);
        // })

        axios.post(
            "http://localhost:5000/api/product-design/",
                body,
            {headers: {
                        // Overwrite Axios's automatically set Content-Type
                        'Content-Type': 'multipart/form-data'
                    },
                }
        ).then((response) => {
            console.log("ok")
            console.log("this is backend response", response)
        }).catch((e) => {
            console.log("Error on something", e)
        })


        // fetch(img.src)
        //     .then(res => res.blob())
        //     .then(blob => {
        //         const file = new File([blob], "capture.png", {
        //             type: 'image/png'
        //         });
        //         var fd = new FormData();
        //         fd.append("image", file);
        //         $.ajax({
        //             type: "POST",
        //             enctype: 'multipart/form-data',
        //             url: "/api/file/upload",
        //             data: fd,
        //             processData: false,
        //             contentType: false,
        //             cache: false,
        //             success: (data) => {
        //                 alert("yes");
        //             },
        //             error: function(xhr, status, error) {
        //                 alert(xhr.responseText);
        //             }
        //         });
        //     });

        // let body = {
        //     "width": canvasSize,
        //     "height": canvasSize,
        //     "inputs": inputsList,
        //     "prompt": prompt,
        //     "style": stylePrompt
        // }
        //
        // if(needsRegeneration)
        //     body = {
        //         ...body,
        //         "inputs": inputsList.filter((item) => item.regen === true),
        //         "seed": generated.seed,
        //         "id": generated.id
        //     }
        //
        // setLoading(true)
        //
        // // let generationEndpoint = process.env.REACT_APP_BACKEND_URL + (needsRegeneration ? "/api/inpaint-image/" :"/api/generate-image/")
        // let generationEndpoint = process.env.REACT_APP_BACKEND_URL + (needsRegeneration ? "/api/inpaint-image/" :"/api/iterative-image/")
        // console.log(generationEndpoint)
        // axios.post(
        //     generationEndpoint,
        //     body,
        //     {headers: {
        //             // Overwrite Axios's automatically set Content-Type
        //             'Content-Type': 'application/json'
        //         },
        //         cancelToken: cancelToken.token
        //     }
        // ).then(function (response) {
        //     if(response.status) {
        //         console.log("This is the response for generation", response)
        //         let data = response.data;
        //         if(data.status)
        //         {
        //             console.log(data)
        //             setGenerated(
        //                 {
        //                     ...data.data,
        //                     image:  process.env.REACT_APP_BACKEND_URL + "/api/get-image/" + data.data.image
        //                 })
        //         }
        //     }
        // }).then(() => {
        //     setLoading(false)
        //     renewCancel()
        // }).catch((err) => {
        //     console.log("Loading status is", loading)
        //     console.log("Error on generate", err)
        //     setLoading(false)
        //     renewCancel()
        // })
    }

    const onPromptChange = (e) => {
        setBackgroundPrompt(e.target.value)
    }

    return (
        <Grid container maxHeight="400px">
            <Grid item xs={4} maxHeight="100%" spacing={2}>
                <form onSubmit={handleGeneration}>
                    <Grid item xs={12}>
                        <input type="file" onChange={onSelectFile}/>
                    </Grid>
                    <Grid item xs={12}>
                        <Input type="text" onChange={onPromptChange}/>
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit">Submit</Button>
                    </Grid>
                </form>
                {preview && <img src={preview}/>}
                {/*<ReactCompareImage leftImage="https://picsum.photos/200/300" rightImage="https://picsum.photos/200" sx={{maxHeight: "400px"}}/>*/}
            </Grid>
        </Grid>
    )
}

export default ProductDesigner;