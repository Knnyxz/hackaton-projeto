import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, MousePointer2, Zap, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useScrollReveal, useStaggeredScrollReveal } from '@/hooks/useScrollReveal';

const Visualization = () => {
  const { elementRef: mainRef, isVisible } = useScrollReveal({ threshold: 0.2 });
  const { elementRef: controlsRef, visibleItems: controlsVisible } = useStaggeredScrollReveal(4, 150);
  const { elementRef: visualRef, isVisible: visualVisible } = useScrollReveal({ threshold: 0.3 });


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
            <div className="aspect-video bg-gradient-to-br from-primary via-secondary to-primary/80 relative">
              {/* Animated Background Grid */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `linear-gradient(hsl(var(--accent) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent) / 0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }} />
              
              {/* Central Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center relative">
                  <div className="relative mb-6">
                    <Monitor className="w-20 h-20 text-accent mx-auto animate-glow-pulse" />
                    <div className="absolute inset-0 blur-md opacity-50">
                      <Monitor className="w-20 h-20 text-accent mx-auto" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gradient-aurora mb-4">
                    Visualização 3D em Breve
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    A visualização interativa de lixo espacial será incorporada aqui
                  </p>
                </div>
              </div>
              
              {/* Enhanced Animated particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full animate-orbit glow-cyan"
                    style={{
                      width: `${Math.random() * 3 + 1}px`,
                      height: `${Math.random() * 3 + 1}px`,
                      left: `${35 + Math.random() * 30}%`,
                      top: `${35 + Math.random() * 30}%`,
                      animationDelay: `${Math.random() * 20}s`,
                      animationDuration: `${15 + Math.random() * 10}s`,
                      background: i % 3 === 0 ? 'hsl(var(--accent))' : i % 3 === 1 ? 'hsl(var(--highlight))' : 'hsl(var(--destructive))',
                      boxShadow: `0 0 ${Math.random() * 15 + 5}px currentColor`,
                    }}
                  />
                ))}
              </div>

              {/* Floating Data Points */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`data-${i}`}
                  className="absolute text-xs font-mono text-accent/60 animate-pulse"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                >
                  {Math.floor(Math.random() * 9999)}
                </div>
              ))}
            </div>
          </Card>
          
        </div>
      </div>
    </section>
  );
};

export default Visualization;