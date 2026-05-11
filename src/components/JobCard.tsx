import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Building2, Clock, ChevronRight } from 'lucide-react';
import { JobOffer } from '../types';
import { formatDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: JobOffer;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card p-6 mb-4 group transition-all border border-slate-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              job.contract_type === 'CDI' ? 'bg-primary/10 text-primary border-primary/20' :
              job.contract_type === 'Stage' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-slate-100 text-slate-500 border-slate-200'
            )}>
              {job.contract_type}
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">{job.sector}</span>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-500 text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <Building2 size={16} strokeWidth={1.5} className="text-slate-400" />
              <span className="text-slate-700">{job.company}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={16} strokeWidth={1.5} className="text-slate-400" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} strokeWidth={1.5} className="text-slate-400" />
              <span>Exp: {job.experience_level}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} strokeWidth={1.5} className="text-slate-400" />
              <span>Publié le {formatDate(job.publish_date)}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.key_skills.slice(0, 4).map(skill => (
              <span key={skill} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">
                {skill}
              </span>
            ))}
            {job.key_skills.length > 4 && (
              <span className="text-slate-400 text-xs font-bold flex items-center">+{job.key_skills.length - 4} plus</span>
            )}
          </div>
        </div>

        <Link 
          to={`/jobs/${job.id}`}
          className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-slate-200 group-hover:border-primary/50"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </Link>
      </div>
    </motion.div>
  );
};
