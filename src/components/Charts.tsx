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
import { motion } from 'motion/react';

interface ChartProps {
  data: any[];
  title: string;
}

export const EvolutionChart: React.FC<ChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-2xl h-[400px]">
      <h4 className="text-lg font-bold text-slate-900 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0a988b" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#0a988b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#1e293b' }}
          />
          <Area 
            type="monotone" 
            dataKey="value"
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
    <div className="glass-card p-6 rounded-2xl h-[400px]">
      <h4 className="text-lg font-bold text-slate-900 mb-6">{title}</h4>
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
             contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ color: '#1e293b' }}
          />
          <Legend iconType="circle" formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>} />
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
    <div className="glass-card p-6 rounded-2xl" style={{ height }}>
      <h4 className="text-lg font-bold text-slate-900 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data.slice(0, limit)} layout="vertical" margin={{ left: 30, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
            width={120}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#1e293b' }}
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
    <div className="glass-card p-6 rounded-2xl h-[400px]">
      <h4 className="text-lg font-bold text-slate-900 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
          <Tooltip
             contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ color: '#1e293b' }}
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
    <div className="glass-card p-6 rounded-2xl h-[400px]">
      <h4 className="text-lg font-bold text-slate-900 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
          <Tooltip 
            formatter={(value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value)}
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#1e293b' }}
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

export const StackedBarChart: React.FC<ChartProps & { keys: string[], colors: string[] }> = ({ data, title, keys, colors }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-2xl h-[450px]">
      <h4 className="text-lg font-bold text-slate-900 mb-6">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
          <Tooltip
             contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ color: '#1e293b' }}
          />
          <Legend />
          {keys.map((key, index) => (
            <Bar key={key} dataKey={key} stackId="a" fill={colors[index % colors.length]} radius={index === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WordCloud: React.FC<ChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-8 rounded-3xl min-h-[400px] flex flex-col">
      <h4 className="text-xl font-bold text-slate-900 mb-8">{title}</h4>
      <div className="flex-1 flex flex-wrap items-center justify-center gap-4">
        {data.map((item, i) => {
          const fontSize = Math.max(12, Math.min(32, 10 + (item.value / data[0].value) * 30));
          const opacity = 0.5 + (item.value / data[0].value) * 0.5;
          const colors = ['text-primary', 'text-secondary', 'text-accent', 'text-blue-500', 'text-emerald-500'];

          return (
            <motion.span
              key={item.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity }}
              transition={{ delay: i * 0.05 }}
              style={{ fontSize }}
              className={`font-black cursor-default hover:scale-110 transition-transform ${colors[i % colors.length]}`}
            >
              {item.name}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
};
