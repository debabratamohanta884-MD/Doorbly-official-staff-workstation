/**
 * DOORBLY CENTRAL ADMINISTRATIVE CONTROL PANEL
 * SQL & Supabase Integration Hub
 * Complete interactive PostgreSQL query console, 23-table schema browser,
 * live Supabase sync engine, connection test, credentials manager, and SQL migration exporter.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  Server,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Code,
  Table as TableIcon,
  Search,
  Filter,
  Key,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Eye,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { StaffProfile } from '../../types/doorbly';
import { COMPLETE_DOORBLY_SCHEMA_SQL, SUPABASE_PERMISSIONS_FIX_SQL } from '../../sql/schemaSql';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  setCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  testSupabaseConnection,
  executeSqlQuery,
  generateFullSqlSeedDump,
  syncLocalDataToSupabase,
  verifyAllTablesIntegrity,
  isAutoSyncEnabled,
  setAutoSyncEnabled,
  getSyncActivityLogs,
  TABLE_METADATA_MASTER,
  QueryResult
} from '../../services/supabaseClient';
import { StorageEngine } from '../../services/storageEngine';

interface SqlSupabaseAdminIntegrationProps {
  currentUser: StaffProfile;
}

type SubTab = 'query_console' | 'table_browser' | 'sync_migration' | 'schema_ddl';

const PRESET_QUERIES = [
  {
    name: '1. Staff Profiles Directory',
    sql: 'SELECT * FROM staff_profiles ORDER BY created_at DESC;'
  },
  {
    name: '2. 30 Districts Revenue & Targets',
    sql: 'SELECT * FROM districts ORDER BY actual_completed_subtotal DESC;'
  },
  {
    name: '3. High & Critical Priority Daily Tasks',
    sql: "SELECT * FROM daily_tasks WHERE priority = 'high' ORDER BY deadline ASC;"
  },
  {
    name: '4. Pending Task Submissions for Approval',
    sql: "SELECT * FROM task_submissions WHERE status = 'submitted' ORDER BY submitted_at DESC;"
  },
  {
    name: '5. Staff Wallets & Available Balances',
    sql: 'SELECT * FROM staff_wallets ORDER BY available_balance DESC;'
  },
  {
    name: '6. Approved Service Partners',
    sql: "SELECT * FROM partner_applications WHERE application_status = 'approved' ORDER BY applied_date DESC;"
  },
  {
    name: '7. Completed Doorstep Bookings',
    sql: "SELECT * FROM booking_records WHERE booking_status = 'completed' ORDER BY service_subtotal DESC;"
  },
  {
    name: '8. Section 10 Task Credit Value Master',
    sql: 'SELECT * FROM task_value_master;'
  },
  {
    name: '9. Permanent Audit Trail History',
    sql: 'SELECT * FROM system_audit_logs ORDER BY timestamp DESC LIMIT 50;'
  },
  {
    name: '10. Count of Records Across Bookings',
    sql: 'SELECT COUNT(*) FROM booking_records;'
  }
];

export const SqlSupabaseAdminIntegration: React.FC<SqlSupabaseAdminIntegrationProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('query_console');

  // Supabase Configuration States
  const [config, setConfig] = useState(getSupabaseConfig());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState(config.url);
  const [customKey, setCustomKey] = useState('');
  const [configError, setConfigError] = useState<string | null>(null);

  // Connection Test States
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message: string;
    details?: string;
  } | null>(null);

  // SQL Query Console States
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [querySearchTerm, setQuerySearchTerm] = useState('');
  const [queryPage, setQueryPage] = useState(1);
  const [queryRowsPerPage, setQueryRowsPerPage] = useState(10);

  // Table Browser States
  const [tableSearch, setTableSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectingTable, setInspectingTable] = useState<typeof TABLE_METADATA_MASTER[0] | null>(null);
  const [inspectingSearch, setInspectingSearch] = useState('');
  const [inspectingJsonRow, setInspectingJsonRow] = useState<any | null>(null);

  // Sync / Migration States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{
    currentTable: string;
    syncedCount: number;
    log: Array<{ table: string; count: number; error?: string }>;
  } | null>(null);
  const [syncSummary, setSyncSummary] = useState<{
    success: boolean;
    totalTables: number;
    syncedTables: number;
    errors: string[];
  } | null>(null);

  // DDL / Seed Copy States
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Realtime Supabase Live Storage & Integrity States
  const [autoSync, setAutoSync] = useState(isAutoSyncEnabled());
  const [isPulling, setIsPulling] = useState(false);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<{
    totalTables: number;
    availableTables: number;
    results: Record<string, { exists: boolean; rowCount?: number; error?: string }>;
  } | null>(null);
  const [syncLogs, setSyncLogs] = useState(getSyncActivityLogs());

  // Periodically refresh sync activity logs
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncLogs(getSyncActivityLogs());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleVerifyIntegrity = async () => {
    setIsVerifyingIntegrity(true);
    try {
      const res = await verifyAllTablesIntegrity();
      setIntegrityReport(res);
      showToast(`Verified: ${res.availableTables} of ${res.totalTables} tables active in Supabase.`);
    } finally {
      setIsVerifyingIntegrity(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsPulling(true);
    try {
      const res = await StorageEngine.pullFromSupabase();
      if (res.success) {
        const total = Object.values(res.pulledCounts).reduce((s, c) => s + c, 0);
        showToast(`Pulled ${total} records across ${Object.keys(res.pulledCounts).length} tables from Supabase!`);
      } else {
        showToast(`Pull error: ${res.error}`);
      }
    } finally {
      setIsPulling(false);
    }
  };

  const handleToggleAutoSync = () => {
    const next = !autoSync;
    setAutoSync(next);
    setAutoSyncEnabled(next);
    showToast(next ? 'Realtime live Supabase persistence enabled!' : 'Auto-sync paused (using local persistence).');
  };

  // Run initial query on mount so console has live data
  useEffect(() => {
    handleRunQuery(PRESET_QUERIES[0].sql);
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      setConfig(getSupabaseConfig());
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);
    const res = setCustomSupabaseConfig(customUrl, customKey);
    if (!res.success) {
      setConfigError(res.error || 'Failed to save configuration');
      return;
    }
    setConfig(getSupabaseConfig());
    setIsConfigModalOpen(false);
    showToast('Supabase credentials successfully updated!');
    handleTestConnection();
  };

  const handleResetConfig = () => {
    clearCustomSupabaseConfig();
    setConfig(getSupabaseConfig());
    setCustomUrl(getSupabaseConfig().url);
    setCustomKey('');
    setTestResult(null);
    showToast('Reset to default environment configuration.');
  };

  const handleRunQuery = async (queryToRun?: string) => {
    const q = (queryToRun || sqlQuery).trim();
    if (!q) return;

    setIsExecuting(true);
    setQueryPage(1);
    try {
      const result = await executeSqlQuery(q);
      setQueryResult(result);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStartPushSync = async () => {
    if (!config.isConfigured) {
      showToast('Please configure Supabase URL & Anon Key before syncing.');
      return;
    }
    setIsSyncing(true);
    setSyncSummary(null);
    const logList: Array<{ table: string; count: number; error?: string }> = [];

    setSyncProgress({
      currentTable: 'Initializing...',
      syncedCount: 0,
      log: []
    });

    try {
      const result = await syncLocalDataToSupabase((tableName, count, error) => {
        logList.unshift({ table: tableName, count, error });
        setSyncProgress({
          currentTable: tableName,
          syncedCount: count,
          log: [...logList]
        });
      });
      setSyncSummary(result);
      if (result.success) {
        showToast('All 23 tables pushed to Supabase successfully!');
      } else {
        showToast(`Sync completed with ${result.errors.length} table errors.`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySqlSeedDump = () => {
    const seedSql = generateFullSqlSeedDump();
    navigator.clipboard.writeText(seedSql);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
    showToast('Generated SQL Seed Dump copied to clipboard!');
  };

  const handleDownloadSeedSql = () => {
    const seedSql = generateFullSqlSeedDump();
    const blob = new Blob([seedSql], { type: 'text/sql;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `doorbly_seed_dump_${new Date().toISOString().slice(0, 10)}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded doorbly_seed_dump.sql');
  };

  const handleDownloadMasterSchema = () => {
    const blob = new Blob([COMPLETE_DOORBLY_SCHEMA_SQL], { type: 'text/sql;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `doorbly_supabase_master_schema_23_tables.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded master schema SQL file.');
  };

  // Filtered Table Browser
  const categories = useMemo(() => {
    const set = new Set<string>();
    TABLE_METADATA_MASTER.forEach((t) => set.add(t.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredTables = useMemo(() => {
    return TABLE_METADATA_MASTER.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(tableSearch.toLowerCase());
      const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [tableSearch, selectedCategory]);

  const totalRecordsAcrossAllTables = useMemo(() => {
    return TABLE_METADATA_MASTER.reduce((sum, t) => sum + t.getData().length, 0);
  }, []);

  // Filtered Query Results for Console Grid
  const filteredQueryRows = useMemo(() => {
    if (!queryResult || !queryResult.rows) return [];
    if (!querySearchTerm.trim()) return queryResult.rows;

    const term = querySearchTerm.toLowerCase();
    return queryResult.rows.filter((row) => {
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(term)
      );
    });
  }, [queryResult, querySearchTerm]);

  const paginatedQueryRows = useMemo(() => {
    const start = (queryPage - 1) * queryRowsPerPage;
    return filteredQueryRows.slice(start, start + queryRowsPerPage);
  }, [filteredQueryRows, queryPage, queryRowsPerPage]);

  const totalQueryPages = Math.ceil(filteredQueryRows.length / queryRowsPerPage) || 1;

  // Export query results to CSV
  const handleExportResultCsv = () => {
    if (!queryResult || !queryResult.rows || queryResult.rows.length === 0) {
      alert('No rows available to export.');
      return;
    }
    const cols = queryResult.columns;
    const csvContent =
      cols.join(',') +
      '\n' +
      queryResult.rows
        .map((row) =>
          cols
            .map((c) => {
              let val = row[c] ?? '';
              if (typeof val === 'object') val = JSON.stringify(val);
              val = String(val).replace(/"/g, '""');
              return `"${val}"`;
            })
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `doorbly_sql_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported query results to CSV!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#123C45] text-white px-4 py-3 rounded-lg shadow-xl text-xs flex items-center space-x-2 border border-teal-500 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-[#123C45] text-white rounded-xl p-5 border border-teal-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E] text-white flex items-center space-x-1">
              <Database className="w-3.5 h-3.5" />
              <span>Database Engine</span>
            </span>
            <span className="text-xs text-teal-300">Central Admin Panel</span>
            <span className="text-[10px] text-teal-200/80 bg-teal-900/60 px-2 py-0.5 rounded font-mono">
              PostgreSQL 14+ / Supabase
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            SQL Query & Supabase Integration Hub
          </h1>
          <p className="text-xs text-teal-100/80 mt-0.5">
            Real-time interactive SQL console, 23 production tables browser, live Supabase synchronization, and automated seed generators.
          </p>
        </div>

        {/* Quick Connection Status & Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 bg-black/25 px-3 py-1.5 rounded-lg border border-teal-700/50 text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${config.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <span className="font-semibold text-white">
                {config.isConfigured ? 'Supabase Configured' : 'Local Storage Engine'}
              </span>
              <span className="text-[10px] text-teal-300 block font-mono">
                {config.isConfigured ? config.url.replace('https://', '').slice(0, 24) + '...' : '30 Districts Offline-Ready'}
              </span>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTestingConn}
            className="px-3 py-1.5 bg-[#0F766E] hover:bg-teal-600 rounded-lg text-white text-xs font-semibold transition flex items-center space-x-1 shadow-xs cursor-pointer disabled:opacity-50"
            title="Ping Supabase connection"
          >
            <Activity className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
            <span>{isTestingConn ? 'Pinging...' : 'Test Ping'}</span>
          </button>

          <button
            onClick={() => {
              setCustomUrl(config.url || '');
              setCustomKey('');
              setIsConfigModalOpen(true);
            }}
            className="px-3 py-1.5 bg-teal-800/80 hover:bg-teal-700 border border-teal-600/50 rounded-lg text-white text-xs font-semibold transition flex items-center space-x-1 shadow-xs cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Configure Credentials</span>
          </button>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-teal-700 rounded-lg text-teal-100 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
          >
            <span>Supabase Cloud</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Ping Results Banner (if tested) */}
      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition animate-in fade-in ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start space-x-2.5">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block">{testResult.message}</span>
              {testResult.details && (
                <span className="text-[11px] text-gray-600 block mt-0.5 font-mono">
                  {testResult.details}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
            {testResult.latencyMs !== undefined && (
              <span className="px-2 py-0.5 bg-white/70 rounded font-mono font-bold text-[11px] border border-gray-200">
                {testResult.latencyMs} ms
              </span>
            )}
            {testResult.message.includes('pending migration') && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(COMPLETE_DOORBLY_SCHEMA_SQL);
                  showToast('Copied full 23-table schema SQL migration to clipboard!');
                }}
                className="px-2.5 py-1 bg-[#0F766E] hover:bg-[#123C45] text-white text-[11px] font-semibold rounded shadow-xs"
              >
                Copy SQL Migration
              </button>
            )}
            {(testResult.message.includes('permission denied') || testResult.details?.includes('permission denied')) && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_PERMISSIONS_FIX_SQL);
                  showToast('Copied Permissions Fix SQL! Paste and run it in Supabase SQL Editor.');
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold rounded shadow-xs"
              >
                Copy Permissions Fix SQL
              </button>
            )}
            {!testResult.success && !testResult.message.includes('permission denied') && (
              <button
                onClick={() => {
                  setCustomUrl(config.url || '');
                  setCustomKey('');
                  setIsConfigModalOpen(true);
                }}
                className="px-2 py-1 bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-semibold rounded shadow-xs"
              >
                Update Key
              </button>
            )}
          </div>
        </div>
      )}

      {/* System Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-gray-500 font-semibold block">PostgreSQL Tables</span>
          <span className="text-xl font-black text-[#123C45]">{TABLE_METADATA_MASTER.length} Tables</span>
          <span className="text-[10px] text-teal-600 font-semibold mt-0.5 block">All 23 Master Schemas</span>
        </div>

        <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-gray-500 font-semibold block">In-Memory / Live Records</span>
          <span className="text-xl font-black text-[#16865D]">{totalRecordsAcrossAllTables.toLocaleString()} Rows</span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Populated across collections</span>
        </div>

        <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-gray-500 font-semibold block">Storage Engine Mode</span>
          <span className="text-base font-bold text-gray-800 flex items-center space-x-1.5 mt-0.5">
            <Server className="w-4 h-4 text-teal-600" />
            <span>{config.isConfigured ? 'Supabase Live' : 'Offline Persistence'}</span>
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5 block">State preserved across reloads</span>
        </div>

        <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-gray-500 font-semibold block">SQL Migration Status</span>
          <span className="text-base font-bold text-emerald-700 flex items-center space-x-1.5 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DDL Production Ready</span>
          </span>
          <span className="text-[10px] text-teal-600 font-semibold mt-0.5 block">Constraints, RLS & Indexes</span>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-1.5 shadow-xs flex items-center space-x-1.5 overflow-x-auto horizontal-scroll-container text-xs">
        {[
          { id: 'query_console', label: 'Interactive SQL Console', icon: Code },
          { id: 'table_browser', label: `23 Tables Browser (${TABLE_METADATA_MASTER.length})`, icon: TableIcon },
          { id: 'sync_migration', label: 'Supabase Sync & Cloud Hub', icon: Upload },
          { id: 'schema_ddl', label: 'Master SQL Schema (DDL)', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`px-3.5 py-2 rounded-lg font-semibold transition shrink-0 whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
                isActive
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SUBTAB 1: INTERACTIVE SQL QUERY CONSOLE
         ========================================================================= */}
      {activeSubTab === 'query_console' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-1.5">
                  <Code className="w-4 h-4 text-[#0F766E]" />
                  <span>SQL Query Runner & Data Inspector</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Write or choose from standard presets to query across live Supabase tables or local workstation datasets.
                </p>
              </div>

              {/* Preset Queries Dropdown */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500 font-semibold shrink-0">Preset Queries:</span>
                <select
                  onChange={(e) => {
                    const found = PRESET_QUERIES.find((p) => p.name === e.target.value);
                    if (found) {
                      setSqlQuery(found.sql);
                      handleRunQuery(found.sql);
                    }
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 font-medium focus:ring-1 focus:ring-[#0F766E] outline-none"
                >
                  {PRESET_QUERIES.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SQL Text Area Editor */}
            <div className="relative">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleRunQuery();
                  }
                }}
                rows={4}
                className="w-full p-3 font-mono text-xs bg-gray-950 text-teal-300 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] shadow-inner"
                placeholder="SELECT * FROM staff_profiles WHERE district_id = 'khordha';"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-500 font-mono">
                Press Ctrl + Enter to run
              </span>
            </div>

            {/* Console Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => handleRunQuery()}
                  disabled={isExecuting || !sqlQuery.trim()}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-bold rounded-lg transition flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>{isExecuting ? 'Executing Query...' : 'Execute SQL'}</span>
                </button>

                <button
                  onClick={() => setSqlQuery('')}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition"
                >
                  Clear
                </button>

                <button
                  onClick={() => {
                    setSqlQuery(PRESET_QUERIES[0].sql);
                    handleRunQuery(PRESET_QUERIES[0].sql);
                  }}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3 text-gray-500" />
                  <span>Reset Default</span>
                </button>
              </div>

              {/* Execution Feedback Details */}
              {queryResult && (
                <div className="flex items-center space-x-3 text-[11px] text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Duration: <strong className="text-gray-900 font-mono">{queryResult.executionTimeMs} ms</strong></span>
                  </span>
                  <span>•</span>
                  <span>Rows: <strong className="text-gray-900 font-mono">{queryResult.rowCount}</strong></span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    queryResult.source === 'supabase_live'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {queryResult.source === 'supabase_live' ? '⚡ Live Supabase PostgreSQL' : '💾 Local Storage SQL Engine'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results Grid Table */}
          {queryResult && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F7F9FA]">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide">
                    Query Results ({filteredQueryRows.length} {filteredQueryRows.length === 1 ? 'row' : 'rows'})
                  </h4>
                  {queryResult.message && (
                    <span className="text-[11px] text-gray-500 italic hidden md:inline">
                      — {queryResult.message}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Result Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter results..."
                      value={querySearchTerm}
                      onChange={(e) => {
                        setQuerySearchTerm(e.target.value);
                        setQueryPage(1);
                      }}
                      className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] w-40 sm:w-56"
                    />
                  </div>

                  <button
                    onClick={handleExportResultCsv}
                    className="px-2.5 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 flex items-center space-x-1"
                    title="Export to CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>

              {queryResult.error ? (
                <div className="p-6 text-center text-xs text-rose-700 bg-rose-50/50 space-y-2">
                  <XCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="font-bold">{queryResult.error}</p>
                  <p className="text-gray-500">Check table names and column identifiers against the 23-table catalog below.</p>
                </div>
              ) : queryResult.rows.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 space-y-1">
                  <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">0 records returned for this query</p>
                  <p className="text-gray-400">The query completed successfully, but returned an empty dataset.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto horizontal-scroll-container max-h-[460px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-100 text-gray-700 border-b border-gray-200 font-bold sticky top-0 z-10 shadow-xs">
                        <tr>
                          <th className="px-3.5 py-2.5 font-mono text-gray-400 text-[10px] w-12 text-center">#</th>
                          {queryResult.columns.map((col) => (
                            <th key={col} className="px-3.5 py-2.5 whitespace-nowrap font-mono text-[11px] text-gray-800">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                        {paginatedQueryRows.map((row, idx) => {
                          const rowNum = (queryPage - 1) * queryRowsPerPage + idx + 1;
                          return (
                            <tr key={idx} className="hover:bg-teal-50/40 transition">
                              <td className="px-3.5 py-2 text-gray-400 text-center text-[10px]">
                                {rowNum}
                              </td>
                              {queryResult.columns.map((col) => {
                                const val = row[col];
                                const isNull = val === null || val === undefined;
                                const isObj = typeof val === 'object' && val !== null;
                                return (
                                  <td key={col} className="px-3.5 py-2 whitespace-nowrap text-gray-800 max-w-xs truncate">
                                    {isNull ? (
                                      <span className="text-gray-400 italic">null</span>
                                    ) : isObj ? (
                                      <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded text-[10px]">
                                        {JSON.stringify(val).slice(0, 30)}...
                                      </span>
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 bg-white">
                    <div className="flex items-center space-x-2">
                      <span>Rows per page:</span>
                      <select
                        value={queryRowsPerPage}
                        onChange={(e) => {
                          setQueryRowsPerPage(Number(e.target.value));
                          setQueryPage(1);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-gray-400">
                        Showing {(queryPage - 1) * queryRowsPerPage + 1} to{' '}
                        {Math.min(queryPage * queryRowsPerPage, filteredQueryRows.length)} of{' '}
                        {filteredQueryRows.length} entries
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setQueryPage((p) => Math.max(p - 1, 1))}
                        disabled={queryPage === 1}
                        className="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="px-2 font-mono font-semibold text-gray-700">
                        {queryPage} / {totalQueryPages}
                      </span>
                      <button
                        onClick={() => setQueryPage((p) => Math.min(p + 1, totalQueryPages))}
                        disabled={queryPage >= totalQueryPages}
                        className="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUBTAB 2: 23 TABLES BROWSER & SCHEMA INSPECTOR
         ========================================================================= */}
      {activeSubTab === 'table_browser' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-1.5">
                  <TableIcon className="w-4 h-4 text-[#0F766E]" />
                  <span>Production PostgreSQL Table Catalog (23 Tables)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Inspect table definitions, foreign key relationships, live records in memory, and query with one click.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      Category: {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {filteredTables.map((t) => {
                const records = t.getData();
                return (
                  <div
                    key={t.name}
                    className="border border-gray-200 rounded-xl p-4 bg-[#F7F9FA] hover:bg-white hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-gray-900 flex items-center space-x-1.5">
                          <TableIcon className="w-4 h-4 text-[#0F766E]" />
                          <span>{t.name}</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-200/70">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Columns: <strong className="font-mono text-gray-900">{t.columnsCount}</strong></span>
                        <span>PK: <strong className="font-mono text-gray-900">{t.primaryKey}</strong></span>
                        <span>Live Rows: <strong className="font-mono text-[#16865D] font-bold">{records.length}</strong></span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            setInspectingTable(t);
                            setInspectingSearch('');
                            setInspectingJsonRow(null);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-teal-50 hover:text-teal-800 text-gray-700 font-semibold rounded-lg text-[11px] transition flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-3 h-3 text-teal-600" />
                          <span>View {records.length} Rows</span>
                        </button>

                        <button
                          onClick={() => {
                            const q = `SELECT * FROM ${t.name};`;
                            setSqlQuery(q);
                            setActiveSubTab('query_console');
                            handleRunQuery(q);
                          }}
                          className="px-2.5 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-lg text-[11px] transition flex items-center justify-center space-x-1"
                        >
                          <Code className="w-3 h-3" />
                          <span>Query in SQL</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 3: SUPABASE SYNC & CLOUD MIGRATION HUB
         ========================================================================= */}
      {activeSubTab === 'sync_migration' && (
        <div className="space-y-6">
          {/* Cloud Integration Status Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-[#0F766E]" />
                  <span>Bi-Directional Supabase Cloud Synchronization</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Seamlessly push local statewide workstation data into your live Supabase PostgreSQL project or export full SQL seed dumps.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleStartPushSync}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Pushing Data...' : 'Push All Tables to Supabase'}</span>
                </button>

                <button
                  onClick={handlePullFromSupabase}
                  disabled={isPulling}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  title="Pull remote rows from Supabase into local storage"
                >
                  <Download className={`w-3.5 h-3.5 text-emerald-700 ${isPulling ? 'animate-spin' : ''}`} />
                  <span>{isPulling ? 'Pulling...' : 'Pull from Supabase'}</span>
                </button>

                <button
                  onClick={handleVerifyIntegrity}
                  disabled={isVerifyingIntegrity}
                  className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 text-[#0F766E] ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingIntegrity ? 'Verifying...' : 'Check Table Integrity'}</span>
                </button>

                <button
                  onClick={handleCopySqlSeedDump}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
                >
                  {copiedSeed ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5 text-teal-700" />}
                  <span>{copiedSeed ? 'Copied Seed Dump!' : 'Copy Seed SQL'}</span>
                </button>

                <button
                  onClick={handleDownloadSeedSql}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Download .sql Dump</span>
                </button>
              </div>
            </div>

            {/* Realtime Live Persistence Control Banner */}
            <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className={`w-3 h-3 rounded-full ${autoSync && config.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                <div>
                  <span className="font-bold text-gray-900 block">
                    Realtime Supabase Storage: {autoSync ? 'Active (All writes save to Supabase)' : 'Paused (Local Only)'}
                  </span>
                  <span className="text-[11px] text-gray-600">
                    {autoSync && config.isConfigured
                      ? 'Every task creation, work submission, approval, attendance clock, and wallet adjustment persists to Supabase automatically.'
                      : 'Changes are preserved in local storage engine until Supabase sync is resumed.'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleAutoSync}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  autoSync
                    ? 'bg-[#0F766E] text-white hover:bg-[#123C45]'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span>{autoSync ? 'Live Sync: ON' : 'Live Sync: OFF'}</span>
              </button>
            </div>

            {/* Integrity Report Display (if checked) */}
            {integrityReport && (
              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                    <span className="font-bold text-gray-900">
                      Table Schema Integrity Report ({integrityReport.availableTables} / {integrityReport.totalTables} Tables Ready)
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    integrityReport.availableTables === integrityReport.totalTables
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {integrityReport.availableTables === integrityReport.totalTables ? 'All Tables Migrated' : 'Pending DDL Migration'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-1 font-mono text-[11px]">
                  {Object.entries(integrityReport.results).map(([table, res]) => (
                    <div
                      key={table}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        res.exists ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50/60 border-rose-200 text-rose-800'
                      }`}
                    >
                      <span className="font-bold truncate">{table}</span>
                      <span className="text-[10px] shrink-0 font-semibold">
                        {res.exists ? `✓ ${res.rowCount ?? 0} rows` : '✗ Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Sync Activity Stream */}
            <div className="bg-gray-950 text-gray-200 p-3.5 rounded-xl border border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="font-bold text-teal-300 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>Realtime Supabase Storage Stream & Activity Logs</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  {syncLogs.length} recent operations logged
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1 font-mono text-[10px]">
                {syncLogs.length === 0 ? (
                  <p className="text-gray-500 py-2">No storage operations recorded yet in this session.</p>
                ) : (
                  syncLogs.slice(0, 15).map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-1 border-b border-gray-900/60">
                      <div className="flex items-center space-x-2 truncate">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          log.status === 'synced'
                            ? 'bg-emerald-900/80 text-emerald-300'
                            : log.status === 'error'
                            ? 'bg-rose-900/80 text-rose-300'
                            : 'bg-teal-900/80 text-teal-300'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                        <span className="text-teal-400 font-bold">{log.table}</span>
                        <span className="text-gray-400 truncate">{log.details}</span>
                      </div>
                      <span className="text-gray-500 shrink-0 text-[9px] ml-2 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sync Progress Display */}
            {syncProgress && (
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl text-xs space-y-3">
                <div className="flex items-center justify-between font-semibold text-teal-900">
                  <span className="flex items-center space-x-2">
                    <Activity className={`w-4 h-4 text-[#0F766E] ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Status: {syncProgress.currentTable}</span>
                  </span>
                  <span>{syncProgress.log.length} of {TABLE_METADATA_MASTER.length} tables processed</span>
                </div>

                {/* Mini Log Table */}
                <div className="max-h-40 overflow-y-auto custom-scrollbar divide-y divide-teal-100 bg-white rounded-lg p-2 border border-teal-200/60 font-mono text-[11px]">
                  {syncProgress.log.map((entry, i) => (
                    <div key={i} className="py-1 flex items-center justify-between">
                      <span className="font-bold text-gray-800">{entry.table}</span>
                      {entry.error ? (
                        <span className="text-rose-600 font-semibold">{entry.error}</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">✓ {entry.count} records upserted</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sync Summary Banner */}
            {syncSummary && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                syncSummary.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>{syncSummary.success ? '✓ Supabase Sync Completed Successfully!' : '⚠ Sync Completed with Exceptions'}</span>
                  <span>{syncSummary.syncedTables} / {syncSummary.totalTables} Tables Synced</span>
                </div>
                {syncSummary.errors.length > 0 && (
                  <div className="pt-2 text-rose-700 font-mono text-[11px] space-y-1">
                    <p className="font-bold">Errors encountered:</p>
                    {syncSummary.errors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4-Step Production Migration Instructions */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span>Production Setup & Deployment Runbook (4 Steps)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-[#F7F9FA] space-y-2">
                <span className="font-bold text-gray-900 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Create Supabase Project & Run Schema DDL</span>
                </span>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Go to your Supabase project SQL Editor and paste the complete 23-table DDL script. This provisions all tables, constraints, UUID extensions, and row-level security policies.
                </p>
                <button
                  onClick={() => setActiveSubTab('schema_ddl')}
                  className="text-teal-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>View & Copy 23-Table DDL Schema →</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-[#F7F9FA] space-y-2">
                <span className="font-bold text-gray-900 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Seed Initial 30 Districts & Designations</span>
                </span>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Execute the initial seed dump to populate the 30 districts of Odisha with daily booking targets, the 12 job designations, departments, and Task Value Master rates.
                </p>
                <button
                  onClick={handleCopySqlSeedDump}
                  className="text-teal-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>{copiedSeed ? 'Copied Seed Dump!' : 'Copy Seed SQL Dump →'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-[#F7F9FA] space-y-2">
                <span className="font-bold text-gray-900 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Configure API URL & Anon Key</span>
                </span>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Configure your project keys either in <code className="bg-gray-200 px-1 py-0.5 rounded">.env</code> or through the Central Admin credentials configuration dialog.
                </p>
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="text-teal-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>Open Credentials Config →</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-[#F7F9FA] space-y-2">
                <span className="font-bold text-gray-900 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Verify Live Connection & Sync</span>
                </span>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Run the live ping test. Once verified, click "Push Local Data to Supabase" to synchronize all field activities, bookings, wallets, and attendance logs.
                </p>
                <button
                  onClick={handleTestConnection}
                  className="text-teal-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>Run Live Connection Ping →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 4: MASTER SCHEMA DDL VIEWER
         ========================================================================= */}
      {activeSubTab === 'schema_ddl' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#0F766E]" />
                  <span>Production Master Schema DDL Script (All 23 Tables)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Full SQL schema including foreign keys, UUID generators, check constraints, indexes, triggers, and Row Level Security (RLS) policies.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(COMPLETE_DOORBLY_SCHEMA_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                    showToast('Full schema SQL copied to clipboard!');
                  }}
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                  <span>{copiedSql ? 'Copied Master DDL!' : 'Copy Master Schema'}</span>
                </button>

                <button
                  onClick={handleDownloadMasterSchema}
                  className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Download .sql</span>
                </button>
              </div>
            </div>

            {/* Syntax-Highlighted Schema Viewer */}
            <div className="relative">
              <pre className="p-4 bg-gray-950 text-teal-300 font-mono text-xs rounded-xl max-h-[550px] overflow-y-auto custom-scrollbar border border-gray-800 leading-relaxed shadow-inner">
                {COMPLETE_DOORBLY_SCHEMA_SQL}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIGURE SUPABASE CREDENTIALS
         ========================================================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden text-xs animate-in fade-in">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-teal-300" />
                <h3 className="font-bold text-sm text-white">Configure Supabase Credentials</h3>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-gray-300 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-5 space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Connect your real Supabase project by providing your project URL and public Anon Key from your Supabase Dashboard settings (<code className="bg-gray-100 px-1 py-0.5 rounded font-mono">Project Settings → API</code>).
              </p>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Supabase Project URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzcompany.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F766E] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Supabase Anon / Public Key *
                </label>
                <input
                  type="password"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F766E] font-mono text-xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Keys are safely used in-browser for authenticated REST requests against your Supabase instance.
                </p>
              </div>

              {configError && (
                <div className="p-2.5 rounded bg-rose-50 text-rose-700 font-semibold text-[11px] border border-rose-200">
                  {configError}
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="text-gray-500 hover:text-rose-600 font-semibold text-[11px]"
                >
                  Reset to Default
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F766E] hover:bg-[#123C45] text-white font-bold rounded-lg shadow-xs"
                  >
                    Save & Test Connection
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TABLE INSPECTOR & DATA VIEWER
         ========================================================================= */}
      {inspectingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-4xl overflow-hidden text-xs animate-in fade-in flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#123C45] text-white shrink-0">
              <div className="flex items-center space-x-2">
                <TableIcon className="w-5 h-5 text-teal-300" />
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">Table: {inspectingTable.name}</h3>
                  <p className="text-[11px] text-teal-200/80">{inspectingTable.description}</p>
                </div>
              </div>
              <button onClick={() => setInspectingTable(null)} className="text-gray-300 hover:text-white text-base">
                ✕
              </button>
            </div>

            {/* Inspector Controls */}
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search in table..."
                  value={inspectingSearch}
                  onChange={(e) => setInspectingSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white w-full focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const q = `SELECT * FROM ${inspectingTable.name};`;
                    setInspectingTable(null);
                    setSqlQuery(q);
                    setActiveSubTab('query_console');
                    handleRunQuery(q);
                  }}
                  className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#123C45] text-white font-semibold rounded-lg text-xs flex items-center space-x-1"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Open in SQL Console</span>
                </button>
              </div>
            </div>

            {/* Table Rows Display */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {(() => {
                const raw = inspectingTable.getData();
                const filtered = inspectingSearch.trim()
                  ? raw.filter((r) =>
                      Object.values(r).some((v) =>
                        String(v).toLowerCase().includes(inspectingSearch.toLowerCase())
                      )
                    )
                  : raw;

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-gray-400">
                      <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p>No records found matching search in {inspectingTable.name}</p>
                    </div>
                  );
                }

                const cols = Object.keys(filtered[0]);

                return (
                  <div className="overflow-x-auto horizontal-scroll-container">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-100 font-bold border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-gray-400 font-mono text-[10px]">#</th>
                          {cols.map((c) => (
                            <th key={c} className="px-3 py-2 font-mono text-[11px] text-gray-800 whitespace-nowrap">
                              {c}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-center font-mono text-[10px]">JSON</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                        {filtered.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            {cols.map((c) => {
                              const v = row[c];
                              return (
                                <td key={c} className="px-3 py-2 whitespace-nowrap text-gray-800 max-w-xs truncate">
                                  {v === null || v === undefined ? (
                                    <span className="text-gray-400 italic">null</span>
                                  ) : typeof v === 'object' ? (
                                    JSON.stringify(v)
                                  ) : (
                                    String(v)
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => setInspectingJsonRow(row)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                title="Inspect JSON"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* JSON Row Viewer Drawer */}
            {inspectingJsonRow && (
              <div className="p-3 bg-gray-950 text-teal-300 border-t border-gray-800 shrink-0 max-h-48 overflow-y-auto custom-scrollbar font-mono text-[10px]">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-gray-800 text-gray-400">
                  <span>Record JSON Inspector</span>
                  <button onClick={() => setInspectingJsonRow(null)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <pre>{JSON.stringify(inspectingJsonRow, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
