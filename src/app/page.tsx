  import TopBar from "@/src/components/home/TopBar"
  import Header from "@/src/components/home/Header"
  import HeroCarousel from "@/src/components/home/HeroCarousel"
  import Benefits from "@/src/components/home/Benefits"
  import BestSellers from "@/src/components/home/BestSellers"
  import AboutBanner from "@/src/components/home/AboutBanner"

  export default function Home() {
    return (
      <>
        <TopBar />
        <Header />

        <main>
          <HeroCarousel />
          <Benefits />
          <BestSellers />
          <AboutBanner />
        </main>
      </>
    )
  }