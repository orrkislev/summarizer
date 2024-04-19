import SummerizedParagraphs from "./SummerizedParagraph"

export default function EpubGPT(props){
    const element = props.paragraph
    const elementStyle = window.getComputedStyle(element)
    const fontSize = elementStyle.getPropertyValue('font-size').split('px')[0]
    const lineHeight = elementStyle.getPropertyValue('line-height').split('px')[0]

    const style = {
        position: 'absolute',
        top: element.offsetTop + props.topOffset,
        height: element.offsetHeight,
        width: props.width,
        fontSize: fontSize * 1.2 + 'px',
        lineHeight: lineHeight * 1.2 + 'px',
    }

    return <SummerizedParagraphs 
        {...props}  
        text={props.paragraph.innerText}
        style={style}
    />
}