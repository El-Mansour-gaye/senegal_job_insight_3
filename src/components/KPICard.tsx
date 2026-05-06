import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: 'primary' | 'secondary' | 'accent' | 'blue';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, trendUp, color }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100 overflow-hidden relative"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          {trend && (
            <div className={cn("flex items-center mt-2 text-xs font-semibold", trendUp ? "text-emerald-500" : "text-rose-500")}>
              <span>{trendUp ? '↑' : '↓'} {trend}</span>
              <span className="text-slate-400 font-normal ml-1">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", colorClasses[color])}>
          <Icon size={24} />
        </div>
      </div>
      
      {/* Decorative gradient blob */}
      <div className={cn(
        "absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-5 blur-2xl",
        color === 'primary' ? 'bg-primary' : color === 'secondary' ? 'bg-secondary' : 'bg-accent'
      )} />
    </motion.div>
  );
};
