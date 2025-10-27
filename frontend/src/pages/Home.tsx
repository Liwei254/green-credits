import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import SiteFooter from "../components/SiteFooter";
// import ScrollProgress from "../components/ScrollProgress"; // optional

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* <ScrollProgress /> */}
      <Navbar />
      <main>
        <Hero />
        <FeatureCards />
      </main>
      <SiteFooter />
    </div>
  );
}