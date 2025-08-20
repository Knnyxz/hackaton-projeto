import Hero from "@/components/Hero";
import Introduction from "@/components/Introduction";
import Visualization from "@/components/Visualization";
import SpaceDebrisCharts from "@/components/SpaceDebrisCharts";
import Statistics from "@/components/Statistics";
import Education from "@/components/Education";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Introduction />
      <Visualization />
      <SpaceDebrisCharts />
      <Statistics />
      <Education />
      <Footer />
    </div>
  );
};

export default Index;