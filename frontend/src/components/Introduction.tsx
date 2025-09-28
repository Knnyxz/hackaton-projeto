import { AlertTriangle, Orbit, Satellite, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

const Introduction = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const element = document.getElementById('introduction');
      if (element) {
        const rect = element.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight * 0.8);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const threats = [
    {
      icon: <Satellite className="w-8 h-8 text-accent" />,
      title: "Satélites Mortos",
      description: "Milhares de satélites inativos continuam orbitando a Terra, criando riscos de colisão.",
      stat: "3.000+"
    },
    {
      icon: <Zap className="w-8 h-8 text-highlight" />,
      title: "Fragmentos de Colisão",
      description: "Pedaços criados por colisões de satélites viajam a velocidades devastadoras.",
      stat: "900K+"
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-destructive" />,
      title: "Eventos Críticos",
      description: "Até flocos de tinta podem destruir componentes de naves espaciais em velocidades orbitais.",
      stat: "28.000 km/h"
    },
    {
      icon: <Orbit className="w-8 h-8 text-primary" />,
      title: "Tempo de Decaimento",
      description: "Objetos em órbita baixa podem levar décadas para naturalmente sair de órbita.",
      stat: "25+ anos"
    }
  ];

  return (
    <section id="introduction" className="py-24 px-6 relative overflow-hidden">

      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header com Fade In */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-nebula mb-8 leading-tight">
              O Crescente Problema do Lixo Espacial
            </h2>
            <div className="absolute inset-0 text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-nebula opacity-20 blur-md -z-10">
              O Crescente Problema do Lixo Espacial
            </div>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed text-balance">
            Todo objeto lançado ao espaço eventualmente se torna lixo espacial. De estágios de foguetes gastos 
            a flocos de tinta, esses objetos representam uma ameaça crescente à nossa infraestrutura espacial 
            e aos futuros esforços de exploração.
          </p>
        </div>

        {/* Threat Cards com Animações Escalonadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {threats.map((threat, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <Card className="card-cosmic hover-glow card-3d-tilt group cursor-pointer relative overflow-hidden h-full transform-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="text-center relative z-10 pb-4">
                  <div className="mb-6 flex justify-center relative layer-1">
                    <div className="relative p-3 rounded-full bg-gradient-to-br from-accent/10 to-highlight/10 group-hover:from-accent/20 group-hover:to-highlight/20 transition-all duration-300 layer-2">
                      <div className="relative z-10">
                        {threat.icon}
                      </div>

                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-accent transition-colors duration-300 mb-3">
                    {threat.title}
                  </CardTitle>
                  <div className="text-2xl md:text-3xl font-bold text-gradient-nebula group-hover:scale-110 transition-transform duration-300">
                    {threat.stat}
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <CardDescription className="text-center group-hover:text-foreground transition-colors duration-300 text-sm leading-relaxed">
                    {threat.description}
                  </CardDescription>
                </CardContent>
                
                {/* Enhanced Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Card>
            </div>
          ))}
        </div>

        {/* Key Facts com Efeitos Visuais */}
        <div className={`card-cosmic card-3d relative overflow-hidden p-10 transition-all duration-1000 transform-3d ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Enhanced Background Animated Pattern */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-0 w-24 h-24 bg-accent rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-36 h-36 bg-highlight rounded-full blur-2xl animate-pulse animation-delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-primary rounded-full blur-lg animate-pulse animation-delay-500" />
            <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-accent rounded-full blur-lg animate-pulse animation-delay-700" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient-nebula">
              Fatos Críticos Sobre Lixo Espacial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="flex items-start gap-5 group hover:translate-x-1 hover-glow card-3d transition-all duration-300 p-4 rounded-lg hover:bg-accent/5 transform-3d">
                  <div className="w-4 h-4 bg-accent rounded-full mt-2 group-hover:scale-150 transition-all duration-300" style={{boxShadow: 'var(--glow-cyan)'}} />
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                    <strong className="text-accent font-bold">Síndrome de Kessler:</strong> Um cenário teórico onde 
                    a densidade de objetos em órbita é alta o suficiente para que colisões causem uma cascata 
                    de mais colisões.
                  </p>
                </div>
                <div className="flex items-start gap-5 group hover:translate-x-1 hover-glow transition-all duration-300 p-4 rounded-lg hover:bg-highlight/5">
                  <div className="w-4 h-4 bg-highlight rounded-full mt-2 group-hover:scale-150 transition-all duration-300" style={{boxShadow: 'var(--glow-purple)'}} />
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                    <strong className="text-highlight font-bold">Limitações de Rastreamento:</strong> Só podemos rastrear 
                    objetos maiores que 10cm em órbita baixa, perdendo milhões de fragmentos menores perigosos.
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-start gap-5 group hover:translate-x-1 hover-glow transition-all duration-300 p-4 rounded-lg hover:bg-primary/5">
                  <div className="w-4 h-4 bg-sky-400 rounded-full mt-2 group-hover:scale-150 transition-all duration-300" style={{boxShadow: 'var(--glow-purple)'}} />
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                    <strong className="text-sky-400 font-bold">Impacto Econômico:</strong> O lixo espacial ameaça
                    mais de $300 bilhões em satélites e infraestrutura espacial atualmente em órbita.
                  </p>
                </div>
                <div className="flex items-start gap-5 group hover:translate-x-3 hover-glow transition-all duration-300 p-4 rounded-lg hover:bg-destructive/5">
                  <div className="w-4 h-4 bg-destructive rounded-full mt-2 group-hover:scale-150 transition-all duration-300" />
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                    <strong className="text-destructive font-bold">Manobras da ISS:</strong> A Estação Espacial Internacional 
                    teve que realizar manobras de emergência múltiplas vezes para evitar colisões potencialmente catastróficas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Introduction;