import { SplashCursor } from "@/components/ui/splash-cursor";
import { Header1 } from "@/components/ui/header";
import AboutUsSection from "@/components/ui/about-us-section";

export function NoiseDemo() {
  return <SplashCursor />;
}

export function HeaderDemo() {
  return (
    <div className="block">
      <Header1 />
    </div>
  );
}

export function DemoOne() {
  return <AboutUsSection />;
}
