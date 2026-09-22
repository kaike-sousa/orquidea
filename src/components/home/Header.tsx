    import Image from "next/image"

    export default function Header() {
    return (
        <header className="header">
        <div className="header-content">
            <button className="mobile-menu" aria-label="Abrir menu">
            <span />
            <span />
            <span />
            </button>

            <nav className="desktop-nav">
            <a href="#" className="active">Início</a>
            <a href="#produtos">Produtos</a>
            <a href="#sobre">Sobre Nós</a>
            <a href="#faq">Perguntas Frequentes</a>
            <a href="#contato">Contato</a>
            </nav>

            <a href="/" className="logo">
            <Image
                src="/logo-orquidea.png"
                alt="Orquídea Essence"
                width={330}
                height={150}
                priority
            />
            </a>

            <div className="header-actions">
            <button aria-label="Pesquisar">⌕</button>
            <button aria-label="Minha conta">♙</button>

            <button className="cart-button" aria-label="Carrinho">
                🛒
                <span>0</span>
            </button>
            </div>
        </div>
        </header>
    )
    }