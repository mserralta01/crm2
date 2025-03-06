import { HeroSection } from '@/components/hero-section';
import { VideoSection } from '@/components/video-section';
import { ProblemSection } from '@/components/problem-section';
import { Testimonials } from '@/components/testimonials';
import { Comparison } from '@/components/comparison';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <HeroSection />
      <VideoSection />
      <ProblemSection />
      <Comparison />
      <Testimonials />
      <Footer />
    </div>
  );
}