import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Trash2, Search, Shield, Atom, Satellite } from "lucide-react";
import { useEffect, useState } from "react";
import { useScrollReveal, useStaggeredScrollReveal } from '@/hooks/useScrollReveal';

const Education = () => {
  const { elementRef: mainRef, isVisible } = useScrollReveal({ threshold: 0.2 });
  const { elementRef: originsRef, visibleItems: originsVisible } = useStaggeredScrollReveal(4, 200);
  const { elementRef: categoriesRef, visibleItems: categoriesVisible } = useStaggeredScrollReveal(4, 150);
  const { elementRef: solutionsRef, isVisible: solutionsVisible } = useScrollReveal({ threshold: 0.3 });
  const [activeTab, setActiveTab] = useState("origins");

  const origins = [
    {
      icon: Rocket,
      title: "Operações de Lançamento",
      description: "Estágios de foguetes gastos, carenagens de carga útil e detritos relacionados à missão deixados em órbita após lançamentos."
    },
    {
      icon: Satellite,
      title: "Satélites Fim-de-Vida",
      description: "Satélites inativos que completaram suas missões mas permanecem em órbita por décadas."
    },
    {
      icon: Atom,
      title: "Eventos de Fragmentação",
      description: "Explosões e colisões que quebram naves espaciais em milhares de pedaços menores."
    },
    {
      icon: Trash2,
      title: "Operações de Missão",
      description: "Ferramentas, equipamentos e materiais acidentalmente liberados durante caminhadas espaciais e implantações."
    }
  ];

  const categories = [
    { name: "Cargas Úteis Ativas", count: "~6.000", description: "Satélites e naves espaciais operacionais" },
    { name: "Cargas Úteis Inativas", count: "~3.000", description: "Satélites não funcionais ainda em órbita" },
    { name: "Corpos de Foguete", count: "~2.000", description: "Estágios superiores e impulsores gastos" },
    { name: "Detritos de Missão", count: "~23.000", description: "Fragmentos de quebras e operações" }
  ];

  return (
    <section ref={mainRef} id="education" className="py-24 px-6 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary rounded-full blur-2xl animate-pulse animation-delay-500" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header com Fade In */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-bold text-gradient-nebula mb-6 drop-shadow-2xl">
              Compreendendo o Lixo Espacial
            </h2>
            <div className="absolute inset-0 text-4xl md:text-6xl font-bold text-gradient-nebula opacity-20 blur-md -z-10">
              Compreendendo o Lixo Espacial
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Aprenda sobre as origens, classificação e esforços de mitigação em torno dos detritos orbitais.
          </p>
        </div>

        {/* Enhanced Tabbed Content */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-12 bg-card/30 border-gradient glass-effect-enhanced">
              <TabsTrigger 
                value="origins" 
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              >
                <span className="relative z-10">Origens</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </TabsTrigger>
              <TabsTrigger 
                value="mitigation" 
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              >
                <span className="relative z-10">Mitigação</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="origins" className="space-y-8 animate-fade-in">
              <div ref={originsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {origins.map((origin, index) => {
                  const Icon = origin.icon;
                  return (
                    <div
                      key={index}
                      className={`transition-all duration-700 ${
                        originsVisible[index] 
                          ? 'opacity-100 translate-y-0 scale-100' 
                          : 'opacity-0 translate-y-20 scale-95'
                      }`}
                    >
                      <Card className="glass-effect-enhanced border-gradient hover:glow-cyan transition-all duration-500 hover:scale-105 hover:-translate-y-2 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <CardHeader className="relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors relative">
                              <Icon className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 blur-sm opacity-50 group-hover:opacity-75 transition-opacity">
                              </div>
                            </div>
                            <CardTitle className="text-xl group-hover:text-accent transition-colors">{origin.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                          <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                            {origin.description}
                          </p>
                        </CardContent>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </Card>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-8 animate-fade-in">
              <div ref={categoriesRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-700 ${
                      categoriesVisible[index] 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-20 scale-95'
                    }`}
                  >
                    <Card className="glass-effect-enhanced border-gradient hover:glow-orange transition-all duration-500 hover:scale-105 group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="relative z-10">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl group-hover:text-highlight transition-colors">{category.name}</CardTitle>
                          <div className="text-3xl font-bold text-accent drop-shadow-lg group-hover:scale-110 transition-transform">{category.count}</div>
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {category.description}
                        </p>
                      </CardContent>
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-8 animate-fade-in">
              <Card ref={solutionsRef} className={`glass-effect-enhanced border-gradient hover:glow-purple transition-all duration-500 group relative overflow-hidden ${
                solutionsVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <div className="relative">
                      <Search className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 blur-sm opacity-50 group-hover:opacity-75 transition-opacity">
                        <Search className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                    Como Rastreamos o Lixo Espacial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-xl bg-accent/10 hover:bg-accent/20 transition-all duration-300 hover:scale-105 group/item relative overflow-hidden">
                      <div className="text-3xl font-bold text-accent mb-3 drop-shadow-lg group-hover/item:scale-110 transition-transform">Sistemas de Radar</div>
                      <div className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">Radares terrestres rastreiam objetos maiores que 10cm</div>
                      
                      {/* Pulse Effect */}
                      <div className="absolute inset-0 bg-accent/20 rounded-xl opacity-0 group-hover/item:opacity-100 animate-pulse transition-opacity" />
                    </div>
                    <div className="text-center p-6 rounded-xl bg-accent/10 hover:bg-accent/20 transition-all duration-300 hover:scale-105 group/item relative overflow-hidden">
                      <div className="text-3xl font-bold text-accent mb-3 drop-shadow-lg group-hover/item:scale-110 transition-transform">Telescópios Ópticos</div>
                      <div className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">Sensores espaciais para medições precisas</div>
                      
                      {/* Pulse Effect */}
                      <div className="absolute inset-0 bg-accent/20 rounded-xl opacity-0 group-hover/item:opacity-100 animate-pulse transition-opacity" />
                    </div>
                    <div className="text-center p-6 rounded-xl bg-accent/10 hover:bg-accent/20 transition-all duration-300 hover:scale-105 group/item relative overflow-hidden">
                      <div className="text-3xl font-bold text-accent mb-3 drop-shadow-lg group-hover/item:scale-110 transition-transform">Cerca Espacial</div>
                      <div className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">Radar avançado de banda S para rastreamento melhorado</div>
                      
                      {/* Pulse Effect */}
                      <div className="absolute inset-0 bg-accent/20 rounded-xl opacity-0 group-hover/item:opacity-100 animate-pulse transition-opacity" />
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                    A Rede de Vigilância Espacial da NASA opera uma rede global de radares terrestres e telescópios ópticos 
                    para rastrear detritos espaciais. Os dados são mantidos no Catálogo de Objetos Espaciais, que contém informações orbitais 
                    para mais de 16.308 objetos maiores que 10 centímetros.
                  </p>
                </CardContent>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Card>
            </TabsContent>

            <TabsContent value="mitigation" className="space-y-8 animate-fade-in">
              <Card className="glass-effect-enhanced border-gradient hover:glow-cyan transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 group-hover:text-accent transition-colors">
                    <div className="relative">
                      <Shield className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 blur-sm opacity-50 group-hover:opacity-75 transition-opacity">
                        <Shield className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                    Esforços de Mitigação de Detritos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 p-6 rounded-xl glass-effect transition-all duration-300 hover:scale-105 group/item">
                      <h4 className="text-lg font-semibold text-accent mb-4 group-hover/item:scale-110 transition-transform drop-shadow-lg">Medidas de Prevenção</h4>
                      <ul className="space-y-3 text-muted-foreground group-hover/item:text-foreground transition-colors">
                        <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          Regra de 25 anos de deorbita para satélites LEO
                        </li>
                        <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          Diretrizes de descarte pós-missão
                        </li>
                        <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          Manobras de prevenção de colisão
                        </li>
                        <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          Minimização de detritos relacionados à missão
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4 p-6 rounded-xl glass-effect hover:glow-orange transition-all duration-300 hover:scale-105 group/item">
                      <h4 className="text-lg font-semibold text-highlight mb-4 group-hover/item:scale-110 transition-transform drop-shadow-lg">Remoção Ativa</h4>
                      <ul className="space-y-3 text-muted-foreground group-hover/item:text-foreground transition-colors">
                        <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                          <div className="w-2 h-2 bg-highlight rounded-full" />
                          Missões de captura robótica
                        </li>
                        <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                          <div className="w-2 h-2 bg-highlight rounded-full" />
                          Remoção de detritos baseada em laser
                        </li>
                        <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                          <div className="w-2 h-2 bg-highlight rounded-full" />
                          Sistemas de amarras para deorbitação
                        </li>
                        <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                          <div className="w-2 h-2 bg-highlight rounded-full" />
                          Esforços de cooperação internacional
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                    Agências espaciais internacionais e empresas estão desenvolvendo tecnologias para remover ativamente detritos da órbita. 
                    Isso inclui missões como ClearSpace-1 da ESA e vários serviços comerciais de remoção de detritos.
                  </p>
                </CardContent>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default Education;