export function Header() {
    return (
        <div className="container">
            <header className="header">
                <div className="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M7 16h34v-5H7Zm-3-5q0-1.2.9-2.1Q5.8 8 7 8h34q1.2 0 2.1.9.9.9.9 2.1v11.95H7V37h11.65v3H7q-1.2 0-2.1-.9Q4 38.2 4 37Zm25.9 33-8.5-8.5 2.15-2.15 6.35 6.35 12-12 2.1 2.2ZM7 11v26-7.9 6.5V11Z"/></svg>
                    <span>
                        MOON DAO
                    </span>
                </div>
                {/* <button className="btn-main style2">
                Entrar no Discord
                </button> */}
                <a href="https://discord.gg/nn7SrF2gDY" target="_blank" className="btn-main style2">
                    Entrar no Discord
                </a>
            </header>
        </div>
    );
}
