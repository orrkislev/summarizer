import { Button, Divider, Grid } from "@mui/material";
import { useState } from 'react';

export default function Paragraph(props) {
    const [summary, setsummary] = useState("")

    const summarize = async  () => {
        const response = await fetch("/api/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({ text: props.text }),
        });
        console.log(response)
        const data = await response.json();
        setsummary(data.result);
    }


    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
                <div>{props.text}</div>
            </Grid>
            <Grid item xs={6}>
                {summary == "" && (
                    <Button onClick={summarize}>Summarize</Button>
                )}
                { summary }
            </Grid>
        </Grid>
    )
}
