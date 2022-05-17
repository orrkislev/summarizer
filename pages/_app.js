import { Container } from "@mui/material"

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Container fluid>
                <Component {...pageProps} />
            </Container>
        </>
    )
}

export default MyApp
