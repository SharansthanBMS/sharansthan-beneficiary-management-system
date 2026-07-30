import sys

content = open('src/App.tsx').read()
content = content.replace("import React, { useState, useEffect, useMemo } from 'react';", "import React, { useState, useEffect, useMemo } from 'react';\nimport { ReportsView } from './ReportsView';")
content = content.replace("const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'analytics' | 'pending-deletes'>('dashboard');", "const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'analytics' | 'pending-deletes' | 'reports'>('dashboard');")

sidebar_reports = """
            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => { setActiveTab('reports'); setSelectedModule(null); }}
                className={`w-full h-11 rounded-xl px-4 flex items-center gap-3 text-sm font-bold transition ${activeTab === 'reports' ? 'bg-childrenPrimary text-white' : 'text-textSecondary hover:bg-slateBg hover:text-textPrimary'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Reports
              </button>
            )}
"""

target1 = "{currentUser?.role === 'admin' && pendingDeletesCount > 0 && ("
if target1 in content:
    content = content.replace(target1, sidebar_reports + '\n' + target1)
else:
    print("TARGET 1 NOT FOUND")

reports_view = """
        {activeTab === 'reports' && (
          <ReportsView beneficiaries={filteredBeneficiaries} />
        )}
"""
target2 = "{activeTab === 'pending-deletes' && ("
if target2 in content:
    content = content.replace(target2, reports_view + '\n' + target2)
else:
    print("TARGET 2 NOT FOUND")

open('src/App.tsx', 'w').write(content)
print("Done patching App.tsx")
