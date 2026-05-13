import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Droplets, Leaf, Activity, ArrowUpRight, ArrowDownRight, Loader2, Cpu, ChevronDown, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/router';


const StatCard = ({ title, value, unit, trend, icon: Icon, trendType }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-emerald-100 flex justify-between items-start">
    <div>
      <p className="text-xs sm:text-sm font-medium text-emerald-600/70">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900">
        {value}<span className="text-base sm:text-lg text-emerald-500 font-normal ml-1">{unit}</span>
      </h3>
      <div className={`flex items-center gap-1 mt-2 text-xs sm:text-sm ${trendType === 'up' ? 'text-emerald-600' : trendType === 'down' ? 'text-orange-500' : 'text-slate-400'}`}>
        {trendType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : trendType === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
        <span className="font-semibold">{trend}</span>
        <span className="text-slate-400 ml-1">{trendType === 'neutral' ? '' : 'vs last record'}</span>
      </div>
    </div>
    <div className={`p-2.5 sm:p-3 rounded-2xl ${title.includes('Critical') && value > 0 ? 'bg-red-500' : 'bg-[#10B981]'} text-white shadow-lg shadow-emerald-100 flex-shrink-0`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
  </div>
);

const STATUS_BADGE = {
  'Aktif':   'bg-emerald-100 text-emerald-700',
  'Selesai': 'bg-slate-100 text-slate-500',
  'Anomali': 'bg-red-100 text-red-600',
};

export default function DashboardPage() {
  const router = useRouter();
  const [sensorLogs, setSensorLogs] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({ avgPh: 0, optimalPercent: 100, activeCount: 0, criticalCount: 0 });

  // ─── 1. Fetch semua batch milik user ──────────────────────────────────────
  const fetchAllBatches = async () => {
    try {
      const batchRes = await apiRequest('/api/batches');
      if (batchRes.success) {
        const batches = batchRes.data;
        setAllBatches(batches);
        const activeCount = batches.filter(b => b.status === 'Aktif').length;
        setStats(prev => ({ ...prev, activeCount }));

        // Set default: batch Aktif pertama, atau batch pertama jika tidak ada yang Aktif
        setSelectedBatch(prev => {
          if (prev) return prev; // jangan reset jika user sudah pilih manual
          return batches.find(b => b.status === 'Aktif') || batches[0] || null;
        });
      }
    } catch (error) {
      console.error('Fetch Batches Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── 2. Fetch sensor data untuk batch yang sedang dipilih ─────────────────
  const fetchSensorData = async () => {
    if (!selectedBatch) {
      setSensorLogs([]);
      setStats(prev => ({ ...prev, avgPh: 0, optimalPercent: 100, criticalCount: 0 }));
      return;
    }
    try {
      const sensorRes = await apiRequest(`/api/readings/chart?batchId=${selectedBatch._id}&range=${timeRange}`);
      if (sensorRes.success && sensorRes.data.length > 0) {
        const rawData = sensorRes.data;
        const formattedData = rawData.map(log => ({
          name: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullDate: new Date(log.timestamp).toLocaleDateString(),
          ph: log.phValue,
          status: log.status,
        }));

        setSensorLogs(formattedData);

        const avg = rawData.reduce((acc, curr) => acc + curr.phValue, 0) / rawData.length;
        const critical = rawData.filter(d => d.status === 'Anomali').length;
        setStats(prev => ({
          ...prev,
          avgPh: avg.toFixed(1),
          optimalPercent: (100 - (critical / rawData.length * 100)).toFixed(0),
          criticalCount: critical,
        }));
      } else {
        setSensorLogs([]);
        setStats(prev => ({ ...prev, avgPh: 0, optimalPercent: 100, criticalCount: 0 }));
      }
    } catch (error) {
      console.error('Fetch Sensor Error:', error);
    }
  };

  // Mount: ambil daftar batch
  useEffect(() => {
    fetchAllBatches();
  }, []);

  // Re-fetch sensor data setiap kali batch atau rentang waktu berubah, dengan polling 10 detik
  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, [selectedBatch, timeRange]);

  // ─── Download Rangkuman pH sebagai PDF ────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!selectedBatch || sensorLogs.length === 0) return;

    const batchName = selectedBatch.nameBatch || 'Batch';
    const now = new Date().toLocaleString('id-ID');
    const rangeLabel = timeRange === '7d' ? '7 Hari Terakhir' : timeRange === '30d' ? '30 Hari Terakhir' : 'Seluruh Batch';

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 14;

    // ── Background header block ──────────────────────────────────────────────
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageW, 48, 'F');

    // Accent strip
    doc.setFillColor(6, 148, 100);
    doc.rect(0, 44, pageW, 4, 'F');

    // App name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('phCounter', marginX, 18);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(209, 250, 229); // emerald-100
    doc.text('Laporan Rangkuman Monitoring pH', marginX, 26);

    // Batch name right-aligned in header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(batchName, pageW - marginX, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(209, 250, 229);
    doc.text(`Status: ${selectedBatch.status}`, pageW - marginX, 26, { align: 'right' });
    doc.text(`Dicetak: ${now}`, pageW - marginX, 33, { align: 'right' });

    // ── Info row (meta) ──────────────────────────────────────────────────────
    let curY = 56;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Rentang Data: ${rangeLabel}  |  Total Log: ${sensorLogs.length}  |  Dibuat oleh Sistem phCounter`, marginX, curY);

    // ── Stat boxes ───────────────────────────────────────────────────────────
    curY += 8;
    const statBoxes = [
      { label: 'Rata-rata pH', value: String(stats.avgPh), unit: 'pH', color: [16, 185, 129] },
      { label: 'Persentase Optimal', value: String(stats.optimalPercent), unit: '%', color: [99, 102, 241] },
      { label: 'Jumlah Anomali', value: String(stats.criticalCount), unit: 'log', color: stats.criticalCount > 0 ? [239, 68, 68] : [100, 116, 139] },
      { label: 'Total Data', value: String(sensorLogs.length), unit: 'entri', color: [14, 165, 233] },
    ];

    const boxW = (pageW - marginX * 2 - 9) / 4;
    statBoxes.forEach((box, i) => {
      const bx = marginX + i * (boxW + 3);

      // Box shadow-like effect (slightly larger gray rect behind)
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(bx + 0.5, curY + 0.5, boxW, 22, 3, 3, 'F');

      // Main box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(bx, curY, boxW, 22, 3, 3, 'F');

      // Left color accent bar
      doc.setFillColor(...box.color);
      doc.roundedRect(bx, curY, 2.5, 22, 1, 1, 'F');

      // Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(box.label, bx + 6, curY + 7);

      // Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...box.color);
      doc.text(box.value, bx + 6, curY + 16);

      // Unit
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(box.unit, bx + 6 + doc.getTextWidth(box.value) + 1.5, curY + 16);
    });

    curY += 30;

    // ── Section title ─────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Data Log Sensor', marginX, curY);

    // Thin underline
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(marginX, curY + 1.5, marginX + 35, curY + 1.5);

    curY += 5;

    // ── Sensor log table ─────────────────────────────────────────────────────
    autoTable(doc, {
      startY: curY,
      margin: { left: marginX, right: marginX },
      head: [['No', 'Waktu', 'Tanggal', 'Nilai pH', 'Status']],
      body: sensorLogs.map((log, i) => [
        i + 1,
        log.name,
        log.fullDate,
        log.ph,
        log.status,
      ]),
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59],
        cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
      },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'center', cellWidth: 28 },
        2: { halign: 'center', cellWidth: 36 },
        3: { halign: 'center', cellWidth: 28, fontStyle: 'bold', textColor: [16, 185, 129] },
        4: { halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === 'body') {
          const status = data.cell.raw;
          if (status === 'Anomali') {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fillColor = [254, 242, 242];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      tableLineColor: [226, 232, 240],
      tableLineWidth: 0.2,
    });

    // ── Footer on every page ──────────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageH - 10, pageW, 10, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('phCounter — Sistem Monitoring pH Otomatis', marginX, pageH - 3.5);
      doc.text(`Halaman ${p} dari ${totalPages}`, pageW - marginX, pageH - 3.5, { align: 'right' });
    }

    doc.save(`Rangkuman_pH_${batchName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-emerald-600 font-medium mt-1 text-sm sm:text-base">
            {selectedBatch
              ? `Viewing: ${selectedBatch.nameBatch}`
              : 'No batch available.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={!selectedBatch || sensorLogs.length === 0}
            title={!selectedBatch || sensorLogs.length === 0 ? 'Pilih batch dengan data sensor untuk mengunduh' : `Unduh rangkuman pH – ${selectedBatch?.nameBatch}`}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 hover:border-emerald-400 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={() => router.push('/devices')}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#10B981] text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all text-sm"
          >
            <Cpu className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      {/* ─── Batch Selector ───────────────────────────────────────────────── */}
      {allBatches.length > 0 && (
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Select Batch to View</p>
          <div className="flex flex-wrap gap-2">
            {allBatches.map(batch => (
              <button
                key={batch._id}
                onClick={() => setSelectedBatch(batch)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  selectedBatch?._id === batch._id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-emerald-200 hover:text-slate-700'
                }`}
              >
                {batch.nameBatch}
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${STATUS_BADGE[batch.status] || 'bg-slate-100 text-slate-400'}`}>
                  {batch.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Average pH Level" value={stats.avgPh} unit="pH" trend="Live" trendType="neutral" icon={Droplets} />
        <StatCard title="In Optimal Range" value={stats.optimalPercent} unit="%" trend="Global" trendType="up" icon={Activity} />
        <StatCard title="Active Batches" value={stats.activeCount} unit="" trend="Running" trendType="neutral" icon={Leaf} />
        <StatCard title="Critical pH Levels" value={stats.criticalCount} unit="Logs" trend="Warning" trendType={stats.criticalCount > 0 ? 'down' : 'neutral'} icon={Activity} />
      </div>

      {/* ─── Chart + Recent Activity ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-emerald-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">pH Level Analysis</h3>
              <p className="text-xs sm:text-sm text-slate-400 italic">
                {selectedBatch ? selectedBatch.nameBatch : 'No batch selected'}
                {selectedBatch && (
                  <span className={`ml-2 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${STATUS_BADGE[selectedBatch.status] || ''}`}>
                    {selectedBatch.status}
                  </span>
                )}
              </p>
            </div>
            {/* Filter Waktu */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {['7d', '30d', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'Full Batch'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[220px] sm:h-[300px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-300" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorLogs}>
                  <defs>
                    <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis domain={[0, 14]} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <ReferenceLine y={4.0} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'right', value: 'Limit', fill: '#10B981', fontSize: 10 }} />
                  <Area type="monotone" dataKey="ph" stroke="#10B981" strokeWidth={4} fill="url(#colorPh)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
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
                <p className="text-sm text-slate-400 mt-2 italic">
                  {selectedBatch ? 'Awaiting sensor data...' : 'Select a batch to view data.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}