import SummerizedParagraphs from "./SummerizedParagraph"

export default function PdfGPT(props){
    const style = {
        position: 'absolute',
        top: props.top,
        left: props.left,
    }

    return <SummerizedParagraphs 
        {...props}  
        style={style}
    />
}