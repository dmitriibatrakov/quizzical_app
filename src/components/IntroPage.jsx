

export default function IntroPage(props) {
    return (
        <section className="intro-page">
            <h1 className="">Quizzical</h1>
            <p className="inter-text">Твой квиз на вечер!</p>
            <button className="system-btn start-btn" onClick={props.startToggle}>Начать игру!</button>
        </section>
    )
}