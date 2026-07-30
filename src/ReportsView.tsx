import { useState, useMemo } from 'react';
import { generatePdfReport } from './PdfGenerator';

export const ReportsView = ({ beneficiaries }: { beneficiaries: any[] }) => {
    const [selectedCenter, setSelectedCenter] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    const previewRecords = useMemo(() => {
        return beneficiaries.filter(b => {
            const matchCenter = !selectedCenter || (b.center || '').toLowerCase() === selectedCenter.toLowerCase();
            const matchProgram = !selectedProgram || (b.programType || '').toLowerCase() === selectedProgram.toLowerCase();
            const matchModule = !selectedModule || (b.moduleType || '') === selectedModule;
            const matchDate = (!fromDate || !toDate) ? true : (b.date >= fromDate && b.date <= toDate);
            return matchCenter && matchProgram && matchModule && matchDate && !b.isDeleted;
        });
    }, [beneficiaries, selectedCenter, selectedProgram, selectedModule, fromDate, toDate]);

    const handleDownload = () => {
        console.log('handleDownload');
        generatePdfReport(previewRecords, selectedCenter, selectedModule, selectedProgram, fromDate, toDate);
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-textPrimary">Generate Reports</h2>
            <div className="bg-slateSurface p-6 rounded-2xl border border-slateBorder flex flex-col gap-6">
                <h3 className="font-bold text-textPrimary">Filter Criteria</h3>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-bold text-textSecondary uppercase">Center</label>
                        <select 
                            className="h-11 bg-slateBg rounded-xl px-4 text-sm font-bold text-textPrimary border border-slateBorder outline-none focus:border-childrenPrimary"
                            value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}>
                            <option value="">All Centers</option>
                            <option value="Asansol">Asansol</option>
                            <option value="Nagpur">Nagpur</option>
                        </select>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-bold text-textSecondary uppercase">Program</label>
                        <select 
                            className="h-11 bg-slateBg rounded-xl px-4 text-sm font-bold text-textPrimary border border-slateBorder outline-none focus:border-childrenPrimary"
                            value={selectedProgram} onChange={e => { setSelectedProgram(e.target.value); setSelectedModule(''); }}>
                            <option value="">All Programs</option>
                            <option value="Children">Children</option>
                            <option value="Women">Women</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-bold text-textSecondary uppercase">Module</label>
                        <select 
                            className="h-11 bg-slateBg rounded-xl px-4 text-sm font-bold text-textPrimary border border-slateBorder outline-none focus:border-childrenPrimary"
                            value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
                            <option value="">All Categories</option>
                            {(!selectedProgram || selectedProgram === 'Children') && (
                                <>
                                    <option value="children_residential">Residential Home</option>
                                    <option value="graduates">Graduates</option>
                                    <option value="daycare">Daycare</option>
                                    <option value="education_support">Education Program</option>
                                </>
                            )}
                            {(!selectedProgram || selectedProgram === 'Women') && (
                                <>
                                    <option value="women_support">Help & Support</option>
                                    <option value="women_medical_hiv">Medical (HIV)</option>
                                    <option value="outreach_programs">Outreach Programs</option>
                                    <option value="skill_training">Skill Training</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-bold text-textSecondary uppercase">From Date</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-11 bg-slateBg rounded-xl px-4 text-sm font-bold text-textPrimary border border-slateBorder outline-none focus:border-childrenPrimary" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-bold text-textSecondary uppercase">To Date</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="h-11 bg-slateBg rounded-xl px-4 text-sm font-bold text-textPrimary border border-slateBorder outline-none focus:border-childrenPrimary" />
                    </div>
                </div>
                
                <button onClick={() => { console.log('Button clicked'); handleDownload(); }} className="h-12 bg-womenPrimary hover:bg-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download PDF Report
                </button>
            </div>
            
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-textPrimary text-lg">Preview Report</h3>
                <span className="text-sm font-bold text-textSecondary bg-slateSurface px-3 py-1 rounded-full border border-slateBorder">{previewRecords.length} records</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previewRecords.map(rec => (
                    <div key={rec.id} className="bg-slateSurface p-4 rounded-xl border border-slateBorder flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-textPrimary text-sm truncate">{rec.name}</span>
                            <span className="text-xs font-bold text-textSecondary">{rec.center}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-textSecondary">{rec.programType} - {rec.moduleType}</span>
                            <span className="font-bold text-successColor">{rec.status}</span>
                        </div>
                    </div>
                ))}
                {previewRecords.length === 0 && (
                    <div className="col-span-full h-32 flex items-center justify-center text-textSecondary text-sm font-bold bg-slateSurface rounded-xl border border-slateBorder border-dashed">
                        No records match the active criteria.
                    </div>
                )}
            </div>
        </div>
    );
};
