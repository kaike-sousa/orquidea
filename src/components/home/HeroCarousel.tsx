    "use client"

    import Image from "next/image"
    import { useEffect, useState } from "react"

    const banners = [
    {
        image: "/banners/banner-1.jpg",
        eyebrow: "PERFUMES QUE TRANSFORMAM",
        title: "Mais que fragrância, é bem-estar.",
        description: "Descubra a essência que combina com cada momento.",
    },
    {
        image: "/banners/banner-2.jpg",
        eyebrow: "SUA CASA, SUA ESSÊNCIA",
        title: "Aromas que deixam marcas.",
        description: "Crie ambientes ainda mais acolhedores.",
    },
    {
        image: "/banners/banner-3.jpg",
        eyebrow: "UM TOQUE DE ELEGÂNCIA",
        title: "Perfume cada detalhe.",
        description: "Fragrâncias pensadas para transformar seus ambientes.",
    },
    ]

    export default function HeroCarousel() {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(
        () => setCurrent((value) => (value + 1) % banners.length),
        6000
        )
        return () => clearInterval(timer)
    }, [])

    const banner = banners[current]

    return (
        <section className="hero">
        <Image
            src={banner.image}
            alt={banner.title}
            fill
            priority
            className="hero-image"
        />

        <div className="hero-overlay" />

        <div className="hero-content">
            <span>{banner.eyebrow}</span>
            <h1>{banner.title}</h1>
            <p>{banner.description}</p>

            <a href="#produtos" className="primary-button">
            VER PRODUTOS →
            </a>
        </div>

        <div className="carousel-dots">
            {banners.map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrent(index)}
                className={index === current ? "active" : ""}
            />
            ))}
        </div>
        </section>
    )
    }