import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Building2, DollarSign, Layers, ShieldAlert, Users, RefreshCw, 
  CheckCircle, PlusCircle, AlertCircle, Calendar, Phone, Settings, 
  Edit, Trash2, Megaphone, Eye, FileText, Image as ImageIcon, FolderArchive, Download,
  BellRing
} from 'lucide-react';

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  area: number;
  service_type: string;
  package_tier: string | null;
  estimated_cost: number;
  created_at: string;
}

interface Rates {
  labor_only: number;
  basic: number;
  standard: number;
  premium: number;
  renovation: number;
}

interface Package {
  id: string;
  name: string;
  description: string;
  badge: string;
  features: {
    list: string[];
    image_url: string;
  };
}

interface Ad {
  id: number;
  title: string;
  description: string;
  badge: string;
  is_active: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  // Data States
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [rates, setRates] = useState<Rates>({
    labor_only: 0,
    basic: 0,
    standard: 0,
    premium: 0,
    renovation: 0,
  });
  const [packages, setPackages] = useState<Package[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);

  // Notifications State (Dummy data for UI)
  const [notifications, setNotifications] = useState([
    { id: 1, message: "एक नई इंक्वायरी आई है - Area: 1200 sq.ft.", time: "अभी-अभी" },
    { id: 2, message: "Standard Package के रेट अपडेट हो गए हैं।", time: "2 घंटे पहले" },
    { id: 3, message: "दिवाली का नया 'FESTIVE OFFER' ऐड पब्लिश हो गया है।", time: "1 दिन पहले" }
  ]);

  // UI States
  const [loading, setLoading] = useState(true);
  
  // Rates Updater States
  const [updatingRates, setUpdatingRates] = useState(false);
  const [ratesSuccess, setRatesSuccess] = useState(false);
  const [ratesError, setRatesError] = useState('');
  const [laborOnlyInput, setLaborOnlyInput] = useState('');
  const [basicInput, setBasicInput] = useState('');
  const [standardInput, setStandardInput] = useState('');
  const [premiumInput, setPremiumInput] = useState('');
  const [renovationInput, setRenovationInput] = useState('');

  // Packages Editor States
  const [selectedPkgId, setSelectedPkgId] = useState<string>('standard');
  const [updatingPkg, setUpdatingPkg] = useState(false);
  const [pkgSuccess, setPkgSuccess] = useState(false);
  const [pkgError, setPkgError] = useState('');
  const [pkgNameInput, setPkgNameInput] = useState('');
  const [pkgDescriptionInput, setPkgDescriptionInput] = useState('');
  const [pkgBadgeInput, setPkgBadgeInput] = useState('');
  const [pkgImageUrlInput, setPkgImageUrlInput] = useState('');
  const [pkgFacilitiesInput, setPkgFacilitiesInput] = useState('');

  // Ads Creator/Editor States
  const [updatingAds, setUpdatingAds] = useState(false);
  const [adsSuccess, setAdsSuccess] = useState(false);
  const [adsError, setAdsError] = useState('');
  const [editingAdId, setEditingAdId] = useState<number | null>(null);
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adBadge, setAdBadge] = useState('SPECIAL OFFER');
  const [adIsActive, setAdIsActive] = useState(true);

  // Verify auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (!savedToken) {
      navigate('/admin/login');
    } else {
      setToken(savedToken);
    }
  }, [navigate]);

  // ASLI API CALLS: Fetch all data from Backend
  const fetchData = async (authToken: string) => {
    setLoading(true);
    try {
      // 1. Fetch Inquiries
      const inquiriesRes = await fetch('/api/inquiries', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (inquiriesRes.status === 401) {
        console.error("Backend ne fake token reject kar diya (401). Real Login zaroori hai.");
        // Hum yahan handleLogout() call nahi kar rahe, taaki aap dashboard dekh sakein
      } else {
        const inquiriesData = await inquiriesRes.json();
        setInquiries(inquiriesData);
      }

      // 2. Fetch Rates
      const ratesRes = await fetch('/api/rates');
      if (ratesRes.ok) {
        const ratesData = await ratesRes.json();
        setRates(ratesData);
        setLaborOnlyInput(ratesData.labor_only?.toString() || '');
        setBasicInput(ratesData.basic?.toString() || '');
        setStandardInput(ratesData.standard?.toString() || '');
        setPremiumInput(ratesData.premium?.toString() || '');
        setRenovationInput(ratesData.renovation?.toString() || '');
      }

      // 3. Fetch Packages
      const packagesRes = await fetch('/api/packages');
      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        setPackages(packagesData);
        const defaultPkg = packagesData.find((p: Package) => p.id === selectedPkgId) || packagesData[0];
        if (defaultPkg) {
          setPkgNameInput(defaultPkg.name);
          setPkgDescriptionInput(defaultPkg.description);
          setPkgBadgeInput(defaultPkg.badge || '');
          setPkgImageUrlInput(defaultPkg.features.image_url || '');
          setPkgFacilitiesInput(defaultPkg.features.list.join('\n'));
        }
      }

      // 4. Fetch Ads
      const adsRes = await fetch('/api/ads', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(adsData);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token]);

  // Update form values when selected package changes
  useEffect(() => {
    const pkg = packages.find((p) => p.id === selectedPkgId);
    if (pkg) {
      setPkgNameInput(pkg.name);
      setPkgDescriptionInput(pkg.description);
      setPkgBadgeInput(pkg.badge || '');
      setPkgImageUrlInput(pkg.features.image_url || '');
      setPkgFacilitiesInput(pkg.features.list.join('\n'));
      setPkgSuccess(false);
      setPkgError('');
    }
  }, [selectedPkgId, packages]);

  // ASLI API CALL: Handle Rate Update
  const handleUpdateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setUpdatingRates(true);
    setRatesSuccess(false);
    setRatesError('');

    const labor = parseFloat(laborOnlyInput);
    const basicVal = parseFloat(basicInput);
    const standardVal = parseFloat(standardInput);
    const premiumVal = parseFloat(premiumInput);
    const renovationVal = parseFloat(renovationInput);

    if (isNaN(labor) || isNaN(basicVal) || isNaN(standardVal) || isNaN(premiumVal) || isNaN(renovationVal)) {
      setRatesError('All rate inputs must be valid positive numbers.');
      setUpdatingRates(false);
      return;
    }

    try {
      const res = await fetch('/api/rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          labor_only: labor,
          basic: basicVal,
          standard: standardVal,
          premium: premiumVal,
          renovation: renovationVal,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setRates(updated);
        setRatesSuccess(true);
      } else {
        const errData = await res.json();
        setRatesError(errData.error || 'Fake Token ki wajah se database me save nahi hua. Asli login zaruri hai.');
      }
    } catch (err) {
      setRatesError('Network error occurred.');
    } finally {
      setUpdatingRates(false);
    }
  };

  // ASLI API CALL: Handle Package Update
  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setUpdatingPkg(true);
    setPkgSuccess(false);
    setPkgError('');

    const facilitiesList = pkgFacilitiesInput.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

    try {
      const res = await fetch('/api/packages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedPkgId,
          name: pkgNameInput,
          description: pkgDescriptionInput,
          badge: pkgBadgeInput,
          features: { list: facilitiesList, image_url: pkgImageUrlInput }
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setPackages((prev) => prev.map((p) => (p.id === selectedPkgId ? updated : p)));
        setPkgSuccess(true);
      } else {
        const errData = await res.json();
        setPkgError(errData.error || 'Fake Token ki wajah se update fail ho gaya.');
      }
    } catch (err) {
      setPkgError('Network error occurred.');
    } finally {
      setUpdatingPkg(false);
    }
  };

  // ASLI API CALL: Handle Ads Submission
  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setUpdatingAds(true);
    setAdsSuccess(false);
    setAdsError('');

    const adData = { title: adTitle, description: adDescription, badge: adBadge, is_active: adIsActive };

    try {
      let res;
      if (editingAdId) {
        res = await fetch('/api/ads', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id: editingAdId, ...adData }),
        });
      } else {
        res = await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(adData),
        });
      }

      if (res.ok) {
        const result = await res.json();
        if (editingAdId) {
          setAds((prev) => prev.map((ad) => (ad.id === editingAdId ? result : ad)));
          setEditingAdId(null);
        } else {
          setAds((prev) => [result, ...prev]);
        }
        setAdsSuccess(true);
        setAdTitle(''); setAdDescription(''); setAdBadge('SPECIAL OFFER'); setAdIsActive(true);
      } else {
        setAdsError('Fake Token ki wajah se Ads save nahi ho rahe.');
      }
    } catch (err) {
      setAdsError('Network error occurred.');
    } finally {
      setUpdatingAds(false);
    }
  };

  const handleToggleAdStatus = async (ad: Ad) => {
    if (!token) return;
    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...ad, is_active: !ad.is_active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAds((prev) => prev.map((a) => (a.id === ad.id ? updated : a)));
      }
    } catch (err) { console.error(err); }
  };

  const handleEditAdClick = (ad: Ad) => {
    setEditingAdId(ad.id);
    setAdTitle(ad.title);
    setAdDescription(ad.description);
    setAdBadge(ad.badge);
    setAdIsActive(ad.is_active);
    document.getElementById('ads-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteAd = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Are you absolutely sure you want to delete this promotional ad?')) return;
    try {
      const res = await fetch('/api/ads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setAds((prev) => prev.filter((ad) => ad.id !== id));
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/admin/login');
  };

  return (
    <div 
      className="min-h-screen bg-black text-white flex flex-col font-sans bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.92), rgba(0,0,0,0.95)), url('/images/hero-bg.jpg')` }}
    >
      <Navbar isAdmin={true} onLogout={handleLogout} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-zinc-900 pb-8">
          <div>
            <span className="text-xs font-black tracking-widest text-yellow-400 uppercase">Secure Command Center</span>
            <h1 className="text-3xl sm:text-5xl font-black mt-1">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-2">Manage live cost-per-square-foot rates, configure package facilities, publish ads, and review customer submissions.</p>
          </div>
          <button 
            onClick={() => token && fetchData(token)}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="h-10 w-10 text-yellow-400 animate-spin" />
            <p className="text-zinc-400 font-bold tracking-wider text-sm uppercase">Loading Secure Records...</p>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* NOTIFICATIONS PANEL */}
            <div className="bg-zinc-950 border border-yellow-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <BellRing className="h-5 w-5 text-yellow-400 animate-pulse" />
                  <span>Recent Notifications</span>
                </h3>
                <span className="bg-yellow-400 text-black text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {notifications.length} New
                </span>
              </div>
              <div className="space-y-3">
                {notifications.map((note) => (
                  <div key={note.id} className="flex items-start p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                    <div className="h-2 w-2 mt-2 rounded-full bg-yellow-400 mr-4 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                    <div>
                      <p className="text-sm font-bold text-white">{note.message}</p>
                      <p className="text-xs text-zinc-500 mt-1">{note.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rates & Packages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Rates Updater Panel */}
              <div className="lg:col-span-4 bg-zinc-950 border border-yellow-500/20 p-8 rounded-3xl shadow-2xl space-y-6">
                <div className="border-b border-zinc-900 pb-4">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                    <span>Rate Configuration</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Update price-per-square-foot metrics live on the calculator.</p>
                </div>

                <form onSubmit={handleUpdateRates} className="space-y-4">
                  {ratesSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Rates updated successfully!</span>
                    </div>
                  )}

                  {ratesError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{ratesError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Labor Only Rate (₹/sqft)</label>
                    <input type="number" step="0.01" required value={laborOnlyInput} onChange={(e) => setLaborOnlyInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white transition text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Basic Package Rate (₹/sqft)</label>
                    <input type="number" step="0.01" required value={basicInput} onChange={(e) => setBasicInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white transition text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Standard Package Rate (₹/sqft)</label>
                    <input type="number" step="0.01" required value={standardInput} onChange={(e) => setStandardInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white transition text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Premium Package Rate (₹/sqft)</label>
                    <input type="number" step="0.01" required value={premiumInput} onChange={(e) => setPremiumInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white transition text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Renovation & Repair Rate (₹/sqft)</label>
                    <input type="number" step="0.01" required value={renovationInput} onChange={(e) => setRenovationInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white transition text-sm font-bold" />
                  </div>

                  <button type="submit" disabled={updatingRates} className="w-full px-6 py-3.5 rounded-xl text-sm font-black bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg cursor-pointer">
                    {updatingRates ? 'Updating Rates...' : 'Apply Live Rates'}
                  </button>
                </form>
              </div>

              {/* Package Facilities Manager */}
              <div className="lg:col-span-8 bg-zinc-950 border border-yellow-500/20 p-8 rounded-3xl shadow-2xl space-y-6">
                <div className="border-b border-zinc-900 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-yellow-400" />
                      <span>Package Facilities Manager</span>
                    </h3>
                  </div>
                  <select value={selectedPkgId} onChange={(e) => setSelectedPkgId(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-black text-yellow-400 uppercase tracking-wider">
                    <option value="labor_only">Labor Only</option>
                    <option value="basic">Basic Package</option>
                    <option value="standard">Standard Package</option>
                    <option value="premium">Premium Package</option>
                  </select>
                </div>

                <form onSubmit={handleUpdatePackage} className="space-y-6">
                  {pkgSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Package details updated and synced live!</span>
                    </div>
                  )}

                  {pkgError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{pkgError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Package Display Name</label>
                      <input type="text" required value={pkgNameInput} onChange={(e) => setPkgNameInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Package Badge</label>
                      <input type="text" value={pkgBadgeInput} onChange={(e) => setPkgBadgeInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-bold" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center">
                      <ImageIcon className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                      <span>Package Image Location / URL</span>
                    </label>
                    <input type="text" required value={pkgImageUrlInput} onChange={(e) => setPkgImageUrlInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-mono" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Package Description</label>
                    <textarea required rows={2} value={pkgDescriptionInput} onChange={(e) => setPkgDescriptionInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-bold" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center">
                      <FileText className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                      <span>Facilities Checklist Script (One per line)</span>
                    </label>
                    <textarea required rows={6} value={pkgFacilitiesInput} onChange={(e) => setPkgFacilitiesInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-mono" />
                  </div>

                  <button type="submit" disabled={updatingPkg} className="w-full px-6 py-3.5 rounded-xl text-sm font-black bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg cursor-pointer">
                    {updatingPkg ? 'Saving...' : 'Save & Sync Package Changes'}
                  </button>
                </form>
              </div>

            </div>

            {/* Inquiries Vault section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <Users className="h-5 w-5 text-yellow-400" />
                  <span>Inquiry Vault ({inquiries.length})</span>
                </h3>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-zinc-950 border border-zinc-900 p-12 rounded-3xl text-center space-y-4">
                  <Users className="h-12 w-12 text-zinc-600 mx-auto" />
                  <h4 className="text-lg font-bold text-white">No Inquiries Found</h4>
                  <p className="text-sm text-zinc-500 max-w-sm mx-auto">Either no inquiries exist, or the fake login token is preventing them from loading. Please fix the real login to see them.</p>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 bg-zinc-900/30 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          <th className="px-6 py-4">Client Details</th>
                          <th className="px-6 py-4">Project Parameters</th>
                          <th className="px-6 py-4 text-right">Estimated Cost</th>
                          <th className="px-6 py-4 text-right">Submission Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {inquiries.map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-900/20 transition">
                            <td className="px-6 py-5">
                              <span className="block font-bold text-white text-sm">{item.name}</span>
                              <span className="flex items-center text-xs text-zinc-400 mt-1">
                                <Phone className="h-3 w-3 text-yellow-400 mr-1.5 flex-shrink-0" />
                                {item.phone}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                                {item.service_type === 'Project with Material' 
                                  ? `${item.package_tier} Package` 
                                  : 'Labor Only'}
                              </span>
                              <span className="block text-xs text-zinc-400 mt-1.5">
                                Area: <strong className="text-white">{item.area.toLocaleString()} sq. ft.</strong>
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="block font-black text-yellow-400 text-base">
                                ₹{item.estimated_cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="flex items-center justify-end text-xs text-zinc-400">
                                <Calendar className="h-3 w-3 text-zinc-500 mr-1.5" />
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Ads Management Panel */}
            <div id="ads-form" className="space-y-6">
              <div className="border-b border-zinc-900 pb-4">
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <Megaphone className="h-5 w-5 text-yellow-400" />
                  <span>Promotional Campaigns & Live Ads</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Ads Creator Form */}
                <div className="lg:col-span-4 bg-zinc-950 border border-yellow-500/20 p-8 rounded-3xl shadow-2xl space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-wider text-yellow-400">
                    {editingAdId ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
                  </h4>

                  <form onSubmit={handleAdSubmit} className="space-y-4">
                    {adsSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Ad campaign saved successfully!</span>
                      </div>
                    )}

                    {adsError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{adsError}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Ad Badge</label>
                      <input type="text" required value={adBadge} onChange={(e) => setAdBadge(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Ad Title</label>
                      <input type="text" required value={adTitle} onChange={(e) => setAdTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Description</label>
                      <textarea required rows={3} value={adDescription} onChange={(e) => setAdDescription(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-bold" />
                    </div>
                    
                    <div className="flex items-center space-x-3 pt-2">
                      <input type="checkbox" id="adIsActive" checked={adIsActive} onChange={(e) => setAdIsActive(e.target.checked)} className="h-4 w-4 rounded border-zinc-800 text-yellow-400 focus:ring-yellow-400 accent-yellow-400" />
                      <label htmlFor="adIsActive" className="text-xs font-black uppercase tracking-wider text-zinc-300 cursor-pointer">Active & Visible</label>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button type="submit" disabled={updatingAds} className="flex-grow px-6 py-3 rounded-xl text-xs font-black bg-yellow-400 hover:bg-yellow-500 text-black cursor-pointer">
                        {updatingAds ? 'Saving...' : editingAdId ? 'Update Ad' : 'Publish Ad'}
                      </button>
                      {editingAdId && (
                        <button type="button" onClick={() => { setEditingAdId(null); setAdTitle(''); setAdDescription(''); setAdBadge('SPECIAL OFFER'); setAdIsActive(true); }} className="px-4 py-3 rounded-xl text-xs font-bold bg-zinc-900 text-white cursor-pointer">Cancel</button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  {ads.length === 0 ? (
                    <div className="bg-zinc-950 border border-zinc-900 p-12 rounded-3xl text-center">
                      <p className="text-sm text-zinc-500">No promotional campaigns created yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {ads.map((ad) => (
                        <div key={ad.id} className={`p-6 rounded-3xl border transition relative flex flex-col justify-between ${ad.is_active ? 'bg-zinc-900/60 border-yellow-500/20' : 'bg-zinc-950/40 border-zinc-900 opacity-60'}`}>
                          <div className="absolute top-4 right-4"><span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${ad.is_active ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{ad.badge}</span></div>
                          <div className="space-y-2 pr-16"><h4 className="text-base font-black text-white">{ad.title}</h4><p className="text-xs text-zinc-400 leading-relaxed">{ad.description}</p></div>
                          <div className="border-t border-zinc-900/80 pt-4 mt-6 flex items-center justify-between">
                            <button onClick={() => handleToggleAdStatus(ad)} className={`text-[10px] font-black uppercase tracking-wider ${ad.is_active ? 'text-zinc-400' : 'text-yellow-400'}`}>{ad.is_active ? 'Deactivate' : 'Activate'}</button>
                            <div className="flex items-center space-x-3">
                              <button onClick={() => handleEditAdClick(ad)} className="text-[10px] font-bold text-white uppercase tracking-wider">Edit</button>
                              <button onClick={() => handleDeleteAd(ad.id)} className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}