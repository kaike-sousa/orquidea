    import Image from "next/image"

    export default function AboutBanner() {
    return (
        <section className="about-banner" id="sobre">
        <div className="about-image">
            <Image
            src="/banners/banner-2.jpg"
            alt="Orquídea Essence"
            fill
            sizes="40vw"
            />
        </div>

        <div className="about-content">
            <span>AMBIENTES MAIS ACOLHEDORES</span>

            <h2>
            O poder da fragrância
            <br />
            em cada detalhe.
            </h2>

            <p>
            Transforme sua casa em um lugar ainda mais
            especial com a Orquídea Essence.
            </p>

            <a href="/produtos" className="about-button">
            CONHEÇA NOSSA LINHA →
            </a>
        </div>
        </section>
    )
    }