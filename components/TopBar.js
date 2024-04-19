import { atom, useRecoilState } from 'recoil';
import styled from 'styled-components';

const TopBarContainer = styled.div`
    z-index: 1000;
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .5em;
    width: 100%;
    `

const TopBar1 = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1em;
    background: white;
    border-bottom: 1px solid #604CDD;
    `

const TopBar2 = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 90%;
    padding: .25em;
    background: white;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
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
        model: 'claude',
        title: 'SKIM.ING',
        sectionLabel:'',
        applyToAll: false,
    }
})

export default function TopBar(props) {
    const [settings, setSettings] = useRecoilState(settingsAtom)

    const clickModel = () => {
        if (settings.model == 'claude') setSettings({ ...settings, model: 'gpt' })
        else setSettings({ ...settings, model: 'claude' })
    }
    const clickApplyToAll = () => {
        setSettings({ ...settings, applyToAll: !settings.applyToAll })
    }

    return (
        <TopBarContainer>
            <TopBar1 style={{ fontFamily: props.fontFamily }}>
                <div></div>
                <div>{settings.title}</div>
                <div></div>
            </TopBar1>

            <TopBar2>
                <div></div>
                <TopButtons style={{ width: props.width }}>
                    <TopButton onClick={props.prev}>prev</TopButton>
                    {settings.sectionLabel}
                    <TopButton onClick={props.next}>next</TopButton>
                </TopButtons>
                <TopButtons style={{ marginRight: '2em' }}>
                    <TopButton active={settings.model == 'claude'} onClick={clickModel}>
                        {settings.model == 'claude' ? 'Claude' : 'GPT'}
                    </TopButton>
                    <TopButton active={settings.applyToAll} onClick={clickApplyToAll}>
                        {settings.applyToAll ? 'Apply to all' : 'one by one'}
                    </TopButton>
                </TopButtons>
            </TopBar2>
        </TopBarContainer>
    )
}