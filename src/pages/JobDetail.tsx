import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Building2, MapPin, Clock, Calendar, ExternalLink, Briefcase, GraduationCap, ShieldCheck, Share2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate, cn } from '../lib/utils';

export const JobDetail: React.FC = () => {
  const { id } = useParams();
  const { jobs, isLoading } = useData();
  const job = jobs.find(j => j.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Offre introuvable</h2>
        <Link to="/jobs" className="text-primary mt-4 inline-block hover:underline">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <Link to="/jobs" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium">
        <ArrowLeft size={18} />
        Retour aux offres
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider italic">
                {job.contract_type}
              </span>
              <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {job.sector}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">{job.title}</h1>
            
            <div className="flex flex-wrap gap-6 text-slate-600 mb-10 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">ENTREPRISE</p>
                  <p className="font-bold text-slate-800">{job.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">LOCALISATION</p>
                  <p className="font-bold text-slate-800">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">PUBLIÉ LE</p>
                  <p className="font-bold text-slate-800">{formatDate(job.publish_date)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  Description du poste
                </h3>
                <div className="text-slate-600 leading-relaxed text-lg">
                  {job.description}
                  <p className="mt-4">
                    L'objectif de ce recrutement est de renforcer notre position sur le marché sénégalais en apportant une expertise technique poussée. 
                    Vous serez intégré(e) au sein d'une équipe pluridisciplinaire et participerez à toutes les étapes du cycle de vie des projets.
                  </p>
                </div>
              </section>

              <section className="pt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                  Compétences clés
                </h3>
                <div className="flex flex-wrap gap-3">
                  {job.key_skills.map(skill => (
                    <span key={skill} className="bg-primary/5 text-primary-dark font-semibold px-4 py-2 rounded-xl border border-primary/10 shadow-sm transition-all hover:bg-primary hover:text-white cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h4 className="text-lg font-bold border-b border-white/10 pb-4 relative">Détails rapides</h4>
            
            <div className="space-y-5 relative">
              <div className="flex items-center gap-4">
                <GraduationCap className="text-primary" size={24} />
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Formation</p>
                  <p className="font-bold">{job.education_level}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="text-secondary" size={24} />
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Expérience</p>
                  <p className="font-bold">{job.experience_level}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ShieldCheck className="text-accent" size={24} />
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Source</p>
                  <p className="font-bold">{job.source}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3 relative">
              <a 
                href={job.offer_url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-primary py-4 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Postuler maintenant
                <ExternalLink size={18} />
              </a>
              <button className="w-full border border-white/20 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-white/5 transition-all">
                Partager l'offre
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100">
             <h4 className="font-bold text-slate-800 mb-4">À propos du scraping</h4>
             <p className="text-sm text-slate-500 mb-4">Cette offre a été collectée automatiquement le {formatDate(job.scraped_date)} par nos agents d'analyse.</p>
             <Link to="/stats" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
               Voir les statistiques du secteur
               <ArrowLeft className="rotate-180" size={14} />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
