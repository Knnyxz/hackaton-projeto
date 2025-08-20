import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, MousePointer2, Zap, Eye, Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";
import { useScrollReveal, useStaggeredScrollReveal } from '@/hooks/useScrollReveal';

const Visualization = () => {
  const { elementRef: mainRef, isVisible } = useScrollReveal({ threshold: 0.2 });
  const { elementRef: controlsRef, visibleItems: controlsVisible } = useStaggeredScrollReveal(4, 150);
  const { elementRef: visualRef, isVisible: visualVisible } = useScrollReveal({ threshold: 0.3 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const controls = [
    {
      icon: MousePointer2,
      title: "Clique e Arraste",
      description: "Gire a Terra para ver os detritos de diferentes ângulos"
    },
    {
      icon: Eye,
      title: "Role para Zoom",
      description: "Aproxime-se para ver objetos individuais em detalhes"
    },
    {
      icon: Zap,
      title: "Dados Semanais",
      description: "Dados de rastreamento das redes de vigilância espacial"
    },
    {
      icon: Monitor,
      title: "Interface Interativa",
      description: "Clique nos objetos para ver informações detalhadas"
    }
  ];

  // Fullscreen functionality
  const toggleFullscreen = () => {
    const visualContainer = document.getElementById('visualization-container');
    
    if (!isFullscreen) {
      if (visualContainer.requestFullscreen) {
        visualContainer.requestFullscreen();
      } else if (visualContainer.webkitRequestFullscreen) {
        visualContainer.webkitRequestFullscreen();
      } else if (visualContainer.msRequestFullscreen) {
        visualContainer.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <section ref={mainRef} id="visualization" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header com Fade In */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-bold text-gradient-nebula mb-6">
              Visualização 3D Interativa
            </h2>
            <div className="absolute inset-0 text-4xl md:text-6xl font-bold text-gradient-nebula opacity-20 blur-md -z-10">
              Visualização 3D Interativa
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Experimente a realidade do lixo espacial através do nosso modelo 3D interativo. 
            Veja como milhares de objetos orbitam nosso planeta.
          </p>
        </div>

        {/* Controls Guide com Animações Escalonadas */}
        <div ref={controlsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {controls.map((control, index) => {
            const Icon = control.icon;
            return (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  controlsVisible[index] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-20 scale-95'
                }`}
              >
                <Card className="glass-effect-enhanced border-gradient text-center hover:glow-cyan transition-all duration-500 hover:scale-105 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex justify-center mb-3 relative">
                      <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors relative">
                        <Icon className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 blur-sm opacity-50 group-hover:opacity-75 transition-opacity">
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-accent transition-colors">{control.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {control.description}
                    </p>
                  </CardContent>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Card>
              </div>
            );
          })}
        </div>

        {/* Visualization Container com Efeitos Avançados */}
        <div ref={visualRef} className={`relative transition-all duration-1000 ${
          visualVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
        }`}>
          <Card className="border-gradient glass-effect-enhanced p-0 overflow-hidden hover:glow-cyan transition-all duration-500 group">
            <div 
              id="visualization-container"
              className={`relative ${isFullscreen ? 'h-screen' : 'aspect-video'} bg-gradient-to-br from-primary via-secondary to-primary/80`}
            >
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40 group/btn"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                ) : (
                  <Maximize className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                )}
              </button>

              {/* Iframe that fills the container */}
              <iframe 
                src="../../../RenderTerra/index.html"
                title="3D Space Debris Visualization"
                className="w-full h-full border-0"
                allow="fullscreen"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Fullscreen styles */}
      <style jsx>{`
        #visualization-container:fullscreen {
          background: #000;
        }
        #visualization-container:-webkit-full-screen {
          background: #000;
        }
        #visualization-container:-moz-full-screen {
          background: #000;
        }
        #visualization-container:-ms-fullscreen {
          background: #000;
        }
      `}</style>
    </section>
  );
};

export default Visualization;