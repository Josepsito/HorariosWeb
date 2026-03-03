import "./header/Header.css"

function Header(){
    return (<>
        <header className="header">
            <h1 className="logo">Sistema Medico</h1>
            <nav>
                <a href="#">Inicio</a>
                <a href="#">Servicios</a>
                <a href="#">Login</a>
            </nav>
        </header>
        </>)
}

export default Header