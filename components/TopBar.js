import { atom, useRecoilState } from 'recoil';
import styled from 'styled-components';

const TopBarDiv = styled.div`
    z-index: 100;
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: .25em;
    background: radial-gradient(circle at 10% 20%, #FE6B8B 30%, #FF8E53 90%), radial-gradient(circle at 90% 90%, #FF8E53 30%, #FE6B8B 90%);
    border-bottom: 1px solid #ccc;
    `

const TopButtons = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1em;
    `
const TopButton = styled.div`
    padding: .25em .5em;
    cursor: pointer;
    border-radius: 5px;
    &:hover {
        background: black;
        color: white;
    }
    transition: all 0.1s ease-in-out;

    ${props => props.active && `
        background: #ffffff88;
    }`}
`

export const settingsAtom = atom({
    key: 'settings',
    default: {
        use4: true,
        applyToAll: false,
    }
})

export default function TopBar(props) {
    const [ settings,setSettings ] = useRecoilState(settingsAtom)

    const clickUse4 = () => {
        setSettings({...settings, use4: !settings.use4})
    }
    const clickApplyToAll = () => {
        setSettings({...settings, applyToAll: !settings.applyToAll})
    }

    return (
        <TopBarDiv style={{ fontFamily: props.fontFamily }}>
            <TopButtons style={{ width: props.width }}>
                <TopButton onClick={props.prev}>prev</TopButton>
                {props.label}
                <TopButton onClick={props.next}>next</TopButton>
            </TopButtons>
            <TopButtons style={{ marginRight: '2em' }}>
                <TopButton active={settings.use4} onClick={clickUse4}>
                    {settings.use4 ? 'GPT-4' : 'GPT-3.5'}
                </TopButton>
                <TopButton active={settings.applyToAll} onClick={clickApplyToAll}>
                    {settings.applyToAll ? 'Apply to all' : 'one by one'}
                </TopButton>
            </TopButtons>
        </TopBarDiv>
    )
}