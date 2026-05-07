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
  description?: string;
  color: 'primary' | 'secondary' | 'accent' | 'blue';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, trendUp, description, color }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100 overflow-hidden relative group cursor-help transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="z-10">
          <p className="text-sm font-medium text-slate-400 mb-1 tracking-tight flex items-center gap-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{value}</h3>
            {trend && (
              <span className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-black inline-flex items-center gap-0.5 shadow-sm border",
                trendUp 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : "bg-rose-50 text-rose-600 border-rose-100"
              )}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
          </div>
          
          <div className={cn(
            "mt-2 h-4 overflow-hidden transition-all duration-500",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              {description || "Actualisé en temps réel"}
            </p>
          </div>
        </div>
        <div className={cn("p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110", colorClasses[color])}>
          <Icon size={24} />
        </div>
      </div>
      
      {/* Decorative gradient blob */}
      <div className={cn(
        "absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-5 blur-2xl transition-all duration-1000 group-hover:opacity-20 group-hover:scale-150",
        color === 'primary' ? 'bg-primary' : color === 'secondary' ? 'bg-secondary' : 'bg-blue-500'
      )} />
    </motion.div>
  );
};
