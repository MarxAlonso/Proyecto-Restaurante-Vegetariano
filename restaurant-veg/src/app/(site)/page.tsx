import Hero from "./sections/Hero";
import FeaturedMenu from "./sections/FeaturedMenu";
import Categories from "./sections/Categories";

export default function SitePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <Categories />
      <FeaturedMenu />
    </main>
  );
}
