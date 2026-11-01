'use client';

import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle2,
  Layers,
  ExternalLink,
  Copy,
  X
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SYSTEMS_DATA } from '@/data/portalData';

interface MediaItem {
  _id?: string;
  title: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  format?: string;
  systemId?: string;
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      const url = selectedSystem === 'all' ? '/api/admin/media' : `/api/admin/media?systemId=${selectedSystem}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.media) setMediaList(data.media);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedSystem]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('systemId', selectedSystem === 'all' ? 'btos' : selectedSystem);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchMedia();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
              Cloudinary Media Library
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Upload and manage screenshots, diagrams, and illustrations for user manuals and training topics.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2"
          >
            <Upload size={16} />
            <span>Upload Image to Cloudinary</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DCE6F1]">
          <button
            onClick={() => setSelectedSystem('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedSystem === 'all' ? 'bg-[#1266D5] text-white' : 'bg-white text-[#64748B]'
            }`}
          >
            All Media
          </button>
          {SYSTEMS_DATA.map((sys) => (
            <button
              key={sys.id}
              onClick={() => setSelectedSystem(sys.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSystem === sys.id ? 'bg-[#1266D5] text-white' : 'bg-white text-[#64748B]'
              }`}
            >
              {sys.name}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mediaList.map((item) => (
            <div key={item.cloudinaryPublicId} className="bg-white rounded-2xl border border-[#DCE6F1] overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="aspect-video bg-gray-100 overflow-hidden relative">
                {/* Image */}
                <img
                  src={item.secureUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-[#082B4C]/80 text-white font-mono text-[9px] uppercase px-1.5 py-0.5 rounded">
                  {item.format || 'jpg'}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-[#082B4C] line-clamp-1">{item.title}</h4>
                <p className="text-[10px] font-mono text-[#64748B] truncate">{item.cloudinaryPublicId}</p>

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase bg-blue-50 text-[#1266D5] px-2 py-0.5 rounded">
                    {item.systemId || 'BTOS'}
                  </span>
                  <button
                    onClick={() => copyUrl(item.secureUrl, item.cloudinaryPublicId)}
                    className="p-1 rounded text-[#64748B] hover:text-[#1266D5]"
                    title="Copy Secure URL"
                  >
                    {copiedId === item.cloudinaryPublicId ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Upload Image */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE6F1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base font-bold text-[#082B4C]">Upload Screenshot to Cloudinary</h3>
                <button onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>

              <div className="mt-4 p-8 border-2 border-dashed border-[#CBD5E1] rounded-2xl text-center space-y-3 bg-[#F8FAFC]">
                <ImageIcon size={36} className="mx-auto text-[#1266D5]" />
                <div>
                  <label className="cursor-pointer px-4 py-2 bg-[#1266D5] text-white rounded-lg font-bold text-xs inline-block hover:bg-[#0D55B8]">
                    <span>{uploading ? 'Uploading to Cloudinary...' : 'Select Screenshot (PNG / JPG)'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                  </label>
                </div>
                <p className="text-[11px] text-[#64748B]">Images are uploaded to your signed Cloudinary storage and linked to lessons.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
