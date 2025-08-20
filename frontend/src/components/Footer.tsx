import { ExternalLink, Github, Globe, Mail } from "lucide-react";
import { useEffect, useState } from "react";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.querySelector('footer');
      if (element) {
        const rect = element.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight * 0.8);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const resources = [
    { name: "NASA ODPO", url: "#", description: "Escritório do Programa de Detritos Orbitais" },
    { name: "ESA Space Debris", url: "#", description: "Agência Espacial Europeia" },
    { name: "KeepTrack.space", url: "#", description: "API Educacional da NASA" },
    { name: "LeoLabs", url: "#", description: "Rastreamento Comercial" }
  ];

  const sources = [
    "Escritório do Programa de Detritos Orbitais da NASA",
    "Escritório de Detritos Espaciais da ESA",
    "Rede de Vigilância Espacial dos EUA",
    "Diretrizes de Mitigação de Detritos Espaciais do IADC"
  ];

  return (
    <footer className="py-16 px-6 relative overflow-hidden bg-primary/10 border-t border-border/20">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-accent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-highlight rounded-full blur-3xl animate-pulse animation-delay-1000" />
      </div>

      <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About com Efeitos */}
          <div className="space-y-4 group">
            <h3 className="text-xl font-bold text-gradient-aurora mb-4 group-hover:scale-105 transition-transform">
              Visualização de Lixo Espacial
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4 group-hover:text-foreground transition-colors">
              Uma plataforma educacional para visualizar e compreender o crescente problema 
              do lixo espacial ao redor da Terra. Construída para aumentar a conscientização sobre segurança orbital.
            </p>
            <div className="flex gap-4">
              <div className="group/icon relative">
                <Github className="w-5 h-5 text-muted-foreground hover:text-accent cursor-pointer transition-all duration-300 group-hover/icon:scale-125" />
                <div className="absolute inset-0 blur-sm opacity-50 group-hover/icon:opacity-75 transition-opacityabsolute w-5 h-5 blur-sm opacity-50 group-hover/icon:opacity-75 transition-opacity">
                  <Github className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="group/icon relative">
                <Globe className="w-5 h-5 text-muted-foreground hover:text-accent cursor-pointer transition-all duration-300 group-hover/icon:scale-125" />
                <div className="absolute inset-0 blur-sm opacity-50 group-hover/icon:opacity-75 transition-opacity">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="group/icon relative">
                <Mail className="w-5 h-5 text-muted-foreground hover:text-accent cursor-pointer transition-all duration-300 group-hover/icon:scale-125" />
                <div className="absolute inset-0 blur-sm opacity-50 group-hover/icon:opacity-75 transition-opacity">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Resources com Animações */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-aurora">Recursos</h3>
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-all duration-300 group hover:translate-x-2 glass-effect-enhanced p-3 rounded-lg hover:glow-cyan"
                >
                  <div className="relative">
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:scale-110 transition-all duration-300" />
                    <div className="absolute inset-0 blur-sm opacity-50 group-hover:opacity-75 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-accent" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium group-hover:text-accent transition-colors">{resource.name}</div>
                    <div className="text-xs group-hover:text-foreground transition-colors">{resource.description}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Data Sources com Efeitos */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-aurora">Fontes de Dados</h3>
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div 
                  key={index} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-2 cursor-pointer flex items-center gap-2 group"
                >
                  <div className="w-2 h-2 bg-accent rounded-full group-hover:scale-150 transition-transform glow-cyan" />
                  <span className="leading-relaxed">{source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom com Linha Animada */}
        <div className="pt-8 border-t border-border/20 relative">
          {/* Animated Border */}
          <div className="absolute top-0 left-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent w-full animate-shimmer" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground hover:text-foreground transition-colors group">
              <span className="group-hover:text-accent transition-colors">© 2025</span> Visualização de Lixo Espacial. Apenas para fins educacionais.
            </div>
            <div className="text-sm text-muted-foreground hover:text-foreground transition-colors group">
              Dados atualizados das redes oficiais de vigilância espacial
              <div className="w-2 h-2 bg-accent rounded-full inline-block ml-2 glow-cyan" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;