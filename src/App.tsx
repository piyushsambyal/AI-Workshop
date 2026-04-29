import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Download, 
  Upload, 
  BarChart, 
  PieChart, 
  LineChart, 
  Activity, 
  Target, 
  Type, 
  Palette,
  Hash,
  X,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { 
  cn, 
  generateId, 
  calculateStats, 
  DEFAULT_COLORS, 
  CHART_TYPES, 
  ChartType, 
  Dataset, 
  DataPoint 
} from './lib/utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const INITIAL_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const INITIAL_DATASETS: Dataset[] = [
  {
    id: 'ds-1',
    name: 'Sales 2024',
    color: DEFAULT_COLORS[0],
    data: INITIAL_LABELS.map((label, idx) => ({
      id: generateId(),
      label,
      value: [45, 52, 38, 65, 48, 72][idx]
    }))
  },
  {
    id: 'ds-2',
    name: 'Sales 2023',
    color: DEFAULT_COLORS[1],
    data: INITIAL_LABELS.map((label, idx) => ({
      id: generateId(),
      label,
      value: [32, 45, 50, 48, 60, 55][idx]
    }))
  }
];

export default function App() {
  const [datasets, setDatasets] = useState<Dataset[]>(INITIAL_DATASETS);
  const [labels, setLabels] = useState<string[]>(INITIAL_LABELS);
  const [activeChartType, setActiveChartType] = useState<ChartType>('line');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0].id);
  const [csvInput, setCsvInput] = useState('');
  const [showCsvImporter, setShowCsvImporter] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync labels with first dataset if needed, but here we manage them globally for multi-dataset charts
  useEffect(() => {
    // Keep labels in sync with the data structure
    // In this app, we assume all datasets share the same labels for simplicity of comparison
  }, [datasets]);

  const activeDataset = useMemo(() => 
    datasets.find(d => d.id === selectedDatasetId) || datasets[0]
  , [datasets, selectedDatasetId]);

  const stats = useMemo(() => {
    const allValues = activeDataset.data.map(d => d.value);
    return calculateStats(allValues);
  }, [activeDataset]);

  // Chart Data Construction
  const chartData: ChartData<any> = useMemo(() => {
    const isSingleDataset = activeChartType === 'pie' || activeChartType === 'donut';
    const isScatter = activeChartType === 'scatter';
    
    if (isSingleDataset) {
      return {
        labels,
        datasets: [{
          label: activeDataset.name,
          data: activeDataset.data.map(d => d.value),
          backgroundColor: labels.map((_, i) => `${activeDataset.color}${Math.floor((0.8 - (i * 0.1)) * 255).toString(16).padStart(2, '0')}`),
          borderColor: activeDataset.color,
          borderWidth: 1,
        }]
      };
    }

    return {
      labels: isScatter ? undefined : labels,
      datasets: datasets.map(ds => ({
        type: activeChartType === 'area' ? 'line' : activeChartType === 'horizontalBar' ? 'bar' : activeChartType as any,
        label: ds.name,
        data: isScatter 
          ? ds.data.map((d, i) => ({ x: i, y: d.value })) 
          : ds.data.map(d => d.value),
        borderColor: ds.color,
        backgroundColor: activeChartType === 'area' ? `${ds.color}44` : ds.color,
        fill: activeChartType === 'area',
        tension: 0.4,
        indexAxis: activeChartType === 'horizontalBar' ? 'y' : 'x',
      }))
    };
  }, [datasets, labels, activeChartType, activeDataset]);

  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    plugins: {
      legend: {
        display: false, // We'll build a custom HTML legend as requested
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#f3f4f6' : '#111827',
        bodyColor: isDarkMode ? '#d1d5db' : '#4b5563',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat().format(context.parsed.y);
            } else if (context.parsed.x !== null) {
              label += new Intl.NumberFormat().format(context.parsed.x);
            }
            return label;
          }
        }
      }
    },
    scales: activeChartType === 'pie' || activeChartType === 'donut' ? {} : 
    activeChartType === 'radar' ? {
      r: {
        angleLines: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        pointLabels: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          font: {
            size: 10,
            weight: 'bold'
          }
        },
        ticks: {
          display: false
        }
      }
    } : {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }
      }
    }
  };

  // Handlers
  const addDataset = () => {
    const newId = generateId();
    const newDataset: Dataset = {
      id: newId,
      name: `Dataset ${datasets.length + 1}`,
      color: DEFAULT_COLORS[datasets.length % DEFAULT_COLORS.length],
      data: labels.map(l => ({ id: generateId(), label: l, value: Math.floor(Math.random() * 100) }))
    };
    setDatasets([...datasets, newDataset]);
    setSelectedDatasetId(newId);
  };

  const removeDataset = (id: string) => {
    if (datasets.length <= 1) return;
    const filtered = datasets.filter(ds => ds.id !== id);
    setDatasets(filtered);
    if (selectedDatasetId === id) setSelectedDatasetId(filtered[0].id);
  };

  const updateDatasetMetadata = (id: string, updates: Partial<Dataset>) => {
    setDatasets(datasets.map(ds => ds.id === id ? { ...ds, ...updates } : ds));
  };

  const addRow = () => {
    const newLabel = `New ${labels.length + 1}`;
    setLabels([...labels, newLabel]);
    setDatasets(datasets.map(ds => ({
      ...ds,
      data: [...ds.data, { id: generateId(), label: newLabel, value: 0 }]
    })));
  };

  const removeRow = (index: number) => {
    if (labels.length <= 1) return;
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    setLabels(newLabels);
    setDatasets(datasets.map(ds => {
      const newData = [...ds.data];
      newData.splice(index, 1);
      return { ...ds, data: newData };
    }));
  };

  const updateRow = (dsId: string, rowIndex: number, value: number) => {
    setDatasets(datasets.map(ds => {
      if (ds.id === dsId) {
        const newData = [...ds.data];
        newData[rowIndex].value = value;
        return { ...ds, data: newData };
      }
      return ds;
    }));
  };

  const updateLabel = (index: number, newLabel: string) => {
    const newLabels = [...labels];
    newLabels[index] = newLabel;
    setLabels(newLabels);
    setDatasets(datasets.map(ds => ({
      ...ds,
      data: ds.data.map((d, i) => i === index ? { ...d, label: newLabel } : d)
    })));
  };

  const handleCsvImport = () => {
    const rows = csvInput.split('\n').filter(r => r.trim());
    const newLabels: string[] = [];
    const newData: number[] = [];

    rows.forEach(row => {
      const [label, value] = row.split(',').map(s => s.trim());
      if (label && !isNaN(Number(value))) {
        newLabels.push(label);
        newData.push(Number(value));
      }
    });

    if (newLabels.length > 0) {
      setLabels(newLabels);
      // Update selected dataset with new data, others get 0s for missing indices or we could try to pad
      setDatasets(datasets.map(ds => {
        if (ds.id === selectedDatasetId) {
          return {
            ...ds,
            data: newLabels.map((l, i) => ({ id: generateId(), label: l, value: newData[i] }))
          };
        }
        return {
          ...ds,
          data: newLabels.map((l) => ({ id: generateId(), label: l, value: 0 }))
        };
      }));
      setCsvInput('');
      setShowCsvImporter(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans",
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-md px-6 py-4 flex items-center justify-between",
        isDarkMode ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white/80"
      )}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ApexInsights</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Analytics Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDarkMode ? "hover:bg-slate-800 text-yellow-400" : "hover:bg-slate-100 text-slate-600"
            )}
          >
            {isDarkMode ? <Palette size={20} /> : <Palette size={20} />}
          </button>
          
          <div className={cn(
            "h-8 w-[1px]",
            isDarkMode ? "bg-slate-800" : "bg-slate-200"
          )} />
          
          <button
            onClick={() => setShowCsvImporter(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-md shadow-blue-500/20"
          >
            <Upload size={16} />
            Import CSV
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Editor & Controls */}
        <aside className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          
          {/* Chart Type Selector */}
          <section className={cn(
            "p-5 rounded-2xl border shadow-sm",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart size={18} className="text-blue-500" />
                Visualization
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {CHART_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveChartType(type)}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl transition-all border",
                    activeChartType === type 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : isDarkMode 
                        ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200" 
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200 hover:text-slate-700"
                  )}
                >
                  {type === 'line' && <LineChart size={20} />}
                  {type === 'bar' && <BarChart size={20} />}
                  {type === 'area' && <Activity size={20} />}
                  {type === 'horizontalBar' && <BarChart className="rotate-90" size={20} />}
                  {type === 'pie' && <PieChart size={20} />}
                  {type === 'donut' && <Target size={20} />}
                  {type === 'scatter' && <Hash size={20} />}
                  {type === 'radar' && <Activity size={20} />}
                  <span className="text-[10px] mt-1 font-medium capitalize">{type === 'horizontalBar' ? 'H-Bar' : type}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Dataset Tabs */}
          <section className={cn(
            "h-full p-5 rounded-2xl border shadow-sm flex flex-col",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings2 size={18} className="text-blue-500" />
                Datasets
              </h3>
              <button 
                onClick={addDataset}
                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                title="Add Dataset"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
              {datasets.map(ds => (
                <button
                  key={ds.id}
                  onClick={() => setSelectedDatasetId(ds.id)}
                  className={cn(
                    "px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all border",
                    selectedDatasetId === ds.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                      : isDarkMode
                        ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-200"
                  )}
                >
                  {ds.name}
                </button>
              ))}
            </div>

            {/* Active Dataset Editor */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={activeDataset.name}
                      onChange={(e) => updateDatasetMetadata(activeDataset.id, { name: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg border text-sm font-medium outline-none transition-all",
                        isDarkMode ? "bg-slate-800 border-slate-700 focus:border-blue-500" : "bg-slate-50 border-slate-200 focus:border-blue-500"
                      )}
                    />
                    <Type className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Color</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={activeDataset.color}
                      onChange={(e) => updateDatasetMetadata(activeDataset.id, { color: e.target.value })}
                      className="w-full h-9 rounded-lg border border-transparent cursor-pointer overflow-hidden p-0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/10">
                <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Data Points</span>
                  <span>Value</span>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {labels.map((label, idx) => (
                    <div key={idx} className="group flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => updateLabel(idx, e.target.value)}
                        className={cn(
                          "flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium outline-none transition-all",
                          isDarkMode ? "bg-slate-800/50 border-slate-700/50 focus:border-blue-500" : "bg-slate-50/50 border-slate-100 focus:border-blue-500"
                        )}
                      />
                      <input
                        type="number"
                        value={activeDataset.data[idx].value}
                        onChange={(e) => updateRow(activeDataset.id, idx, Number(e.target.value))}
                        className={cn(
                          "w-20 px-3 py-1.5 rounded-lg border text-xs font-bold text-center outline-none transition-all",
                          isDarkMode ? "bg-slate-800 border-slate-700 focus:border-blue-500" : "bg-white border-slate-200 focus:border-blue-500"
                        )}
                      />
                      <button 
                        onClick={() => removeRow(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={addRow}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      isDarkMode 
                        ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300" 
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                    )}
                  >
                    <Plus size={14} /> Add Row
                  </button>
                  <button
                    onClick={() => removeDataset(activeDataset.id)}
                    disabled={datasets.length <= 1}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      datasets.length <= 1
                        ? "opacity-50 cursor-not-allowed bg-slate-100 border-slate-100 text-slate-400"
                        : "bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                    )}
                  >
                    <Trash2 size={14} /> Remove Dataset
                  </button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* Right Column: Charts & Stats */}
        <div className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
          
          {/* Stats Grid */}
          <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total Sum" value={stats.total.toLocaleString()} subValue="Across labels" icon={<Activity size={18} />} color="blue" isDarkMode={isDarkMode} />
            <StatCard label="Average" value={stats.average.toFixed(1)} subValue="Per data point" icon={<Target size={18} />} color="emerald" isDarkMode={isDarkMode} />
            <StatCard label="Maximum" value={stats.max.toLocaleString()} subValue="Peak value" icon={<ChevronDown size={18} className="rotate-180" />} color="amber" isDarkMode={isDarkMode} />
            <StatCard label="Minimum" value={stats.min.toLocaleString()} subValue="Floor value" icon={<ChevronDown size={18} />} color="rose" isDarkMode={isDarkMode} />
            <StatCard label="Count" value={stats.count.toString()} subValue="Data points" icon={<BarChart size={18} />} color="violet" isDarkMode={isDarkMode} />
          </section>

          {/* Main Chart Card */}
          <section className={cn(
            "flex-1 p-6 rounded-2xl border shadow-xl transition-all h-[500px] flex flex-col",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Real-time Visualization</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Feedback</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className={cn(
                  "p-2 rounded-lg border transition-colors",
                  isDarkMode ? "hover:bg-slate-800 border-slate-700" : "hover:bg-slate-50 border-slate-200"
                )}>
                  <Download size={18} />
                </button>
              </div>
            </div>

            <div 
              className="relative flex-1 min-h-0"
              role="img"
              aria-label={`Chart showing data for labels: ${labels.join(', ')}`}
            >
              <Chart 
                type={activeChartType === 'horizontalBar' ? 'bar' : activeChartType as any} 
                data={chartData} 
                options={chartOptions} 
              />
            </div>

            {/* Custom Legend */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 pt-4 border-t border-slate-200/10">
              {activeChartType === 'pie' || activeChartType === 'donut' ? (
                labels.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${activeDataset.color}${Math.floor((0.8 - (i * 0.1)) * 255).toString(16).padStart(2, '0')}` }} />
                    <span className="text-xs font-medium text-slate-500">{l}</span>
                  </div>
                ))
              ) : (
                datasets.map(ds => (
                  <div key={ds.id} className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-default">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                    <span className="text-xs font-bold">{ds.name}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* CSV Importer Modal */}
      <AnimatePresence>
        {showCsvImporter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-slate-950/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              <div className="p-6 border-b border-slate-200/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2 rounded-xl text-white">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">CSV Data Importer</h3>
                    <p className="text-xs text-slate-500">Paste your raw dataset below</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCsvImporter(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Format: Label, Value</label>
                  <textarea
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    placeholder="January, 45&#10;February, 52&#10;March, 38..."
                    className={cn(
                      "w-full h-48 px-4 py-3 rounded-xl border font-mono text-sm outline-none transition-all resize-none",
                      isDarkMode ? "bg-slate-800 border-slate-700 focus:border-emerald-500" : "bg-slate-50 border-slate-100 focus:border-emerald-500"
                    )}
                  />
                  <p className="text-[10px] text-slate-400 italic">This will replace only the currently selected dataset's values but will update global labels.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCsvImporter(false)}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                      isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCsvImport}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Process & Import
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className={cn(
        "max-w-7xl mx-auto p-6 text-center text-xs font-medium uppercase tracking-[0.2em] opacity-40 border-t mt-12 mb-6",
        isDarkMode ? "border-slate-800" : "border-slate-200"
      )}>
        &copy; 2026 ApexInsights Enterprise Analytics
      </footer>
    </div>
  );
}

function StatCard({ label, value, subValue, icon, color, isDarkMode }: { label: string, value: string, subValue: string, icon: React.ReactNode, color: string, isDarkMode: boolean }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
    violet: 'text-violet-500 bg-violet-500/10',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "p-4 rounded-2xl border shadow-sm transition-all",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      )}
    >
      <div className="flex items-center justify-between mb-3 text-slate-500">
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <div className={cn("p-1.5 rounded-lg", colorMap[color])}>
          {React.cloneElement(icon as React.ReactElement, { size: 14 })}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-xl font-black tracking-tight">{value}</div>
        <div className="text-[10px] font-medium text-slate-400 capitalize">{subValue}</div>
      </div>
    </motion.div>
  );
}
