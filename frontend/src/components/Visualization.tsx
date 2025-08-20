import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, MousePointer2, Zap, Eye, Maximize, Minimize, Satellite, MapPin, Globe, Database, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useScrollReveal, useStaggeredScrollReveal } from '@/hooks/useScrollReveal';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SpaceDebris {
  _id: string;
  objectName: string;
  altName: string;
  company: string;
  country: string;
  lastUpdated: string;
  launchDate: string;
  launchVehicle: string;
  massKg: number;
  shape: string | null;
  tle1: string;
  tle2: string;
  type: number;
  bus: string | null;
  countryCode: string;
  diameter: number;
  dryMass: number;
  launchMass: number;
  launchPad: string;
  launchSite: string;
  length: number;
  manufacturer: string | null;
  payload: string | null;
  rcs: number;
  span: number;
  stableDate: string;
  status: string | null;
  vmag: number | null;
}

const Visualization = () => {
  const { elementRef: mainRef, isVisible } = useScrollReveal({ threshold: 0.2 });
  const { elementRef: controlsRef, visibleItems: controlsVisible } = useStaggeredScrollReveal(4, 150);
  const { elementRef: visualRef, isVisible: visualVisible } = useScrollReveal({ threshold: 0.3 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [spaceDebris, setSpaceDebris] = useState<SpaceDebris[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebris, setSelectedDebris] = useState<SpaceDebris | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  // Fetch space debris data from backend
  const fetchSpaceDebris = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      let url = `http://localhost:3000/space_debris/filtered?limit=${itemsPerPage}&offset=${offset}`;
      
      if (selectedCountry) url += `&country=${encodeURIComponent(selectedCountry)}`;
      if (selectedCompany) url += `&company=${encodeURIComponent(selectedCompany)}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setSpaceDebris(data);
      
      // Fetch total count for pagination
      const countResponse = await fetch('http://localhost:3000/space_debris/count');
      const countData = await countResponse.json();
      setTotalCount(countData.count);
    } catch (error) {
      console.error('Error fetching space debris:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('http://localhost:3000/space_debris/countries');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:3000/space_debris/companies');
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    const fetchStatistics = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('http://localhost:3000/space_debris/statistics');
        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchCountries();
    fetchCompanies();
    fetchStatistics();
  }, []);
  
  // Fetch debris when filters or pagination change
  useEffect(() => {
    fetchSpaceDebris();
  }, [currentPage, selectedCountry, selectedCompany, searchTerm]);

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
      if (visualContainer?.requestFullscreen) {
        visualContainer.requestFullscreen();
      } else if (visualContainer?.webkitRequestFullscreen) {
        visualContainer.webkitRequestFullscreen();
      } else if (visualContainer?.msRequestFullscreen) {
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

  // Function to handle debris selection
  const handleDebrisSelect = (debris: SpaceDebris) => {
    setSelectedDebris(debris);
    setShowDetails(true);
  };

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

        {/* Space Debris Data Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gradient-nebula mb-4">Dados de Detritos Espaciais</h3>
            <p className="text-muted-foreground">Informações dos objetos rastreados em órbita</p>
          </div>

          {/* Filters and Search */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-accent" />
                <h4 className="text-lg font-semibold">Filtros e Busca</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                {/* Country Filter */}
                <Select value={selectedCountry || 'all'} onValueChange={(value) => {
                  setSelectedCountry(value === 'all' ? '' : value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os países</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Company Filter */}
                <Select value={selectedCompany || 'all'} onValueChange={(value) => {
                  setSelectedCompany(value === 'all' ? '' : value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCountry('');
                    setSelectedCompany('');
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
              
              {/* Results Info */}
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Mostrando {spaceDebris.length} de {totalCount.toLocaleString()} objetos
              </div>
            </Card>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {spaceDebris.map((debris) => (
                  <Card 
                    key={debris._id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-accent"
                    onClick={() => handleDebrisSelect(debris)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{debris.objectName}</CardTitle>
                        <Badge variant={debris.type === 1 ? "default" : "secondary"}>
                          {debris.type === 1 ? "Satélite" : "Detrito"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{debris.country}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Database className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{debris.massKg} kg</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Satellite className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="truncate">{debris.launchDate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalCount > itemsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Página {currentPage} de {Math.ceil(totalCount / itemsPerPage)}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
                    className="flex items-center gap-2"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Debris Detail Modal */}
        {showDetails && selectedDebris && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold">{selectedDebris.objectName}</h3>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Informações Básicas</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome Alternativo:</span>
                        <span>{selectedDebris.altName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span>{selectedDebris.type === 1 ? "Satélite" : "Detrito"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">País:</span>
                        <span>{selectedDebris.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empresa:</span>
                        <span>{selectedDebris.company}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Especificações</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Massa:</span>
                        <span>{selectedDebris.massKg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Lançamento:</span>
                        <span>{selectedDebris.launchDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Veículo de Lançamento:</span>
                        <span>{selectedDebris.launchVehicle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Local de Lançamento:</span>
                        <span>{selectedDebris.launchSite}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Dados Técnicos</h4>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>{selectedDebris.tle1}</div>
                    <div>{selectedDebris.tle2}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

<div className="mt-16">
  <div className="text-center mb-8">
    <h3 className="text-3xl font-bold text-gradient-nebula mb-4">Estatísticas de Detritos Espaciais</h3>
    <p className="text-muted-foreground">Análise detalhada dos objetos em órbita</p>
  </div>

  {statsLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      ))}
    </div>
  ) : statistics && (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-accent mb-2">{statistics.totalCount?.toLocaleString()}</div>
          <p className="text-muted-foreground">Total de Objetos</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-accent mb-2">
            {statistics.massStats?.totalMass ? Math.round(statistics.massStats.totalMass).toLocaleString() : 'N/A'}
          </div>
          <p className="text-muted-foreground">Massa Total (kg)</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-accent mb-2">
            {statistics.byType?.find((t: any) => t._id === 1)?.count.toLocaleString() || '0'}
          </div>
          <p className="text-muted-foreground">Satélites</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-accent mb-2">
            {statistics.byType?.find((t: any) => t._id === 3)?.count.toLocaleString() || '0'}
          </div>
          <p className="text-muted-foreground">Detritos</p>
        </Card>
      </div>

      {/* Additional statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h4 className="font-semibold mb-4 text-lg">Top 5 Empresas que Mais Lançaram Lixos Espaciais</h4>
          <div className="space-y-3">
            {statistics.byCompany?.slice(0, 5).map((company: any) => (
              <div key={company._id} className="flex justify-between items-center">
                <span className="text-muted-foreground">{company._id || 'Desconhecida'}</span>
                <span className="font-medium">{company.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4 text-lg">Distribuição por Tipo de Órbita</h4>
          <div className="space-y-3">
            {statistics.orbitDistribution?.map((orbit: any) => (
              <div key={orbit._id} className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {orbit.orbitType === 'LEO' ? 'LEO (Órbita Baixa)' : 
                   orbit.orbitType === 'MEO' ? 'MEO (Órbita Média)' : 
                   orbit.orbitType === 'GEO' ? 'GEO (Órbita Geoestacionária)' : 
                   orbit.orbitType || 'Desconhecida'}
                </span>
                <span className="font-medium">{orbit.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <h4 className="font-semibold mb-4 text-lg">Distribuição por Peso</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statistics.sizeDistribution?.map((size: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-xl font-bold text-accent mb-1">{size.count.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {size._id === 0 ? '< 100kg' : 
                 size._id === 100 ? '100-500kg' : 
                 size._id === 500 ? '500kg-1t' : 
                 size._id === 1000 ? '1-5t' : 
                 size._id === 5000 ? '5-10t' : 
                 '> 10t'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Média: {size.avgMass ? `${Math.round(size.avgMass)}kg` : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )}
</div>

      {/* Fullscreen styles */}
      <style>{`
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