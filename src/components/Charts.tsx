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
    <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100 h-[400px]">
      <h4 className="text-lg font-bold text-slate-800 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0a988b" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#0a988b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
    <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100 h-[400px]">
      <h4 className="text-lg font-bold text-slate-800 mb-6">{title}</h4>
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
          >
            {data?.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
    <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100" style={{ height }}>
      <h4 className="text-lg font-bold text-slate-800 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data.slice(0, limit)} layout="vertical" margin={{ left: 30, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            width={120}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
    <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100 h-[400px]">
      <h4 className="text-lg font-bold text-slate-800 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b' }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
    <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100 h-[400px]">
      <h4 className="text-lg font-bold text-slate-800 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b' }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip 
             formatter={(value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value)}
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
