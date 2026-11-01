'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Search, ExternalLink, PlayCircle, BookOpen } from 'lucide-react';
import { SYSTEMS_DATA, BTOS_MODULES } from '@/data/portalData';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  // Extract all searchable lessons from modules
  const allLessons = BTOS_MODULES.flatMap((m) => m.lessons);

  const matchedSystems = SYSTEMS_DATA.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.fullName.toLowerCase().includes(query.toLowerCase())
  );

  const matchedLessons = allLessons.filter(
    (l) =>
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
          Search Results
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          {query ? `Showing results for "${query}"` : 'Enter a search term above'}
        </p>
      </div>

      {matchedSystems.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#082B4C]">Matching Systems</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {matchedSystems.map((s) => (
              <Link
                key={s.id}
                href={`/systems/${s.id}`}
                className="p-4 bg-white border border-[#DCE6F1] rounded-xl hover:shadow-md transition-shadow block"
              >
                <h3 className="font-bold text-[#082B4C] text-sm">{s.name}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">{s.fullName}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {matchedLessons.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#082B4C]">Matching Lessons &amp; Procedures</h2>
          <div className="bg-white border border-[#DCE6F1] rounded-xl divide-y divide-[#F1F5F9]">
            {matchedLessons.map((l) => (
              <div key={l.id} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <PlayCircle size={18} className="text-[#1266D5]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#142B45]">{l.title}</h4>
                    <p className="text-[11px] text-[#64748B]">{l.description}</p>
                  </div>
                </div>
                <Link
                  href={`/systems/${l.systemId}/lessons/${l.id}`}
                  className="text-xs font-bold text-[#1266D5] hover:underline"
                >
                  View Lesson &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {matchedSystems.length === 0 && matchedLessons.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#DCE6F1]">
          <Search size={32} className="mx-auto text-[#94A3B8] mb-2" />
          <p className="text-sm font-bold text-[#082B4C]">No results found for &quot;{query}&quot;</p>
          <p className="text-xs text-[#64748B] mt-1">Try searching for &quot;BTOS&quot;, &quot;Cargo ID&quot;, or &quot;HHT&quot;.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Loading search...</div>}>
        <SearchContent />
      </Suspense>
    </MainLayout>
  );
}
