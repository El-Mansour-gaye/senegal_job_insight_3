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
      className="glass-card p-6 rounded-2xl overflow-hidden relative group cursor-help"
    >
      <div className="flex items-center justify-between">
        <div className="z-10">
          <p className="text-sm font-bold text-slate-500 mb-1 tracking-tight flex items-center gap-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-secondary tracking-tight leading-none">{value}</h3>
            {trend && (
              <span className={cn(
                "px-2 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-0.5 shadow-sm border",
                trendUp 
                  ? "bg-emerald-500 text-white border-emerald-400"
                  : "bg-accent text-white border-accent"
              )}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
          </div>
          
          <div className="mt-2 h-4 overflow-hidden transition-all duration-500">
            <p className={cn(
              "text-[11px] font-bold transition-all duration-500",
              isHovered ? "text-primary translate-y-0 opacity-100" : "text-slate-500 translate-y-2 opacity-0"
            )}>
              {description || "Actualisé en temps réel"}
            </p>
          </div>
        </div>
        <div className={cn("p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110", colorClasses[color])}>
          <Icon size={24} strokeWidth={1.5} className="text-primary" />
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
