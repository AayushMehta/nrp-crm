'use client';

// Step: Document Upload
// Renders only the documents the RM selected for this invitation

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Upload, FileText, CheckCircle2, X, File, AlertCircle,
    CreditCard, Fingerprint, MapPin, Building2, Banknote, BarChart3,
    Camera, Scale, UserCheck, AlertTriangle, BookOpen,
} from 'lucide-react';
import type { DocumentRequirement } from '@/lib/config/onboarding-config';
import { saveDocumentUpload, getDocumentUploads, removeDocumentUpload, type DocumentUpload } from '@/lib/services/onboarding-service';

const DOC_ICON_MAP: Record<string, React.ReactNode> = {
    CreditCard: <CreditCard className="h-5 w-5" />,
    Fingerprint: <Fingerprint className="h-5 w-5" />,
    MapPin: <MapPin className="h-5 w-5" />,
    Building2: <Building2 className="h-5 w-5" />,
    FileText: <FileText className="h-5 w-5" />,
    Banknote: <Banknote className="h-5 w-5" />,
    BookOpen: <BookOpen className="h-5 w-5" />,
    BarChart3: <BarChart3 className="h-5 w-5" />,
    Camera: <Camera className="h-5 w-5" />,
    Scale: <Scale className="h-5 w-5" />,
    UserCheck: <UserCheck className="h-5 w-5" />,
    AlertTriangle: <AlertTriangle className="h-5 w-5" />,
};

interface StepDocumentUploadProps {
    documents: DocumentRequirement[];
    token: string;
    showValidation: boolean;
}

export function Step_DocumentUpload({ documents, token, showValidation }: StepDocumentUploadProps) {
    const [uploads, setUploads] = useState<Record<string, DocumentUpload>>(() => {
        const existing = getDocumentUploads(token);
        const map: Record<string, DocumentUpload> = {};
        existing.forEach(u => { map[u.documentId] = u; });
        return map;
    });
    const [dragOver, setDragOver] = useState<string | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleFileSelect = (docId: string, file: File) => {
        const upload: DocumentUpload = {
            id: `${docId}-${Date.now()}`,
            token,
            documentId: docId,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded',
        };
        saveDocumentUpload(upload);
        setUploads(prev => ({ ...prev, [docId]: upload }));
    };

    const handleRemove = (docId: string) => {
        removeDocumentUpload(token, docId);
        setUploads(prev => {
            const next = { ...prev };
            delete next[docId];
            return next;
        });
    };

    const handleDrop = (docId: string, e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(null);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(docId, file);
    };

    const mandatoryUploaded = documents
        .filter(d => d.isMandatory)
        .every(d => uploads[d.id]);

    const uploadedCount = Object.keys(uploads).length;

    return (
        <div className="space-y-6 max-w-2xl py-4">
            {/* Header Stats */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
                    <Upload className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                        {uploadedCount} of {documents.length} documents uploaded
                    </p>
                    <p className="text-xs text-gray-500">
                        {documents.filter(d => d.isMandatory).length} mandatory documents required
                    </p>
                </div>
                {mandatoryUploaded && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> All required uploaded
                    </Badge>
                )}
            </div>

            {/* Document Cards */}
            <div className="space-y-3">
                {documents.map(doc => {
                    const upload = uploads[doc.id];
                    const isOver = dragOver === doc.id;

                    return (
                        <div
                            key={doc.id}
                            onDragOver={e => { e.preventDefault(); setDragOver(doc.id); }}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={e => handleDrop(doc.id, e)}
                            className={cn(
                                'p-4 rounded-xl border-2 transition-all duration-200',
                                upload
                                    ? 'border-emerald-300 bg-emerald-50/50'
                                    : isOver
                                        ? 'border-blue-400 bg-blue-50/50 border-dashed'
                                        : 'border-gray-200 bg-white hover:border-gray-300',
                                showValidation && doc.isMandatory && !upload && 'border-red-300 bg-red-50/30'
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0',
                                    upload
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : 'bg-slate-100 text-slate-500'
                                )}>
                                    {DOC_ICON_MAP[doc.icon] || <FileText className="h-5 w-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                                        {doc.isMandatory && (
                                            <Badge className="text-[9px] bg-red-100 text-red-700 border-0 px-1.5 py-0">
                                                Required
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">{doc.description}</p>

                                    {upload ? (
                                        <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-white border border-emerald-200">
                                            <File className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                            <span className="text-xs font-medium text-gray-700 truncate">{upload.fileName}</span>
                                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                {(upload.fileSize / 1024).toFixed(0)} KB
                                            </span>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 ml-auto" />
                                            <button
                                                onClick={() => handleRemove(doc.id)}
                                                className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            <input
                                                ref={el => { fileInputRefs.current[doc.id] = el; }}
                                                type="file"
                                                className="hidden"
                                                accept={doc.acceptedFormats.map(f => `.${f}`).join(',')}
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileSelect(doc.id, file);
                                                }}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRefs.current[doc.id]?.click()}
                                                className="text-xs"
                                            >
                                                <Upload className="h-3 w-3 mr-1.5" />
                                                Upload {doc.acceptedFormats.map(f => f.toUpperCase()).join(', ')}
                                            </Button>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                Max {doc.maxSizeMB} MB · Drag & drop supported
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Validation */}
            {showValidation && !mandatoryUploaded && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Please upload all required documents to continue.
                </div>
            )}
        </div>
    );
}
