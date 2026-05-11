import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { JobOffer } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowUpDown, 
  ExternalLink,
  MapPin,
  Building2
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

interface JobsDataTableProps {
  data: JobOffer[];
}

const columnHelper = createColumnHelper<JobOffer>();

export const JobsDataTable: React.FC<JobsDataTableProps> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = [
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={() => column.toggleSorting()}>
          Poste <ArrowUpDown size={14} strokeWidth={1.5} />
        </button>
      ),
      cell: info => (
        <div className="py-2">
          <Link to={`/jobs/${info.row.original.id}`} className="font-bold text-slate-900 hover:text-primary transition-colors line-clamp-1">
            {info.getValue()}
          </Link>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 font-medium">
            <Building2 size={12} strokeWidth={1.5} />
            <span>{info.row.original.company}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('location', {
      header: 'Ville',
      cell: info => (
        <div className="flex items-center gap-1 text-slate-600 font-medium">
          <MapPin size={14} strokeWidth={1.5} className="text-slate-400" />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('sector', {
      header: 'Secteur',
      cell: info => <span className="text-xs font-bold bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-slate-600 truncate max-w-[150px] inline-block">{info.getValue()}</span>,
    }),
    columnHelper.accessor('contract_type', {
      header: 'Contrat',
      cell: info => (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          info.getValue() === 'CDI' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-100 text-slate-500 border-slate-200'
        )}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('publish_date', {
      header: 'Date',
      cell: info => <span className="text-slate-500 font-medium">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <div className="flex justify-end">
          <a href={info.row.original.offer_url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
            <ExternalLink size={16} strokeWidth={1.5} />
          </a>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h4 className="text-lg font-bold text-slate-900">Détails des offres</h4>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Filtrer dans le tableau..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-stripe">
          <thead className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-4 border-b border-slate-100">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-primary/5 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-bold">
          Affichage de {table.getRowModel().rows.length} sur {data.length} offres
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 disabled:opacity-30 transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
              .slice(0, 5)
              .map(page => (
                <button
                  key={page}
                  onClick={() => table.setPageIndex(page - 1)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-black transition-all",
                    table.getState().pagination.pageIndex === page - 1
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary border border-transparent hover:border-slate-200"
                  )}
                >
                  {page}
                </button>
              ))}
          </div>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 disabled:opacity-30 transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
