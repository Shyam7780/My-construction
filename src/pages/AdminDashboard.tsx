import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Building2, DollarSign, Layers, ShieldAlert, Users, RefreshCw, 
  CheckCircle, PlusCircle, AlertCircle, Calendar, Phone, Settings, 
  Edit, Trash2, Megaphone, Eye, FileText, Image as ImageIcon, FolderArchive, Download
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

  // UI States
  const [loading, setLoading] = useState(true);
  
  // Rates Updater States
  const [updatingRates, setUpdatingRates] = useState(false);
  const [ratesSuccess, setRatesSuccess] = useState(false);
  const [ratesError, setRatesError] = useState('');
  const [laborOnlyInput, setLaborOnlyInput] = useState('250');
  const [basicInput, setBasicInput] = useState('1200');
  const [standardInput, setStandardInput] = useState('1500');
  const [premiumInput, setPremiumInput] = useState('1800');
  const [renovationInput, setRenovationInput] = useState('500');

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

  // Fetch all data safely (without kicking user out if API fails)
  const fetchData = async (authToken: string) => {
    setLoading(true);
    try {
      // 1. Fetch Inquiries
      try {
        const inquiriesRes = await fetch('/api/inquiries', {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        
        // 🚨 YAHAN SE 401 WALA LOGOUT CHECK HATA DIYA GAYA HAI 🚨
        if (inquiriesRes.ok) {
          const inquiriesData = await inquiriesRes.json();
          setInquiries(inquiriesData);
        }
      } catch (err) { console.log('Inquiries fetch skipped.'); }

      // 2. Fetch Rates
      try {
        const ratesRes = await fetch('/api/rates');
        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          setRates(ratesData);
          setLaborOnlyInput(ratesData.labor_only.toString());
          setBasicInput(ratesData.basic.toString());
          setStandardInput(ratesData.standard.toString());
          setPremiumInput(ratesData.premium.toString());
          setRenovationInput(ratesData.renovation.toString());
        }
      } catch (err) { console.log('Rates fetch skipped.'); }

      // 3. Fetch Packages
      try {
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
        } else {
          // Fallback demo package data if API fails
          setPkgNameInput("Standard Package");
          setPkgDescriptionInput("Best for most homes.");
          setPkgFacilitiesInput("Branded Cement\\nPremium Bricks\\nStandard Wiring");
        }
      } catch (err) { console.log('Packages fetch skipped.'); }

      // 4. Fetch Ads
      try {
        const adsRes = await fetch('/api/ads', {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          setAds(adsData);
        }
      } catch (err) { console.log('Ads fetch skipped.'); }

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

  // Simulated Update Rates (UI only)
  const handleUpdateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingRates(true);
    setRatesSuccess(false);
    setRatesError('');

    setTimeout(() => {
      setRates({
        labor_only: parseFloat(laborOnlyInput) || 0,
        basic: parseFloat(basicInput) || 0,
        standard: parseFloat(standardInput) || 0,
        premium: parseFloat(premiumInput) || 0,
        renovation: parseFloat(renovationInput) || 0,
      });
      setUpdatingRates(false);
      setRatesSuccess(true);
    }, 800);
  };

  // Simulated Update Package (UI only)
  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPkg(true);
    setPkgSuccess(false);
    setPkgError('');

    setTimeout(() => {
      setUpdatingPkg(false);
      setPkgSuccess(true);
    }, 800);
  };

  // Simulated Ads Submit (UI only)
  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingAds(true);
    setAdsSuccess(false);

    setTimeout(() => {
      const newAd = {
        id: editingAdId || Date.now(),
        title: adTitle,
        description: adDescription,
        badge: adBadge,
        is_active: adIsActive
      };

      if (editingAdId) {
        setAds((prev) => prev.map((ad) => (ad.id === editingAdId ? newAd : ad)));
        setEditingAdId(null);
      } else {
        setAds((prev) => [newAd, ...prev]);
      }
      
      setAdTitle('');
      setAdDescription('');
      setAdBadge('SPECIAL OFFER');
      setAdIsActive(true);
      setUpdatingAds(false);
      setAdsSuccess(true);
    }, 800);
  };

  const handleToggleAdStatus = (ad: Ad) => {
    setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, is_active: !a.is_active } : a)));
  };

  const handleEditAdClick = (ad: Ad) => {
    setEditingAdId(ad.id);
    setAdTitle(ad.title);
    setAdDescription(ad.description);
    setAdBadge(ad.badge);
    setAdIsActive(ad.is_active);
    document.getElementById('ads-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteAd = (id: number) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      setAds((prev) => prev.filter((ad) => ad.id !== id));
    }
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
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              <div className="lg:col-span-4 bg-zinc-950 border border-yellow-500/20 p-8 rounded-3xl shadow-2xl space-y-6">
                <div className="border-b border-zinc-900 pb-4">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                    <span>Rate Configuration</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Update price-per-square-foot metrics live.</p>
                </div>

                <form onSubmit={handleUpdateRates} className="space-y-4">
                  {ratesSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Rates updated successfully!</span>
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
                    {updatingRates ? 'Updating...' : 'Apply Live Rates'}
                  </button>
                </form>
              </div>

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
                      <span>Package details updated!</span>
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
                  <p className="text-sm text-zinc-500 max-w-sm mx-auto">When prospective clients calculate and submit their project details, they will appear securely here.</p>
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
                                {item.service_type === 'Project with Material' ? `${item.package_tier} Package` : 'Labor Only'}
                              </span>
                              <span className="block text-xs text-zinc-400 mt-1.5">
                                Area: <strong className="text-white">{item.area.toLocaleString()} sq. ft.</strong>
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="block font-black text-yellow-400 text-base">
                                ₹{item.estimated_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

            <div id="ads-form" className="space-y-6">
              <div className="border-b border-zinc-900 pb-4">
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <Megaphone className="h-5 w-5 text-yellow-400" />
                  <span>Promotional Campaigns & Live Ads</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-4 bg-zinc-950 border border-yellow-500/20 p-8 rounded-3xl shadow-2xl space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-wider text-yellow-400">
                    {editingAdId ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
                  </h4>

                  <form onSubmit={handleAdSubmit} className="space-y-4">
                    {adsSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Ad saved!</span>
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

            <div className="bg-zinc-950/80 border border-yellow-500/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden group mt-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-yellow-400/10 duration-500"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-left max-w-3xl">
                  <div className="inline-flex items-center space-x-2 bg-yellow-400/10 border border-yellow-400/30 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest text-yellow-400 uppercase">
                    <FolderArchive className="h-4 w-4" />
                    <span>Clean Full-Stack Architecture ZIP</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Download Complete Source Code Package</h3>
                </div>
                <a href="/chhotan-ram-construction-source.zip" download="chhotan-ram-construction-source.zip" className="flex-shrink-0 inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-base font-black bg-yellow-400 hover:bg-yellow-500 text-black shadow-xl cursor-pointer">
                  <Download className="h-5 w-5" />
                  <span>Download Project Source (.ZIP)</span>
                </a>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}