import { Button } from "@/components/ui/button";
import { ArrowDown, Rocket, Satellite } from "lucide-react";
import heroImage from "@/assets/space-debris-hero.jpg";
import StarField from "./StarField";
import { useEffect, useState } from "react";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToVisualization = () => {
    document.getElementById('visualization')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLearnMore = () => {
    document.getElementById('introduction')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Star Field Background */}
      <StarField />
      
     


      {/* Content com Fade In */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6 animate-fade-in perspective-2000">
        <div className="space-y-10">
          {/* Main Title com Shadow Text */}
          <div className="relative transform-3d">
            <h1 className="text-6xl md:text-8xl font-bold text-gradient-aurora animate-float drop-shadow-2xl">
              Mapeando a Ameaça Invisível Acima
            </h1>
            <h1 className="absolute inset-0 text-6xl md:text-8xl font-bold text-gradient-aurora animate-float blur-sm opacity-50 -z-10">
              Mapeando a Ameaça Invisível Acima
            </h1>
          </div>
          
          {/* Subtitle com Glow */}
          <p className="text-lg animate-float md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in animation-delay-300 text-balance">
            Explore mais de <span className="text-accent font-bold glow-cyan px-3 py-1 rounded-lg bg-accent/10 border border-accent/20">34.000</span> pedaços de lixo espacial 
            orbitando a Terra a <span className="text-highlight font-bold glow-purple px-3 py-1 rounded-lg bg-highlight/10 border border-highlight/20">28.000+ km/h</span>
          </p>

          {/* Stats com Glass Effect Aprimorado */}
          <div className="flex flex-wrap justify-center animate-float gap-4 text-sm md:text-base animate-fade-in animation-delay-600 perspective-1000">
            <div className="card-cosmic hover-glow card-3d-tilt group cursor-pointer flex items-center gap-2 px-3 py-2 w-fit">
              <Satellite className="w-5 h-5 text-accent transition-all duration-300 layer-2" />
              <span className="font-semibold text-foreground group-hover:text-accent transition-colors duration-300 layer-1">
                34.000+ Objetos Rastreados
              </span>
            </div>
            <div className="card-cosmic hover-glow card-3d-tilt group cursor-pointer flex items-center gap-2 px-3 py-2 w-fit">
              <Rocket className="w-5 h-5 text-highlight group-hover:animate-bounce transition-all duration-300 layer-2" />
              <span className="font-semibold text-foreground group-hover:text-highlight transition-colors duration-300 layer-1">
                900.000+ Fragmentos Estimados
              </span>
            </div>
          </div>


          {/* CTA Buttons com Efeitos Aprimorados */}
          <div className="flex flex-col animate-float sm:flex-row gap-6 justify-center items-center animate-fade-in animation-delay-900 perspective-1000">
            <Button 
              size="lg" 
              className="relative overflow-hidden bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground font-bold px-10 py-5 text-lg rounded-xl glow-cyan hover-glow btn-3d group border border-accent/30 backdrop-blur-sm transform-3d"
              onClick={scrollToVisualization}
            >
              <span className="relative z-10 flex items-center gap-2 layer-1">
                <Rocket className="w-5 h-5 group-hover:animate-bounce layer-2" />
                Explorar Visualização 3D
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Button>
            <Button 
            variant="outline" 
            size="lg" 
            className="relative glow-purple overflow-hidden border-2 border-[#8b5cf6]/50 bg-[#8b5cf6]/5 text-[#8b5cf6] hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6] font-bold px-10 py-5 text-lg rounded-xl hover:shadow-[0_0_20px_#8b5cf6] btn-3d group backdrop-blur-sm transform-3d"
            onClick={scrollToLearnMore}
          >
            <span className="relative z-10 flex items-center gap-2 layer-1">
              <ArrowDown className="w-5 h-5 group-hover:animate-bounce layer-2" />
              Saiba Mais
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b5cf6]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Button>
          </div>
        </div>

        {/* Scroll Indicator Aprimorado */}
        
      </div>
    </section>
  );
};

export default Hero;