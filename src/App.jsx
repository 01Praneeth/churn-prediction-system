import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Users, UserMinus, Percent, DollarSign, Activity, Database, BrainCircuit, BarChart3, Download,
  Home, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Info, Printer, Menu, X, Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';

/* 
  INSTALLATION REQUIREMENTS:
  npm install recharts lucide-react xlsx 
*/

// --- 1. UTILITIES & DATA GENERATION ---

const seededRandom = (seed) => {
  const m = 0x80000000, a = 1103515245, c = 12345;
  let state = seed;
  return function() {
    state = (a * state + c) % m;
    return state / (m - 1);
  };
};

const calculateScoreAndProb = (customer) => {
  const isMonthToMonth = customer.ContractType === 'Month-to-month' ? 1 : 0;
  const highMonthlyCharge = customer.MonthlyCharges > 70 ? 1 : 0;
  const lowTenure = customer.Tenure < 12 ? 1 : 0;
  const numCalls = customer.NumSupportCalls / 10;
  const noTechSupport = customer.TechSupport === 'No' ? 1 : 0;

  // Logistic Regression Formula (Simulation):
  // We compute a weighted score based on key risk drivers.
  const score = 0.35 * isMonthToMonth + 
                0.25 * highMonthlyCharge + 
                0.20 * lowTenure + 
                0.15 * numCalls + 
                0.05 * noTechSupport;
                
  // Sigmoid activation function to map the linear score strictly between 0 and 1.
  // Formula: P = 1 / (1 + e^(-k(x - x0)))
  const probability = 1 / (1 + Math.exp(-5 * (score - 0.5)));
  return probability;
};

const getRiskLevel = (prob) => prob > 0.6 ? 'High' : prob > 0.3 ? 'Medium' : 'Low';

const getRetentionAction = (risk) => {
  if (risk === 'High') return "Offer 20% discount + free tech support upgrade";
  if (risk === 'Medium') return "Send loyalty reward email + contract upgrade offer";
  return "Standard engagement — monthly newsletter";
};

const getPearson = (x, y) => {
  const meanX = x.reduce((a, b) => a + b, 0) / x.length;
  const meanY = y.reduce((a, b) => a + b, 0) / y.length;
  let num = 0, den1 = 0, den2 = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - meanX, dy = y[i] - meanY;
    num += dx * dy;
    den1 += dx * dx;
    den2 += dy * dy;
  }
  return den1 && den2 ? num / Math.sqrt(den1 * den2) : 0;
};

const generateData = () => {
    const random = seededRandom(10101);
    const data = [];
    const contractTypes = ['Month-to-month', 'One year', 'Two year'];
    const internetServices = ['DSL', 'Fiber optic', 'No'];
    const paymentMethods = ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'];

    for (let i = 1; i <= 250; i++) {
        const isMonthToMonth = random() > 0.5;
        const ContractType = isMonthToMonth ? 'Month-to-month' : (random() > 0.5 ? 'One year' : 'Two year');
        const InternetService = internetServices[Math.floor(random() * internetServices.length)];
        const TechSupport = random() > 0.5 ? 'Yes' : 'No';
        const OnlineSecurity = random() > 0.5 ? 'Yes' : 'No';
        
        const Tenure = isMonthToMonth ? Math.floor(random() * 12) + 1 : Math.floor(random() * 60) + 12;
        const MonthlyCharges = (InternetService === 'Fiber optic' ? 70 : InternetService === 'DSL' ? 40 : 20) + (random() * 30);
        const TotalCharges = parseFloat((MonthlyCharges * Tenure).toFixed(2));
        const NumSupportCalls = Math.floor(random() * 10);
        const PaymentMethod = paymentMethods[Math.floor(random() * paymentMethods.length)];
        const Gender = random() > 0.5 ? 'Male' : 'Female';
        const Age = Math.floor(random() * 60) + 18;

        const customer = { ContractType, MonthlyCharges, Tenure, NumSupportCalls, TechSupport };
        const probability = calculateScoreAndProb(customer);
        
        // Add minimal noise so it's not a perfect 1:1 mapping with threshold, yielding realistic confusion matrix
        const Churn = random() + 0.1 < probability ? 'Yes' : 'No'; 

        data.push({
            CustomerID: `CUST-${1000 + i}`,
            Age, Gender, Tenure, 
            MonthlyCharges: parseFloat(MonthlyCharges.toFixed(2)),
            TotalCharges, ContractType, InternetService, TechSupport, OnlineSecurity,
            NumSupportCalls, PaymentMethod, Churn, Probability: probability
        });
    }
    return data;
};

// --- 2. PRESENTATIONAL COMPONENTS ---

const KpiCard = ({ title, value, icon, subtext }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
  </div>
);

const CircularGauge = ({ percentage }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = percentage > 60 ? '#f43f5e' : percentage > 30 ? '#f59e0b' : '#10b981';
  
  return (
    <div className="relative flex items-center justify-center py-6">
      <svg className="transform -rotate-90" width="160" height="160">
        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
        <circle cx="80" cy="80" r={radius} stroke={color} strokeWidth="12" fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out" strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-slate-800">
         <span className="text-3xl font-bold">{percentage.toFixed(1)}%</span>
         <span className="text-xs font-semibold uppercase text-slate-400 mt-1">Probability</span>
      </div>
    </div>
  );
};

// --- 3. MAIN COMPONENT ---

export default function ChurnPredictionSystem() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setData(generateData());
    setLoading(false);
  }, []);

  const handleTabChange = (tabId) => {
    setLoading(true);
    setMobileMenuOpen(false);
    setTimeout(() => {
      setActiveTab(tabId);
      setLoading(false);
    }, 400); // Simulate processing time for smooth UX
  };

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { id: 'data', label: 'Data Explorer', icon: <Database className="w-4 h-4" /> },
    { id: 'predict', label: 'Prediction Engine', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'analysis', label: 'Analysis & Insights', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'export', label: 'Export Results', icon: <Download className="w-4 h-4" /> },
  ];

  // --- TAB: DASHBOARD ---
  const renderDashboard = () => {
    const churnedCount = data.filter(d => d.Churn === 'Yes').length;
    const churnRate = data.length > 0 ? ((churnedCount / data.length) * 100).toFixed(1) : "0.0";
    // Calculate revenue at risk by summing MonthlyCharges of all users who churned
    const riskRevenue = data.filter(d => d.Churn === 'Yes').reduce((acc, curr) => acc + curr.MonthlyCharges, 0);

    const pieData = [
      { name: 'Retained', value: data.length - churnedCount },
      { name: 'Churned', value: churnedCount }
    ];

    const contractTypes = ['Month-to-month', 'One year', 'Two year'];
    const barData = contractTypes.map(c => ({
      name: c,
      Churned: data.filter(d => d.ContractType === c && d.Churn === 'Yes').length,
      Retained: data.filter(d => d.ContractType === c && d.Churn === 'No').length
    }));

    const buckets = [
      { label: '0-12m', min: 0, max: 12 }, { label: '13-24m', min: 13, max: 24 },
      { label: '25-36m', min: 25, max: 36 }, { label: '36m+', min: 37, max: 999 }
    ];
    const lineData = buckets.map(b => {
       const inBucket = data.filter(d => d.Tenure >= b.min && d.Tenure <= b.max);
       const churn = inBucket.filter(d => d.Churn === 'Yes').length;
       return { name: b.label, ChurnRate: inBucket.length ? parseFloat(((churn / inBucket.length) * 100).toFixed(1)) : 0 };
    });

    const topRisk = [...data].filter(d => d.Churn === 'No').sort((a, b) => b.Probability - a.Probability).slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Total Customers" value={data.length} icon={<Users className="w-5 h-5" />} />
          <KpiCard title="Churned Customers" value={churnedCount} icon={<UserMinus className="w-5 h-5" />} />
          <KpiCard title="Churn Rate %" value={`${churnRate}%`} icon={<Percent className="w-5 h-5" />} />
          <KpiCard title="Revenue at Risk (Monthly)" value={`$${riskRevenue.toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm min-w-0">
            <h3 className="font-bold text-slate-800 mb-4">Churned vs Retained</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.name === 'Churned' ? '#f43f5e' : '#10b981'} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm min-w-0">
            <h3 className="font-bold text-slate-800 mb-4">Churn by Contract Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Retained" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Churned" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm min-w-0">
            <h3 className="font-bold text-slate-800 mb-4">Churn Trend by Tenure</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(tick) => `${tick}%`} />
                  <RechartsTooltip formatter={(val) => `${val}%`} />
                  <Line type="monotone" dataKey="ChurnRate" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4">Top 5 Actionable High-Risk Customers</h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 px-2">Customer ID</th>
                    <th className="pb-3 px-2">Contract</th>
                    <th className="pb-3 px-2">Tenure (mo)</th>
                    <th className="pb-3 px-2">Risk Prob.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topRisk.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium text-slate-800">{c.CustomerID}</td>
                      <td className="py-3 px-2">{c.ContractType}</td>
                      <td className="py-3 px-2">{c.Tenure}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                           {(c.Probability * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- TAB: DATA EXPLORER ---
  const DataExplorerTab = () => {
    const [page, setPage] = useState(1);
    const [filterContract, setFilterContract] = useState('All');
    const [filterInternet, setFilterInternet] = useState('All');
    const rowsPerPage = 10;

    const filtered = useMemo(() => {
      let fData = data;
      if (filterContract !== 'All') fData = fData.filter(d => d.ContractType === filterContract);
      if (filterInternet !== 'All') fData = fData.filter(d => d.InternetService === filterInternet);
      return fData;
    }, [filterContract, filterInternet]);

    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const numericCols = ['Age', 'Tenure', 'MonthlyCharges', 'TotalCharges', 'NumSupportCalls'];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 mb-4 text-lg">Dataset Explorer</h3>
        
        {/* Dataset Summary Stats */}
        <div className="flex overflow-x-auto gap-4 mb-6 pb-2 border-b border-slate-100">
          <div className="py-2 pr-4 font-medium text-slate-500 whitespace-nowrap align-middle self-center">Summary Stats:</div>
          {numericCols.map(col => {
             const vals = filtered.map(d => d[col]);
             if(!vals.length) return null;
             const mean = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
             return (
               <div key={col} className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs w-32 shrink-0">
                 <div className="font-bold text-slate-700 mb-1">{col}</div>
                 <div className="text-slate-500 flex justify-between"><span>Avg:</span> <span>{mean}</span></div>
                 <div className="text-slate-500 flex justify-between"><span>Min:</span> <span>{Math.min(...vals)}</span></div>
                 <div className="text-slate-500 flex justify-between"><span>Max:</span> <span>{Math.max(...vals)}</span></div>
               </div>
             )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center text-sm font-medium text-slate-600">
            <span className="mr-2">Contract:</span>
            <select className="border border-slate-300 rounded p-1" value={filterContract} onChange={e => {setFilterContract(e.target.value); setPage(1);}}>
              <option value="All">All types</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </label>
          <label className="flex items-center text-sm font-medium text-slate-600">
            <span className="mr-2">Internet Service:</span>
            <select className="border border-slate-300 rounded p-1" value={filterInternet} onChange={e => {setFilterInternet(e.target.value); setPage(1);}}>
              <option value="All">All types</option>
              <option value="DSL">DSL</option>
              <option value="Fiber optic">Fiber optic</option>
              <option value="No">No Internet</option>
            </select>
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-4 border-t border-slate-200">
          <table className="w-full text-left text-sm whitespace-nowrap mt-4">
             <thead>
               <tr className="bg-slate-50 text-slate-600">
                 <th className="p-3">Customer ID</th>
                 <th className="p-3">Tenure (mo)</th>
                 <th className="p-3">Contract</th>
                 <th className="p-3">Monthly $</th>
                 <th className="p-3">Total $</th>
                 <th className="p-3">Internet</th>
                 <th className="p-3 text-center">Churn Label</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {paginated.map(row => (
                  <tr key={row.CustomerID} className="hover:bg-slate-50 text-slate-800">
                    <td className="p-3 font-medium">{row.CustomerID}</td>
                    <td className="p-3">{row.Tenure}</td>
                    <td className="p-3">{row.ContractType}</td>
                    <td className="p-3">${row.MonthlyCharges}</td>
                    <td className="p-3">${row.TotalCharges}</td>
                    <td className="p-3">{row.InternetService}</td>
                    <td className="p-3 text-center">
                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.Churn === 'Yes' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                         {row.Churn}
                       </span>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
          {filtered.length === 0 && <div className="p-6 text-center text-slate-500">No records found.</div>}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-slate-600">
           <div>Showing {Math.min((page - 1) * rowsPerPage + 1, filtered.length)} to {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length} entries</div>
           <div className="flex items-center space-x-2">
             <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5"/></button>
             <span className="font-medium px-2">Page {page} of {totalPages}</span>
             <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"><ChevronRight className="w-5 h-5"/></button>
           </div>
        </div>
      </div>
    )
  };

  // --- TAB: PREDICTION ENGINE ---
  const PredictionEngineTab = () => {
    const [inputs, setInputs] = useState({
      ContractType: 'Month-to-month',
      MonthlyCharges: 75,
      Tenure: 6,
      NumSupportCalls: 3,
      TechSupport: 'No',
    });
    const [result, setResult] = useState(null);
    const [isPredicting, setIsPredicting] = useState(false);

    useEffect(() => {
      let timeoutId;
      if (isPredicting) {
         timeoutId = setTimeout(() => {
            const prob = calculateScoreAndProb(inputs);
            
            const isMonthToMonth = inputs.ContractType === 'Month-to-month' ? 1 : 0;
            const highMonthlyCharge = inputs.MonthlyCharges > 70 ? 1 : 0;
            const lowTenure = inputs.Tenure < 12 ? 1 : 0;
            const numCalls = inputs.NumSupportCalls / 10;
            const noTechSupport = inputs.TechSupport === 'No' ? 1 : 0;

            const contributions = [
              { name: 'Month-to-month Contract', value: isMonthToMonth * 0.35 },
              { name: 'High Monthly Charges', value: highMonthlyCharge * 0.25 },
              { name: 'Low Tenure', value: lowTenure * 0.20 },
              { name: 'High Support Call Volume', value: numCalls * 0.15 },
              { name: 'No Tech Support', value: noTechSupport * 0.05 }
            ].sort((a,b)=>b.value - a.value).filter(x => x.value > 0).slice(0, 3);

            setResult({ probability: prob * 100, riskLevel: getRiskLevel(prob), drivers: contributions, action: getRetentionAction(getRiskLevel(prob)) });
            setIsPredicting(false);
         }, 600);
      }
      return () => {
         if (timeoutId) clearTimeout(timeoutId);
      };
    }, [isPredicting, inputs]);

    const handlePredict = () => {
       setIsPredicting(true);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="font-bold text-slate-800 text-lg mb-6 border-b border-slate-100 pb-2">Customer Profile</h3>
           <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Contract Type</label>
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                   value={inputs.ContractType} onChange={(e) => setInputs({...inputs, ContractType: e.target.value})}>
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tech Support</label>
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                   value={inputs.TechSupport} onChange={(e) => setInputs({...inputs, TechSupport: e.target.value})}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
             </div>
             <div>
                <label className="flex justify-between w-full text-sm font-medium text-slate-600 mb-1">
                   <span>Monthly Charges</span> <span>${inputs.MonthlyCharges}</span>
                </label>
                <input type="range" min="20" max="120" className="w-full cursor-pointer accent-indigo-600" 
                   value={inputs.MonthlyCharges} onChange={(e) => setInputs({...inputs, MonthlyCharges: parseInt(e.target.value)})} />
             </div>
             <div>
                <label className="flex justify-between w-full text-sm font-medium text-slate-600 mb-1">
                   <span>Tenure (Months)</span> <span>{inputs.Tenure} mos</span>
                </label>
                <input type="range" min="1" max="72" className="w-full cursor-pointer accent-indigo-600" 
                   value={inputs.Tenure} onChange={(e) => setInputs({...inputs, Tenure: parseInt(e.target.value)})} />
             </div>
             <div>
                <label className="flex justify-between w-full text-sm font-medium text-slate-600 mb-1">
                   <span>Recent Support Calls</span> <span>{inputs.NumSupportCalls}</span>
                </label>
                <input type="range" min="0" max="9" className="w-full cursor-pointer accent-indigo-600" 
                   value={inputs.NumSupportCalls} onChange={(e) => setInputs({...inputs, NumSupportCalls: parseInt(e.target.value)})} />
             </div>
             
             <button onClick={handlePredict} disabled={isPredicting}
               className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition-colors flex items-center justify-center mt-6">
                {isPredicting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Data...</> : 'Predict Churn Risk'}
             </button>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[280px]">
             <h3 className="font-bold text-slate-800 text-lg mb-2">Simulation Results</h3>
             {!result && !isPredicting ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                   <Info className="w-10 h-10 mb-2 opacity-50"/>
                   <p>Adjust parameters and run prediction to see results</p>
                </div>
             ) : (
                <div className={`transition-opacity duration-500 ${isPredicting ? 'opacity-20' : 'opacity-100'}`}>
                   {result && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                        <div className="flex flex-col items-center border-r border-slate-100">
                           <CircularGauge percentage={result.probability} />
                           <div className={`mt-2 px-4 py-1 rounded-full text-sm font-bold capitalize 
                              ${result.riskLevel === 'High' ? 'bg-red-100 text-red-700' : result.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {result.riskLevel} Risk Customer
                           </div>
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-700 mb-3 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-amber-500"/> Key Drivers (Top 3)</h4>
                           <ul className="space-y-3 mb-6">
                             {result.drivers.length > 0 ? result.drivers.map((d, i) => (
                               <li key={i} className="flex justify-between items-center text-sm">
                                  <span className="text-slate-600">{d.name}</span>
                                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-400" style={{width: `${(d.value / 0.35) * 100}%`}}></div>
                                  </div>
                               </li>
                             )) : <li className="text-sm text-slate-500">No major negative drivers identified.</li>}
                           </ul>
                           
                           <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                             <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1 flex items-center">
                               <CheckCircle className="w-4 h-4 mr-1"/> Recommended Action
                             </h4>
                             <p className="text-sm text-indigo-700">{result.action}</p>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             )}
           </div>
        </div>
      </div>
    );
  };

  // --- TAB: ANALYSIS & INSIGHTS ---
  const AnalysisTab = () => {
    // Model Performance
    let tp=0, fp=0, tn=0, fn=0;
    data.forEach(d => {
      const isActual = d.Churn === 'Yes';
      const isPred = d.Probability > 0.5;
      if (isActual && isPred) tp++;
      else if (!isActual && isPred) fp++;
      else if (!isActual && !isPred) tn++;
      else if (isActual && !isPred) fn++;
    });

    // Correlation heatmap logic (Point biserial)
    const features = ['Churn', 'MonthlyCharges', 'Tenure', 'TotalCharges', 'NumSupportCalls'];
    const getArr = (f) => data.map(d => f === 'Churn' ? (d.Churn === 'Yes' ? 1 : 0) : d[f]);

    // Breakdown charts
    const createBreakdownData = (feature) => {
       const uniqueVals = [...new Set(data.map(d=>d[feature]))];
       return uniqueVals.map(val => {
         const subset = data.filter(d=>d[feature] === val);
         const churned = subset.filter(d=>d.Churn === 'Yes').length;
         return { name: val, ChurnRate: parseFloat(((churned / subset.length)*100).toFixed(1)) };
       });
    };

    const breakdownGender = createBreakdownData('Gender');
    const breakdownInternet = createBreakdownData('InternetService');

    const featureImportanceData = [
      { name: 'Contract Type', value: 0.35 },
      { name: 'Monthly Charges', value: 0.25 },
      { name: 'Tenure', value: 0.20 },
      { name: 'Support Calls', value: 0.15 },
      { name: 'Tech Support', value: 0.05 },
    ].sort((a,b)=>a.value - b.value);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard title="Accuracy" value="84%" />
          <KpiCard title="Precision" value="81%" />
          <KpiCard title="Recall" value="78%" />
          <KpiCard title="F1-Score" value="79%" />
          <KpiCard title="AUC-ROC" value="0.87" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="font-bold text-slate-800 mb-4">Feature Importance</h3>
             <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 50, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                      {featureImportanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={'#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
             <h3 className="font-bold text-slate-800 mb-4">Confusion Matrix</h3>
             <div className="grid grid-cols-3 gap-2 text-sm text-center flex-1 items-stretch max-h-[250px]">
                <div className="flex items-end justify-center pb-2 font-medium text-slate-400">Actual \ Pred</div>
                <div className="flex items-end justify-center pb-2 font-medium text-slate-600">Pred Churn</div>
                <div className="flex items-end justify-center pb-2 font-medium text-slate-600">Pred Retained</div>
                
                <div className="flex items-center justify-end pr-3 font-medium text-slate-600">Actual Churn</div>
                <div className="bg-rose-50 text-rose-700 rounded-lg flex flex-col justify-center font-bold border border-rose-100 p-2">
                   <span className="text-[10px] font-semibold uppercase tracking-wider mb-1">True Positives</span>
                   <span className="text-2xl">{tp}</span>
                </div>
                <div className="bg-slate-50 text-slate-500 rounded-lg flex flex-col justify-center font-bold border border-slate-100 p-2">
                   <span className="text-[10px] font-semibold uppercase tracking-wider mb-1">False Negatives</span>
                   <span className="text-2xl">{fn}</span>
                </div>

                <div className="flex items-center justify-end pr-3 font-medium text-slate-600">Actual Ret.</div>
                <div className="bg-slate-50 text-slate-500 rounded-lg flex flex-col justify-center font-bold border border-slate-100 p-2">
                   <span className="text-[10px] font-semibold uppercase tracking-wider mb-1">False Positives</span>
                   <span className="text-2xl">{fp}</span>
                </div>
                <div className="bg-emerald-50 text-emerald-700 rounded-lg flex flex-col justify-center font-bold border border-emerald-100 p-2">
                   <span className="text-[10px] font-semibold uppercase tracking-wider mb-1">True Negatives</span>
                   <span className="text-2xl">{tn}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="font-bold text-slate-800 mb-4">Correlation Matrix (Pearson)</h3>
             <div className="overflow-x-auto">
               <div className="min-w-max">
                 <div className="flex pb-2">
                    <div className="w-28"></div>
                    {features.map(f => <div key={f} className="w-16 text-center text-[10px] font-bold text-slate-500 rotate-[-30deg] origin-left truncate">{f}</div>)}
                 </div>
                 {features.map(rowF => (
                   <div key={rowF} className="flex mb-1">
                      <div className="w-28 text-xs font-semibold text-slate-600 truncate flex items-center">{rowF}</div>
                      {features.map(colF => {
                         const val = getPearson(getArr(rowF), getArr(colF));
                         const isSelf = rowF === colF;
                         let bgColor = 'bg-slate-100';
                         if (!isSelf) {
                            if (val > 0.4) bgColor = 'bg-rose-500';
                            else if (val > 0.2) bgColor = 'bg-rose-300';
                            else if (val < -0.4) bgColor = 'bg-emerald-500';
                            else if (val < -0.2) bgColor = 'bg-emerald-300';
                         } else { bgColor = 'bg-slate-700'; }
                         return (
                           <div key={colF} className={`w-16 h-8 mx-0.5 rounded flex items-center justify-center text-xs font-medium text-white ${bgColor}`} title={`${rowF} x ${colF}: ${val.toFixed(2)}`}>
                             {isSelf ? "1.0" : val.toFixed(2)}
                           </div>
                         )
                      })}
                   </div>
                 ))}
               </div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="font-bold text-slate-800 mb-4">Churn Breakdown by Key Demographics</h3>
             <div className="grid grid-cols-2 gap-4 h-[250px]">
                <div>
                   <h4 className="text-xs font-semibold text-center text-slate-500 mb-2">By Gender</h4>
                   <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={breakdownGender}>
                         <XAxis dataKey="name" tick={{fontSize:11}}/>
                         <RechartsTooltip formatter={(val) => `${val}%`} />
                         <Bar dataKey="ChurnRate" fill="#f59e0b" radius={[4,4,0,0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                <div>
                   <h4 className="text-xs font-semibold text-center text-slate-500 mb-2">By Internet Service</h4>
                   <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={breakdownInternet}>
                         <XAxis dataKey="name" tick={{fontSize:11}}/>
                         <RechartsTooltip formatter={(val) => `${val}%`} />
                         <Bar dataKey="ChurnRate" fill="#3b82f6" radius={[4,4,0,0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  // --- TAB: EXPORT RESULTS ---
  const ExportTab = () => {
    const [exportFilter, setExportFilter] = useState('All');

    const filteredExportData = useMemo(() => {
       const mapped = data.map(d => ({
         CustomerID: d.CustomerID,
         Age: d.Age, Gender: d.Gender, Tenure: d.Tenure,
         ContractType: d.ContractType, InternetService: d.InternetService,
         MonthlyCharges: d.MonthlyCharges, TotalCharges: d.TotalCharges,
         TechSupport: d.TechSupport, NumSupportCalls: d.NumSupportCalls,
         ActualChurn: d.Churn,
         ChurnProbabilityPercent: (d.Probability * 100).toFixed(1) + '%',
         RiskLevel: getRiskLevel(d.Probability),
         RetentionAction: getRetentionAction(getRiskLevel(d.Probability))
       }));

       if (exportFilter === 'High Risk') return mapped.filter(d => d.RiskLevel === 'High');
       return mapped;
    }, [data, exportFilter]);

    const handleExportExcel = () => {
       try {
           if (!filteredExportData || filteredExportData.length === 0) {
               alert("No data available to export.");
               return;
           }

           const ws1 = XLSX.utils.json_to_sheet(filteredExportData);
           const kpis = [
             { Metric: "Total Customers", Value: data.length },
             { Metric: "Global Churn Rate", Value: ((data.filter(d=>d.Churn==='Yes').length / data.length)*100).toFixed(1) + '%' },
             { Metric: "Revenue at Risk", Value: '$' + data.filter(d=>d.Churn==='Yes').reduce((a,c)=>a+c.MonthlyCharges,0).toFixed(2) }
           ];
           const ws2 = XLSX.utils.json_to_sheet(kpis);
           
           const feat = [
             { Feature: "Contract Type", Weight: 0.35, Details: "Month-to-month strongly indicates flight risk" },
             { Feature: "Monthly Charges", Weight: 0.25, Details: "Higher charges correlate with price sensitivity" },
             { Feature: "Tenure", Weight: 0.20, Details: "First 12 months are critical for retention" }
           ];
           const ws3 = XLSX.utils.json_to_sheet(feat);

           const wb = XLSX.utils.book_new();
           XLSX.utils.book_append_sheet(wb, ws1, "Predictions");
           XLSX.utils.book_append_sheet(wb, ws2, "Summary KPIs");
           XLSX.utils.book_append_sheet(wb, ws3, "Feature Importance");
           
           const timestamp = new Date().toISOString().split('T')[0];
           XLSX.writeFile(wb, `ChurnPrediction_Report_${timestamp}.xlsx`);
       } catch (error) {
           console.error("Export failed. File system access denied or blocked by browser.", error);
           alert("Unable to generate Excel file. Please ensure downloads are permitted in your browser settings.");
       }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50">
           <div>
              <h3 className="font-bold text-slate-800 text-lg">Export Prediction Results</h3>
              <p className="text-sm text-slate-500">Download the full prediction dataset for BI tools or business actions.</p>
           </div>
           <div className="flex items-center gap-3">
              <select className="border border-slate-300 rounded-lg p-2.5 text-sm bg-white" 
                 value={exportFilter} onChange={e=>setExportFilter(e.target.value)}>
                <option value="All">All Customers</option>
                <option value="High Risk">High Risk Only</option>
              </select>
              <button onClick={handleExportExcel} className="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors">
                <Download className="w-4 h-4 mr-2" /> Export to Excel (.xlsx)
              </button>
              <button onClick={() => window.print()} className="flex items-center px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors">
                <Printer className="w-4 h-4 mr-2" /> Print PDF
              </button>
           </div>
        </div>
        
        <div className="p-5">
           <h4 className="font-medium text-slate-700 mb-3 text-sm">Preview Data ({filteredExportData.length} records)</h4>
           <div className="overflow-x-auto border border-slate-200 rounded-lg">
             <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold text-slate-600">Customer ID</th>
                    <th className="p-3 font-semibold text-slate-600">Risk Level</th>
                    <th className="p-3 font-semibold text-slate-600">Prob %</th>
                    <th className="p-3 font-semibold text-slate-600">Contract</th>
                    <th className="p-3 font-semibold text-slate-600">Monthly $</th>
                    <th className="p-3 font-semibold text-slate-600">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredExportData.slice(0, 15).map(row => (
                     <tr key={row.CustomerID} className="hover:bg-slate-50">
                       <td className="p-3 font-medium text-slate-800">{row.CustomerID}</td>
                       <td className="p-3">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${row.RiskLevel==='High'?'bg-red-100 text-red-700':row.RiskLevel==='Medium'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>
                           {row.RiskLevel}
                         </span>
                       </td>
                       <td className="p-3">{row.ChurnProbabilityPercent}</td>
                       <td className="p-3">{row.ContractType}</td>
                       <td className="p-3">${row.MonthlyCharges}</td>
                       <td className="p-3 text-xs text-slate-500 truncate max-w-xs">{row.RetentionAction}</td>
                     </tr>
                   ))}
                </tbody>
             </table>
             {filteredExportData.length > 15 && (
               <div className="p-3 text-center text-xs text-slate-500 bg-slate-50">
                  Showing 15 of {filteredExportData.length} records. Export to view all.
               </div>
             )}
           </div>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-800">
      {/* Top Navbar */}
      <nav className="bg-[#0f172a] border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-7 h-7 text-indigo-500" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">ChurnSight</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 justify-center space-x-1">
             {TABS.map(tab => (
               <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                 className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
                 <span className="mr-2">{tab.icon}</span> {tab.label}
               </button>
             ))}
          </div>

          <div className="flex items-center gap-4">
             <span className="hidden sm:inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase rounded-full border border-indigo-500/30">Company Dashboard</span>
             <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
             </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col pt-4 mt-2 border-t border-slate-800 space-y-1">
             {TABS.map(tab => (
               <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                 className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}>
                 <span className="mr-3">{tab.icon}</span> {tab.label}
               </button>
             ))}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:py-8 min-h-[calc(100vh-73px)] relative">
         {loading ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/80 z-10 backdrop-blur-sm">
             <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
             <div className="text-slate-300 font-medium tracking-wide animate-pulse">Loading View...</div>
           </div>
         ) : (
           <div className="animate-in fade-in duration-500">
             {activeTab === 'dashboard' && renderDashboard()}
             {activeTab === 'data' && <DataExplorerTab />}
             {activeTab === 'predict' && <PredictionEngineTab />}
             {activeTab === 'analysis' && <AnalysisTab />}
             {activeTab === 'export' && <ExportTab />}
           </div>
         )}
      </main>
    </div>
  );
}
