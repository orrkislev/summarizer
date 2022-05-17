import { Container, Divider, TextField, Grid, Button, Box } from "@mui/material";
import { useState } from 'react';
import Paragraph from './../components/Paragraph';

export default function Index(props) {
    const [state, setstate] = useState('input')
    const [text, settext] = useState("")



    const applyText = () => {
        settext(text.split(/(?<=\n|\r)/).filter(txt=>txt.length>1))
        setstate('read')
    }


    if (state == 'input') {
        return (
            <>
                <TextField id="outlined-basic" label="text" variant="outlined" multiline fullWidth onChange={(e) => settext(e.target.value)} minRows={30} />
                <Button variant="outlined" onClick={applyText}>Apply</Button>
            </>
        )
    }

    if (state == 'read') {
        return (
            <>
                {text.map((txt,i)=>( 
                    <Box sx={{p:2}} key={i}>
                        <Paragraph text={txt} key={i}/> 
                    </Box>
                ))}
            </>
        )
    }
}


