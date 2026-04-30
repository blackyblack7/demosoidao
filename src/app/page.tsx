import { Hero } from "@/components/sections/Hero";
import { InfiniteMarquee } from "@/components/sections/InfiniteMarquee";
import NewsSection from "@/components/sections/NewsSection";
import FacebookEmbed from "@/components/sections/FacebookEmbed";
import WelcomePopup from "@/components/ui/WelcomePopup";
import { getSitePopup } from "@/app/actions/popup";

export default async function Home() {
  const popup = await getSitePopup();

  return (
    <>
      <WelcomePopup popup={popup} />
      <Hero />
      <InfiniteMarquee />
      <NewsSection />
      <FacebookEmbed />
    </>
  );
}
