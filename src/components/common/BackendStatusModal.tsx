/**
 * BACKEND SETUP & DATABASE STATUS MODAL
 * Transparent inspection of Supabase & Firebase connectivity,
 * instructions for production deployment, and 1-click SQL migration copy.
 */

import React, { useState } from 'react';
import {
  X,
  Database,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Server,
  Key,
  AlertTriangle,
  Info
} from 'lucide-react';
import { isSupabaseConfigured, getSupabaseConfig } from '../../services/supabaseClient';
import { isFirebaseConfigured, getFirebaseStatus } from '../../services/firebaseAuth';
import { COMPLETE_DOORBLY_SCHEMA_SQL } from '../../sql/schemaSql';
import { DoorblyLogo } from './DoorblyLogo';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const supabaseOnline = isSupabaseConfigured();
  const firebaseOnline = isFirebaseConfigured();
  const supabaseConfig = getSupabaseConfig();
  const firebaseConfig = getFirebaseStatus();

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(COMPLETE_DOORBLY_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyEnv = () => {
    const envTemplate = `# DOORBLY REMOTE WORKSTATION (.env)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-doorbly-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="doorbly-production"
VITE_FIREBASE_STORAGE_BUCKET="doorbly-production.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"`;

    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in duration-150 text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white">
          <div className="flex items-center space-x-2.5">
            <DoorblyLogo size="sm" rounded={true} />
            <div>
              <h3 className="text-sm font-bold text-white">Backend Infrastructure & Database Status</h3>
              <p className="text-[11px] text-teal-200/80">workstation.doorbly.com • Supabase & Firebase Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Supabase Status */}
            <div className="p-3.5 rounded-lg border border-gray-200 bg-[#F7F9FA] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 flex items-center space-x-1.5">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>Supabase PostgreSQL DB</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  supabaseOnline
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {supabaseOnline ? 'Connected (Live)' : 'Local Persistent Engine'}
                </span>
              </div>
              <p className="text-gray-500 text-[11px]">
                {supabaseOnline
                  ? `Connected to: ${supabaseConfig.url}`
                  : 'Operating in local persistent offline-ready mode with initial seeds for 30 Odisha districts & 12 roles.'}
              </p>
            </div>

            {/* Firebase Status */}
            <div className="p-3.5 rounded-lg border border-gray-200 bg-[#F7F9FA] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>Firebase Authentication</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  firebaseOnline
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-teal-100 text-teal-800'
                }`}>
                  {firebaseOnline ? 'Connected' : 'Active (RBAC Mode)'}
                </span>
              </div>
              <p className="text-gray-500 text-[11px]">
                {firebaseOnline
                  ? `Firebase Project ID: ${firebaseConfig.projectId}`
                  : 'Role-based profiles active for all 12 designations + DM + DC + Admin.'}
              </p>
            </div>
          </div>

          {/* Database Setup & Migration Instructions */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 text-teal-900">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                <span>Full SQL Migration Ready (All 23 Tables)</span>
              </h4>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 bg-[#0F766E] hover:bg-[#123C45] text-white text-[11px] font-semibold rounded transition flex items-center space-x-1 shadow-xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied Full SQL!' : 'Copy Full Migration SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-teal-800">
              The project includes a complete, safe PostgreSQL migration script located in <code>/src/sql/schema.sql</code>. It creates all 23 tables required by Section 22, including primary keys, foreign keys, status constraints, Row Level Security (RLS) policies, and the initial ₹1,00,000 target seed across all 30 Odisha districts.
            </p>
          </div>

          {/* Environment Variables Reference */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">Environment Variables Template (.env)</span>
              <button
                onClick={handleCopyEnv}
                className="text-[11px] text-[#0F766E] font-semibold hover:underline flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Template!' : 'Copy .env Template'}</span>
              </button>
            </div>
            <div className="bg-gray-900 text-gray-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto border border-gray-800">
              <pre>{`VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_PROJECT_ID="doorbly-prod"`}</pre>
            </div>
          </div>

          {/* Deployment Instructions */}
          <div className="p-3.5 rounded-lg border border-gray-200 bg-white space-y-1.5 text-gray-600">
            <span className="font-bold text-gray-800 block">Vercel & Domain Deployment (workstation.doorbly.com)</span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600 leading-relaxed">
              <li>Link this repository to your Vercel team account.</li>
              <li>Add the environment variables listed above in Vercel Project Settings.</li>
              <li>Configure custom domain <code>workstation.doorbly.com</code> with CNAME pointing to Vercel.</li>
              <li>Run the SQL migration script from <code>/src/sql/schema.sql</code> in your Supabase SQL Editor.</li>
            </ol>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end bg-[#F7F9FA]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-md shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
