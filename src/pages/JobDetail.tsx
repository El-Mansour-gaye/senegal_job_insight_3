import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Clock, Calendar, ExternalLink, GraduationCap, ShieldCheck, Share2 } from 'lucide-react';
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
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Offre introuvable</h2>
        <Link to="/jobs" className="text-primary mt-4 inline-block font-bold hover:underline">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">
      <Link to="/jobs" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">
        <ArrowLeft size={16} strokeWidth={2} />
        Retour aux offres
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/10">
                {job.contract_type}
              </span>
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                {job.sector}
              </span>
            </div>

            <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{job.title}</h1>
            
            <div className="flex flex-wrap gap-6 text-slate-500 mb-10 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Building2 size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">ENTREPRISE</p>
                  <p className="font-bold text-slate-800">{job.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">LOCALISATION</p>
                  <p className="font-bold text-slate-800">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">PUBLIÉ LE</p>
                  <p className="font-bold text-slate-800">{formatDate(job.publish_date)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  Description du poste
                </h3>
                <div className="text-slate-600 leading-relaxed text-lg font-medium">
                  {job.description}
                  <p className="mt-4">
                    L'objectif de ce recrutement est de renforcer notre position sur le marché sénégalais en apportant une expertise technique poussée. 
                    Vous serez intégré(e) au sein d'une équipe pluridisciplinaire et participerez à toutes les étapes du cycle de vie des projets.
                  </p>
                </div>
              </section>

              <section className="pt-8">
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                  Compétences clés
                </h3>
                <div className="flex flex-wrap gap-3">
                  {job.key_skills.map(skill => (
                    <span key={skill} className="bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-primary/50 cursor-default">
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
            <h4 className="text-lg font-bold border-b border-white/10 pb-4 relative uppercase tracking-widest text-[11px]">Détails rapides</h4>
            
            <div className="space-y-5 relative">
              <div className="flex items-center gap-4">
                <GraduationCap className="text-primary" size={24} strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Formation</p>
                  <p className="font-bold">{job.education_level}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="text-secondary" size={24} strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expérience</p>
                  <p className="font-bold">{job.experience_level}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ShieldCheck className="text-accent" size={24} strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Source</p>
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
                <ExternalLink size={18} strokeWidth={1.5} />
              </a>
              <button className="w-full border border-white/20 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-white/5 transition-all">
                Partager l'offre
                <Share2 size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h4 className="font-bold text-slate-900 mb-4">Analyse de l'offre</h4>
             <p className="text-sm text-slate-500 mb-4 font-medium">Cette offre a été collectée automatiquement le {formatDate(job.scraped_date)} par nos agents d'analyse.</p>
             <Link to="/" className="text-primary text-sm font-black flex items-center gap-1 hover:underline">
               Voir les tendances secteur
               <ArrowLeft className="rotate-180" size={14} strokeWidth={2} />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
