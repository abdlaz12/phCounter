import React from 'react';
import { Thermometer, Droplets, Leaf, Activity, ArrowUpRight, ArrowDownRight, Download, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', yield: 400 },
  { name: 'Tue', yield: 300 },
  { name: 'Wed', yield: 500 },
  { name: 'Thu', yield: 450 },
  { name: 'Fri', yield: 600 },
  { name: 'Sat', yield: 700 },
  { name: 'Sun', yield: 650 },
];

const StatCard = ({ title, value, unit, trend, icon: Icon, trendType }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 flex justify-between items-start">
    <div>
      <p className="text-sm font-medium text-emerald-600/70">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900">
        {value}<span className="text-base sm:text-lg text-emerald-500 font-normal ml-1">{unit}</span>
      </h3>
      <div className={`flex items-center gap-1 mt-2 text-sm ${trendType === 'up' ? 'text-emerald-600' : trendType === 'down' ? 'text-orange-500' : 'text-slate-400'}`}>
        {trendType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : trendType === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
        <span className="font-semibold">{trend}%</span>
        <span className="text-slate-400 ml-1">vs last week</span>
      </div>
    </div>
    <div className={`p-3 rounded-2xl ${title.includes('Critical') ? 'bg-red-500' : 'bg-[#10B981]'} text-white shadow-lg shadow-emerald-100 shrink-0`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-emerald-600 font-medium mt-1 text-sm sm:text-base">Real-time monitoring of your production batches.</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-semibold shadow-sm hover:bg-emerald-50 transition-all text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Download Report</span>
            <span className="xs:hidden sm:hidden">Report</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#10B981] text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all text-sm">
            <Plus className="w-4 h-4" /> New Batch
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Average pH Level" value="3.4" unit="pH" trend="0.1" trendType="down" icon={Droplets} />
        <StatCard title="In Optimal Range" value="92" unit="%" trend="2.4" trendType="up" icon={Activity} />
        <StatCard title="Active Batches" value="12" unit="" trend="5" trendType="up" icon={Leaf} />
        <StatCard title="Critical pH Levels" value="1" unit="Batch" trend="0" trendType="neutral" icon={Activity} />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-emerald-50">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Yield Analytics</h3>
            <select className="bg-emerald-50 text-emerald-700 font-medium rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 outline-none border-none text-sm">
              <option>This Week</option>
            </select>
          </div>
          <div className="h-[220px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={36} />
                <Tooltip />
                <Area type="monotone" dataKey="yield" stroke="#10B981" strokeWidth={4} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-emerald-50">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 sm:mb-6">Recent Activity</h3>
          <div className="space-y-5 sm:space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-50 shrink-0"></div>
                  <div className="w-0.5 flex-1 bg-emerald-50 mt-1"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 tracking-tight">Batch #20241 completed processing</p>
                  <p className="text-xs text-slate-400 mt-1 italic">20 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}