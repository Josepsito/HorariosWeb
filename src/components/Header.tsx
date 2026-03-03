import "./header/Header.css"

function Header(){
    return (<>
        <header className="header">
            <h1 className="logo">Sistema Medico</h1>
            <nav>
                <a href="/usuarios">Usuarios</a>
                <a href="/horarios">Horarios</a>
                <a href="/medicos">Medicos</a>
                <a href="/periodos">Periodos</a>
            </nav>
        </header>
        </>)
}

export default Header