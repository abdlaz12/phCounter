import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Leaf, Activity, ArrowUpRight, ArrowDownRight, Download, Plus, Loader2, Cpu, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StatCard = ({ title, value, unit, trend, icon: Icon, trendType }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex justify-between items-start">
    <div>
      <p className="text-sm font-medium text-emerald-600/70">{title}</p>
      <h3 className="text-3xl font-bold mt-1 text-slate-900">
        {value}<span className="text-lg text-emerald-500 font-normal ml-1">{unit}</span>
      </h3>
      <div className={`flex items-center gap-1 mt-2 text-sm ${trendType === 'up' ? 'text-emerald-600' : trendType === 'down' ? 'text-orange-500' : 'text-slate-400'}`}>
        {trendType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : trendType === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
        <span className="font-semibold">{trend}</span>
        <span className="text-slate-400 ml-1">{trendType === 'neutral' ? '' : 'vs last record'}</span>
      </div>
    </div>
    <div className={`p-3 rounded-2xl ${title.includes('Critical') && value > 0 ? 'bg-red-500' : 'bg-[#10B981]'} text-white shadow-lg shadow-emerald-100`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [sensorLogs, setSensorLogs] = useState([]);
  const [activeBatch, setActiveBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // Sesuai DOC-2 F-04: Filter rentang waktu (7 hari, 30 hari, Semua)
  const [timeRange, setTimeRange] = useState('7d'); 

  const [stats, setStats] = useState({
    avgPh: 0,
    optimalPercent: 100,
    activeCount: 0,
    criticalCount: 0
  });

  const fetchDashboardData = async () => {
    try {
      const batchRes = await apiRequest('/api/batches');
      if (batchRes.success) {
        const active = batchRes.data.find(b => b.status === 'Aktif' || b.status === 'Processing');
        setActiveBatch(active);
        const processingCount = batchRes.data.filter(b => b.status === 'Aktif' || b.status === 'Processing').length;

        if (active) {
          // Menambahkan parameter range ke API sesuai DOC-2
          const sensorRes = await apiRequest(`/api/readings/chart?batchId=${active._id}&range=${timeRange}`);

          if (sensorRes.success && sensorRes.data.length > 0) {
            const rawData = sensorRes.data;
            const formattedData = rawData.map(log => ({
              name: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fullDate: new Date(log.timestamp).toLocaleDateString(),
              ph: log.phValue,
              status: log.status
            })).reverse(); // Reverse agar urutan waktu dari kiri ke kanan (lama ke baru)

            setSensorLogs(formattedData);

            const avg = rawData.reduce((acc, curr) => acc + curr.phValue, 0) / rawData.length;
            const critical = rawData.filter(d => d.status === 'Anomali').length;
            
            setStats({
              avgPh: avg.toFixed(1),
              optimalPercent: (100 - (critical / rawData.length * 100)).toFixed(0),
              activeCount: processingCount,
              criticalCount: critical
            });
          }
        } else {
          setSensorLogs([]);
          setStats(prev => ({ ...prev, avgPh: 0, activeCount: processingCount, criticalCount: 0 }));
        }
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (sensorLogs.length === 0) return alert("No data to export!");
    setIsExporting(true);
    const doc = new jsPDF();
    const tableRows = sensorLogs.map((log, i) => [i + 1, `${log.fullDate} ${log.name}`, log.ph, log.status]);

    doc.setFontSize(18);
    doc.text("EcoMonitor - pH Monitoring Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Batch: ${activeBatch?.nameBatch || 'N/A'} | Range: ${timeRange}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["No", "Timestamp", "pH Level", "Status"]],
      body: tableRows,
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`EcoMonitor_${activeBatch?.nameBatch}_${timeRange}.pdf`);
    setIsExporting(false);
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Polling 10 detik
    return () => clearInterval(interval);
  }, [timeRange]); // Re-fetch saat filter waktu berubah

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-emerald-600 font-medium mt-1">
            {activeBatch ? `Active Monitoring: ${activeBatch.nameBatch}` : "No active fermentation batch."}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownloadPDF} disabled={isExporting} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-semibold shadow-sm hover:bg-emerald-50 transition-all">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download Report
          </button>
          <button onClick={() => router.push('/devices')} className="flex items-center gap-2 px-5 py-2.5 bg-[#10B981] text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all">
            <Cpu className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Average pH Level" value={stats.avgPh} unit="pH" trend="Live" trendType="neutral" icon={Droplets} />
        <StatCard title="In Optimal Range" value={stats.optimalPercent} unit="%" trend="Global" trendType="up" icon={Activity} />
        <StatCard title="Active Batches" value={stats.activeCount} unit="" trend="Running" trendType="neutral" icon={Leaf} />
        <StatCard title="Critical pH Levels" value={stats.criticalCount} unit="Logs" trend="Warning" trendType={stats.criticalCount > 0 ? 'down' : 'neutral'} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-emerald-50">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">pH Level Analysis</h3>
                <p className="text-sm text-slate-400 italic">Tracking fermentation trends</p>
              </div>
              {/* FILTER WAKTU (SESUAI DOC-2 F-04) */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['7d', '30d', 'all'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'Full Batch'}
                  </button>
                ))}
              </div>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorLogs}>
                  <defs>
                    <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                  <YAxis domain={[0, 14]} axisLine={false} tickLine={false} tick={{fill: '#94A3B8'}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  {/* Garis Referensi pH Ideal 3.0 - 4.0 (Sesuai DOC-2 F-04) */}
                  <ReferenceLine y={4.0} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'right', value: 'Limit', fill: '#10B981', fontSize: 10 }} />
                  <Area type="monotone" dataKey="ph" stroke="#10B981" strokeWidth={4} fill="url(#colorPh)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {sensorLogs.length > 0 ? (
              [...sensorLogs].reverse().slice(0, 5).map((log, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${log.status === 'Anomali' ? 'bg-orange-500' : 'bg-emerald-400'} ring-4 ring-emerald-50`}></div>
                    <div className="w-0.5 flex-1 bg-emerald-50 mt-1"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-800">pH: {log.ph}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.status === 'Anomali' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 italic">{log.name}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-200" />
                <p className="text-sm text-slate-400 mt-2 italic">Awaiting sensor data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}