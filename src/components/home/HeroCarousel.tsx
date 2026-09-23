    "use client"

    import { useEffect, useState } from "react"
    import { createClient } from "@/lib/supabase/client"

    type Banner = {
    id: string
    image_url: string
    link_url: string | null
    device: "desktop" | "mobile"
    sort_order: number
    }

    export default function HeroCarousel() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [current, setCurrent] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadBanners() {
        const supabase = createClient()

        const { data, error } = await supabase
            .from("site_banners")
            .select("id, image_url, link_url, device, sort_order")
            .eq("active", true)
            .eq("device", "desktop")
            .order("sort_order", { ascending: true })

        if (error) {
            console.error("Erro ao carregar banners:", error)
            setLoading(false)
            return
        }

        setBanners(data ?? [])
        setLoading(false)
        }

        loadBanners()
    }, [])

    useEffect(() => {
        if (banners.length <= 1) return

        const timer = setInterval(() => {
        setCurrent((value) => (value + 1) % banners.length)
        }, 6000)

        return () => clearInterval(timer)
    }, [banners.length])

    if (loading || banners.length === 0) {
        return null
    }

    const banner = banners[current]

    return (
        <section className="hero">
        {banner.link_url ? (
            <a href={banner.link_url} className="hero-link">
            <img
                src={banner.image_url}
                alt=""
                className="hero-image"
            />
            </a>
        ) : (
            <img
            src={banner.image_url}
            alt=""
            className="hero-image"
            />
        )}

        {banners.length > 1 && (
            <div className="carousel-dots">
            {banners.map((bannerItem, index) => (
                <button
                key={bannerItem.id}
                type="button"
                aria-label={`Ir para o banner ${index + 1}`}
                onClick={() => setCurrent(index)}
                className={index === current ? "active" : ""}
                />
            ))}
            </div>
        )}
        </section>
    )
    }