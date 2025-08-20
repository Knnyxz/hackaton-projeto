import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ResponsiveContainer } from "recharts";
import { Satellite, Globe, TrendingUp, Calendar, MapPin, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface SpaceObject {
  _id: string;
  objectName: string;
  country: string;
  countryCode: string;
  launchDate: string;
  massKg: number;
  type: number;
  company: string;
  rcs: number;
  lastUpdated: string;
  launchVehicle: string;
  altName: string;
  status: string | null;
}

const SpaceDebrisCharts = () => {
  const [data, setData] = useState<SpaceObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/space_debris');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleScroll = () => {
      const element = document.getElementById('space-charts');
      if (element) {
        const rect = element.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight * 0.8);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Processar dados para gráficos
  const countryData = data.reduce((acc, obj) => {
    const country = obj.country || 'Desconhecido';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryChartData = Object.entries(countryData)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const typeData = data.reduce((acc, obj) => {
    const typeMap: Record<number, string> = {
      1: 'Satélite',
      2: 'Corpo de Foguete',
      3: 'Detrito',
      4: 'Outros'
    };
    const typeName = typeMap[obj.type] || 'Desconhecido';
    acc[typeName] = (acc[typeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(typeData).map(([type, count]) => ({ type, count }));

  const launchYearData = data.reduce((acc, obj) => {
    if (obj.launchDate) {
      const year = obj.launchDate.split(' ')[0];
      if (year && year.length === 4 && parseInt(year) > 1950) {
        acc[year] = (acc[year] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  const launchYearChartData = Object.entries(launchYearData)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year)
    .filter(item => item.year >= 1960);

  const massData = data
    .filter(obj => obj.massKg > 0 && obj.massKg < 10000)
    .map(obj => ({
      mass: obj.massKg,
      rcs: obj.rcs,
      name: obj.objectName,
      country: obj.country
    }));

  const chartConfig = {
    count: {
      label: "Quantidade",
      color: "hsl(var(--accent))",
    },
    mass: {
      label: "Massa (kg)",
      color: "hsl(var(--highlight))",
    },
    rcs: {
      label: "RCS",
      color: "hsl(var(--accent))",
    },
  };

  const COLORS = [
    'hsl(var(--accent))',
    'hsl(var(--highlight))',
    'hsl(var(--destructive))',
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff88'
  ];

  if (loading) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-effect-enhanced border-gradient">
                <CardHeader>
                  <div className="h-6 bg-accent/20 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-accent/10 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="space-charts" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-bold text-gradient-nebula mb-6">
              Análise de Dados
            </h2>
            <div className="absolute inset-0 text-4xl md:text-6xl font-bold text-gradient-nebula opacity-20 blur-md -z-10">
              Análise de Dados
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Visualizações interativas dos dados de lixo espacial. Total de {data.length} objetos analisados.
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Countries Chart */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <Card className="glass-effect-enhanced border-gradient hover:glow-cyan transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 group-hover:text-accent transition-colors">
                  <div className="relative">
                    <Globe className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 blur-sm opacity-50">
                      <Globe className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  Objetos por País (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <ChartContainer config={chartConfig} className="h-64">
                  <BarChart data={countryChartData}>
                    <XAxis 
                      dataKey="country" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Card>
          </div>

          {/* Type Distribution */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '150ms' }}>
            <Card className="glass-effect-enhanced border-gradient hover:glow-purple transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 group-hover:text-highlight transition-colors">
                  <div className="relative">
                    <Satellite className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 blur-sm opacity-50">
                      <Satellite className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  Distribuição por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <ChartContainer config={chartConfig} className="h-64">
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Card>
          </div>

          {/* Launch Years Timeline */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '300ms' }}>
            <Card className="glass-effect-enhanced border-gradient hover:glow-purple transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 blur-sm opacity-50">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  Lançamentos por Ano
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <ChartContainer config={chartConfig} className="h-64">
                  <LineChart data={launchYearChartData}>
                    <XAxis 
                      dataKey="year" 
                      tick={{ fontSize: 12 }}
                      type="number"
                      domain={['dataMin', 'dataMax']}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--highlight))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Card>
          </div>

          {/* Mass vs RCS Scatter */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '450ms' }}>
            <Card className="glass-effect-enhanced border-gradient hover:glow-cyan transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 group-hover:text-accent transition-colors">
                  <div className="relative">
                    <Zap className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 blur-sm opacity-50">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  Massa vs RCS (Seção Transversal)
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <ChartContainer config={chartConfig} className="h-64">
                  <ScatterChart data={massData.slice(0, 100)}>
                    <XAxis 
                      type="number" 
                      dataKey="mass" 
                      name="Massa (kg)"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="rcs" 
                      name="RCS"
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Scatter 
                      name="Objetos" 
                      dataKey="rcs" 
                      fill="hsl(var(--accent))"
                      fillOpacity={0.6}
                    />
                  </ScatterChart>
                </ChartContainer>
              </CardContent>
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Card>
          </div>
        </div>

        {/* Summary Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '600ms' }}>
          <Card className="glass-effect-enhanced border-gradient hover:glow-cyan transition-all duration-500 group text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent mb-1">{data.length}</div>
              <div className="text-sm text-muted-foreground">Total de Objetos</div>
            </CardContent>
          </Card>
          <Card className="glass-effect-enhanced border-gradient hover:glow-purple transition-all duration-500 group text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-highlight mb-1">{Object.keys(countryData).length}</div>
              <div className="text-sm text-muted-foreground">Países/Organizações</div>
            </CardContent>
          </Card>
          <Card className="glass-effect-enhanced border-gradient hover:glow-purple transition-all duration-500 group text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary mb-1">{data.filter(obj => obj.massKg > 0).length}</div>
              <div className="text-sm text-muted-foreground">Com Dados de Massa</div>
            </CardContent>
          </Card>
          <Card className="glass-effect-enhanced border-gradient hover:glow-cyan transition-all duration-500 group text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent mb-1">{Math.round(data.filter(obj => obj.massKg > 0).reduce((sum, obj) => sum + obj.massKg, 0) / 1000)}</div>
              <div className="text-sm text-muted-foreground">Toneladas (Total)</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SpaceDebrisCharts;