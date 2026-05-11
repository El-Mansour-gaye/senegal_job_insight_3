import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface ChartProps {
  data: any[];
  title: string;
}

export const EvolutionChart: React.FC<ChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-2xl shadow-premium h-[400px]">
      <h4 className="text-lg font-bold text-slate-100 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0a988b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0a988b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="name"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#0a988b" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DistributionChart: React.FC<ChartProps> = ({ data, title }) => {
  const COLORS = ['#0a988b', '#ff9d17', '#f44a3c', '#3b82f6', '#8b5cf6', '#ec4899'];

  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-2xl shadow-premium h-[400px]">
      <h4 className="text-lg font-bold text-slate-100 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data?.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
             itemStyle={{ color: '#f8fafc' }}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface HorizontalBarChartProps extends ChartProps {
  height?: number;
  barColor?: string;
  secondaryColor?: string;
  limit?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
  height = 550,
  barColor = '#0a988b',
  secondaryColor = '#ff9d17',
  limit = 15
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-2xl shadow-premium" style={{ height }}>
      <h4 className="text-lg font-bold text-slate-100 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data.slice(0, limit)} layout="vertical" margin={{ left: 30, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            width={120}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b' }}
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={15}>
            {data.slice(0, limit).map((_, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? barColor : secondaryColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SectorBarChart = HorizontalBarChart;

export const SimpleBarChart: React.FC<ChartProps & { color?: string }> = ({ data, title, color = '#0a988b' }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-2xl shadow-premium h-[400px]">
      <h4 className="text-lg font-bold text-slate-100 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip
             contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
             itemStyle={{ color: '#f8fafc' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SalaryChart: React.FC<ChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-2xl shadow-premium h-[400px]">
      <h4 className="text-lg font-bold text-slate-100 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip 
             formatter={(value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value)}
             contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
             itemStyle={{ color: '#f8fafc' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
             {data?.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ff9d17' : '#f44a3c'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
