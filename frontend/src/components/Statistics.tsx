import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Globe, Satellite, Zap, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useScrollReveal, useStaggeredScrollReveal } from '@/hooks/useScrollReveal';

const Statistics = () => {
  const [scrollY, setScrollY] = useState(0);
  const { elementRef: mainRef, isVisible } = useScrollReveal({ threshold: 0.2 });
  const { elementRef: statsRef, visibleItems: statsVisible } = useStaggeredScrollReveal(4, 150);
  const { elementRef: orbitsRef, isVisible: orbitsVisible } = useScrollReveal({ threshold: 0.3 });
  const { elementRef: incidentsRef, isVisible: incidentsVisible } = useScrollReveal({ threshold: 0.3 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainStats = [
    {
      icon: Satellite,
      title: "Total de Objetos Rastreados",
      value: "16.308",
      description: "Objetos maiores que 10cm em órbita",
      color: "text-accent"
    },
    {
      icon: Zap,
      title: "Pequenos Detritos Estimados",
      value: "900.000+",
      description: "Objetos entre 1-10cm",
      color: "text-highlight"
    },
    {
      icon: AlertTriangle,
      title: "Taxa de Crescimento Anual",
      value: "5-10%",
      description: "Aumento em objetos rastreados",
      color: "text-destructive"
    }
  ];

  const countries = [
    { name: "Estados Unidos", objects: 10713, percentage: 65.69 },
    { name: "China", objects: 1132, percentage: 6.94 },
    { name: "União Soviética", objects: 1083, percentage: 6.64 },
    { name: "Reino Unido", objects: 779, percentage: 4.78 },
    { name: "Russia", objects: 748, percentage: 4.59 },
    { name: "Outros", objects: 1.853, percentage: 11.36 }
  ];

  return (
    <section ref={mainRef} id="statistics" className="py-24 px-6 relative overflow-hidden ">

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header com Fade In */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-bold text-gradient-nebula mb-6">
              Os Números
            </h2>
            <div className="absolute inset-0 text-4xl md:text-6xl font-bold text-gradient-nebula opacity-20 blur-md -z-10">
              Os Números
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed ">
            Compreendendo a escala do lixo espacial através de análise abrangente de dados e estatísticas de rastreamento.
          </p>
        </div>

        {/* Main Statistics com Animações Escalonadas */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  statsVisible[index] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-20 scale-95'
                }`}
              >
                <Card className="glass-effect-enhanced border-gradient hover:glow-cyan transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors relative layer-1">
                        <Icon className="w-5 h-5 text-accent group-hover:scale-110 transition-transform layer-2" />
                        <div className="absolute inset-0 blur-sm opacity-50 group-hover:opacity-75 transition-opacity">
                        </div>
                      </div>
                      <CardTitle className="text-sm group-hover:text-accent transition-colors">{stat.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-2 ${stat.color} group-hover:scale-110 transition-transform`}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {stat.description}
                    </p>
                  </CardContent>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Card>
              </div>
            );
          })}
        </div>

        {/* Altitude and Country Distribution */}
        <div ref={orbitsRef} className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-16">
          

          {/* Country Distribution */}
          <Card className={`glass-effect-enhanced border-gradient hover:glow-purple transition-all duration-700 group relative overflow-hidden ${
             orbitsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
           }`} style={{ transitionDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 group-hover:text-highlight transition-colors">
                <div className="relative">
                  <Users className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 blur-sm opacity-50 group-hover:opacity-75 transition-opacity">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                </div>
                Detritos por País/Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {countries.map((country, index) => (
                <div key={index} className="space-y-2 group/item hover:translate-x-2 transition-transform duration-300">
                  <div className="flex justify-between items-center">
                    <span className="font-medium group-hover/item:text-highlight transition-colors">{country.name}</span>
                    <div className="text-right">
                      <div className="font-bold text-accent group-hover/item:scale-110 transition-transform">{country.objects.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">{country.percentage}%</div>
                    </div>
                  </div>
                  <Progress value={country.percentage} className="h-3 group-hover/item:h-4 transition-all duration-300" />
                </div>
              ))}
            </CardContent>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Card>
        </div>

        {/* Key Incidents com Efeitos Visuais */}
        <div ref={incidentsRef} className={`transition-all duration-1000 ${
          incidentsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <Card className="glass-effect-enhanced border-gradient transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 group-hover:text-destructive transition-colors">
                <div className="relative">
                  <AlertTriangle className="w-5 h-5 text-destructive group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 blur-sm opacity-50 group-hover:opacity-75 transition-opacity">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                </div>
                Principais Eventos de Lixo Espacial
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-all duration-300 group/item">
                  <div className="text-3xl font-bold text-destructive mb-3">2009</div>
                  <div className="font-medium mb-2 group-hover/item:text-destructive transition-colors">Colisão Iridium-Cosmos</div>
                  <div className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">Criou 2.000+ fragmentos rastreáveis</div>
                </div>
                <div className="text-center p-6 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-all duration-300 group/item">
                  <div className="text-3xl font-bold text-destructive mb-3">2007</div>
                  <div className="font-medium mb-2 group-hover/item:text-destructive transition-colors">Teste ASAT Chinês</div>
                  <div className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">Gerou 3.000+ pedaços de detrito</div>
                </div>
                <div className="text-center p-6 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-all duration-300 group/item">
                  <div className="text-3xl font-bold text-destructive mb-3">1996</div>
                  <div className="font-medium mb-2 group-hover/item:text-destructive transition-colors">Satélite Cerise Atingido</div>
                  <div className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">Primeira colisão confirmada de detrito</div>
                </div>
              </div>
            </CardContent>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Statistics;