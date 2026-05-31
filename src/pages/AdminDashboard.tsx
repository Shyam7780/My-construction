import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Building2, 
  DollarSign, 
  Layers, 
  ShieldAlert, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  PlusCircle, 
  AlertCircle, 
  Calendar,
  Phone,
  Settings,
  Edit,
  Trash2,
  Megaphone,
  Eye,
  FileText,
  Image as ImageIcon,
  FolderArchive,
  Download
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
  const [pkgFacilitiesInput, setPkgFacilitiesInput] = useState(''); // Textarea line-by-line

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

  // Fetch all data
  const fetchData = async (authToken: string) => {
    setLoading(true);
    try {
      // 1. Fetch Inquiries
      const inquiriesRes = await fetch('/api/inquiries', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (inquiriesRes.status === 401) {
        handleLogout();
        return;
      }
      const inquiriesData = await inquiriesRes.json();
      setInquiries(inquiriesData);

      // 2. Fetch Rates
      const ratesRes = await fetch('/api/rates');
      const ratesData = await ratesRes.json();
      setRates({
        labor_only: ratesData.labor_only,
        basic: ratesData.basic,
        standard: ratesData.standard,
        premium: ratesData.premium,
        renovation: ratesData.renovation,
      });

      setLaborOnlyInput(ratesData.labor_only.toString());
      setBasicInput(ratesData.basic.toString());
      setStandardInput(ratesData.standard.toString());
      setPremiumInput(ratesData.premium.toString());
      setRenovationInput(ratesData.renovation.toString());

      // 3. Fetch Packages
      const packagesRes = await fetch('/api/packages');
      const packagesData = await packagesRes.json();
      setPackages(packagesData);

      // Populate package form with the default selected package ('standard')
      const defaultPkg = packagesData.find((p: Package) => p.id === selectedPkgId) || packagesData[0];
      if (defaultPkg) {
        setPkgNameInput(defaultPkg.name);
        setPkgDescriptionInput(defaultPkg.description);
        setPkgBadgeInput(defaultPkg.badge || '');
        setPkgImageUrlInput(defaultPkg.features.image_url || '');
        setPkgFacilitiesInput(defaultPkg.features.list.join('\n'));
      }

      // 4. Fetch Ads
      const adsRes = await fetch('/api/ads', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      const adsData = await adsRes.json();
      setAds(adsData);

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

  // Handle Rate Update
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
        setRates({
          labor_only: updated.labor_only,
          basic: updated.basic,
          standard: updated.standard,
          premium: updated.premium,
          renovation: updated.renovation,
        });
        setRatesSuccess(true);
      } else {
        const errData = await res.json();
        setRatesError(errData.error || 'Failed to update rates.');
      }
    } catch (err) {
      setRatesError('A network error occurred. Please try again.');
    } finally {
      setUpdatingRates(false);
    }
  };

  // Handle Package Update
  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setUpdatingPkg(true);
    setPkgSuccess(false);
    setPkgError('');

    // Parse facilities line-by-line
    const facilitiesList = pkgFacilitiesInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (facilitiesList.length === 0) {
      setPkgError('Please enter at least one facility/specification.');
      setUpdatingPkg(false);
      return;
    }

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
          features: {
            list: facilitiesList,
            image_url: pkgImageUrlInput
          }
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        // Update packages state
        setPackages((prev) =>
          prev.map((p) => (p.id === selectedPkgId ? updated : p))
        );
        setPkgSuccess(true);
      } else {
        const errData = await res.json();
        setPkgError(errData.error || 'Failed to update package details.');
      }
    } catch (err) {
      setPkgError('A network error occurred. Please try again.');
    } finally {
      setUpdatingPkg(false);
    }
  };

  // Handle Ads Submission (Create or Update)
  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setUpdatingAds(true);
    setAdsSuccess(false);
    setAdsError('');

    const adData = {
      title: adTitle,
      description: adDescription,
      badge: adBadge,
      is_active: adIsActive
    };

    try {
      let res;
      if (editingAdId) {
        res = await fetch('/api/ads', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: editingAdId, ...adData }),
        });
      } else {
        res = await fetch('/api/ads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
        // Reset form
        setAdTitle('');
        setAdDescription('');
        setAdBadge('SPECIAL OFFER');
        setAdIsActive(true);
      } else {
        const errData = await res.json();
        setAdsError(errData.error || 'Failed to save ad campaign.');
      }
    } catch (err) {
      setAdsError('A network error occurred. Please try again.');
    } finally {
      setUpdatingAds(false);
    }
  };

  // Handle Toggle Ad Status
  const handleToggleAdStatus = async (ad: Ad) => {
    if (!token) return;
    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          badge: ad.badge,
          is_active: !ad.is_active
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAds((prev) => prev.map((a) => (a.id === ad.id ? updated : a)));
      }
    } catch (err) {
      console.error('Error toggling ad status:', err);
    }
  };

  // Handle Edit Ad Click
  const handleEditAdClick = (ad: Ad) => {
    setEditingAdId(ad.id);
    setAdTitle(ad.title);
    setAdDescription(ad.description);
    setAdBadge(ad.badge);
    setAdIsActive(ad.is_active);
    
    // Scroll to ads form
    const formSection = document.getElementById('ads-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Delete Ad
  const handleDeleteAd = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Are you absolutely sure you want to delete this promotional ad?')) return;

    try {
      const res = await fetch('/api/ads', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setAds((prev) => prev.filter((ad) => ad.id !== id));
      }
    } catch (err) {
      console.error('Error deleting ad:', err);
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

      {/* Main Dashboard Panel */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12 relative z-10">
        
        {/* Top Header */}
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
            
            {/* Rates & Packages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Rates Updater Panel (Left Column - 4 cols) */}
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

                  {/* Labor Only */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Labor Only Rate (₹/sqft)
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={laborOnlyInput}
                      onChange={(e) => setLaborOnlyInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                    />
                  </div>

                  {/* Basic Package */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Basic Package Rate (₹/sqft)
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={basicInput}
                      onChange={(e) => setBasicInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                    />
                  </div>

                  {/* Standard Package */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Standard Package Rate (₹/sqft)
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={standardInput}
                      onChange={(e) => setStandardInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                    />
                  </div>

                  {/* Premium Package */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Premium Package Rate (₹/sqft)
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={premiumInput}
                      onChange={(e) => setPremiumInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                    />
                  </div>

                  {/* Renovation & Repair */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Renovation & Repair Rate (₹/sqft)
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={renovationInput}
                      onChange={(e) => setRenovationInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingRates}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-black bg-yellow-400 hover:bg-yellow-500 text-black transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-yellow-400/10 cursor-pointer"
                  >
                    {updatingRates ? 'Updating Rates...' : 'Apply Live Rates'}
                  </button>
                </form>
              </div>

              {/* Package Facilities & Images Manager (Right Column - 8 cols) */}
              <div className="lg:col-span-8 bg-zinc-950 border border-yellow-500/20 p-8 rounded-3xl shadow-2xl space-y-6">
                <div className="border-b border-zinc-900 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-yellow-400" />
                      <span>Package Facilities & Images Manager</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">Configure facilities checklists, descriptions, badges, and images for each package.</p>
                  </div>

                  {/* Package Selector */}
                  <select
                    value={selectedPkgId}
                    onChange={(e) => setSelectedPkgId(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-xs font-black text-yellow-400 uppercase tracking-wider focus:outline-none"
                  >
                    <option value="labor_only">Labor Only Package</option>
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
                    {/* Package Name */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Package Display Name
                      </label>
                      <input 
                        type="text" 
                        required
                        value={pkgNameInput}
                        onChange={(e) => setPkgNameInput(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                      />
                    </div>

                    {/* Package Badge */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Package Badge (e.g. Most Popular)
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Luxury Choice, Budget Option"
                        value={pkgBadgeInput}
                        onChange={(e) => setPkgBadgeInput(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                      />
                    </div>
                  </div>

                  {/* Package Image URL */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center">
                      <ImageIcon className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                      <span>Package Image Location / URL</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. /images/standard.jpg or custom external URL"
                      value={pkgImageUrlInput}
                      onChange={(e) => setPkgImageUrlInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-mono"
                    />
                    <span className="text-[10px] text-zinc-500 block mt-1">
                      Local high-res options: <code className="text-yellow-400/80">/images/labor.jpg</code>, <code className="text-yellow-400/80">/images/basic.jpg</code>, <code className="text-yellow-400/80">/images/standard.jpg</code>, <code className="text-yellow-400/80">/images/premium.jpg</code>.
                    </span>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Package Description
                    </label>
                    <textarea 
                      required
                      rows={2}
                      value={pkgDescriptionInput}
                      onChange={(e) => setPkgDescriptionInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                    />
                  </div>

                  {/* Facilities Script (Line-by-line) */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center">
                      <FileText className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                      <span>Facilities Checklist Script (One facility per line)</span>
                    </label>
                    <textarea 
                      required
                      rows={6}
                      placeholder="Enter each facility/benefit on a new line..."
                      value={pkgFacilitiesInput}
                      onChange={(e) => setPkgFacilitiesInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-xs font-mono leading-relaxed"
                    />
                    <span className="text-[10px] text-zinc-500 block mt-1">
                      Each line entered here will automatically render as a bullet item with a checkmark on the user facilities panel.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingPkg}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-black bg-yellow-400 hover:bg-yellow-500 text-black transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-yellow-400/10 cursor-pointer"
                  >
                    {updatingPkg ? 'Saving Package Details...' : 'Save & Sync Package Changes'}
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
                  <p className="text-sm text-zinc-500 max-w-sm mx-auto">When prospective clients calculate and submit their project details, they will appear securely here.</p>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                  {/* Table for larger screens */}
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
                            {/* Client Info */}
                            <td className="px-6 py-5">
                              <span className="block font-bold text-white text-sm">{item.name}</span>
                              <span className="flex items-center text-xs text-zinc-400 mt-1">
                                <Phone className="h-3 w-3 text-yellow-400 mr-1.5 flex-shrink-0" />
                                {item.phone}
                              </span>
                            </td>
                            {/* Project Info */}
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
                            {/* Estimated Cost */}
                            <td className="px-6 py-5 text-right">
                              <span className="block font-black text-yellow-400 text-base">
                                ₹{item.estimated_cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </td>
                            {/* Date */}
                            <td className="px-6 py-5 text-right">
                              <span className="flex items-center justify-end text-xs text-zinc-400">
                                <Calendar className="h-3 w-3 text-zinc-500 mr-1.5" />
                                {new Date(item.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="md:hidden divide-y divide-zinc-900">
                    {inquiries.map((item) => (
                      <div key={item.id} className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="block font-bold text-white text-base">{item.name}</span>
                            <span className="flex items-center text-xs text-zinc-400 mt-1">
                              <Phone className="h-3 w-3 text-yellow-400 mr-1.5" />
                              {item.phone}
                            </span>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                            {item.service_type === 'Project with Material' 
                              ? `${item.package_tier} Package` 
                              : 'Labor Only'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-900 text-xs">
                          <div>
                            <span className="text-zinc-500 block uppercase font-bold tracking-wider">Area</span>
                            <span className="text-white font-bold mt-0.5 block">{item.area.toLocaleString()} sq. ft.</span>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-500 block uppercase font-bold tracking-wider">Estimated Cost</span>
                            <span className="text-yellow-400 font-black text-sm mt-0.5 block">
                              ₹{item.estimated_cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {new Date(item.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
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
                <p className="text-sm text-zinc-400 mt-1">Manage the top-scrolling banner and active promotional campaigns displayed on the user landing page.</p>
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

                    {/* Badge */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Ad Badge (e.g. FESTIVE OFFER)
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="LIMITED TIME, FESTIVE OFFER"
                        value={adBadge}
                        onChange={(e) => setAdBadge(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                      />
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Ad Title
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Free Structural Soil Testing"
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Description
                      </label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="e.g. Get a 100% free foundation-integrity check with any booking this month."
                        value={adDescription}
                        onChange={(e) => setAdDescription(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition text-sm font-bold"
                      />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center space-x-3 pt-2">
                      <input 
                        type="checkbox" 
                        id="adIsActive"
                        checked={adIsActive}
                        onChange={(e) => setAdIsActive(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-800 text-yellow-400 focus:ring-yellow-400 accent-yellow-400"
                      />
                      <label htmlFor="adIsActive" className="text-xs font-black uppercase tracking-wider text-zinc-300 cursor-pointer">
                        Active & Visible
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={updatingAds}
                        className="flex-grow inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-black bg-yellow-400 hover:bg-yellow-500 text-black transition-all transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        {updatingAds ? 'Saving...' : editingAdId ? 'Update Ad' : 'Publish Ad'}
                      </button>
                      {editingAdId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAdId(null);
                            setAdTitle('');
                            setAdDescription('');
                            setAdBadge('SPECIAL OFFER');
                            setAdIsActive(true);
                          }}
                          className="px-4 py-3 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Ads List */}
                <div className="lg:col-span-8 space-y-4">
                  {ads.length === 0 ? (
                    <div className="bg-zinc-950 border border-zinc-900 p-12 rounded-3xl text-center">
                      <p className="text-sm text-zinc-500">No promotional campaigns created yet. Create one on the left.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {ads.map((ad) => (
                        <div 
                          key={ad.id} 
                          className={`p-6 rounded-3xl border transition relative flex flex-col justify-between ${
                            ad.is_active 
                              ? 'bg-zinc-900/60 border-yellow-500/20' 
                              : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                          }`}
                        >
                          <div className="absolute top-4 right-4 flex items-center space-x-2">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              ad.is_active ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {ad.badge}
                            </span>
                          </div>

                          <div className="space-y-2 pr-16">
                            <h4 className="text-base font-black text-white">{ad.title}</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">{ad.description}</p>
                          </div>

                          <div className="border-t border-zinc-900/80 pt-4 mt-6 flex items-center justify-between">
                            <button
                              onClick={() => handleToggleAdStatus(ad)}
                              className={`text-[10px] font-black uppercase tracking-wider ${
                                ad.is_active ? 'text-zinc-400 hover:text-yellow-400' : 'text-yellow-400 hover:text-yellow-500'
                              }`}
                            >
                              {ad.is_active ? 'Deactivate' : 'Activate'}
                            </button>

                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleEditAdClick(ad)}
                                className="text-[10px] font-bold text-white hover:text-yellow-400 uppercase tracking-wider"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAd(ad.id)}
                                className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-wider"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download Full-Stack Source Code Section */}
            <div className="bg-zinc-950/80 border border-yellow-500/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden group mt-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-yellow-400/10 duration-500"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-left max-w-3xl">
                  <div className="inline-flex items-center space-x-2 bg-yellow-400/10 border border-yellow-400/30 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest text-yellow-400 uppercase">
                    <FolderArchive className="h-4 w-4" />
                    <span>Clean Full-Stack Architecture ZIP</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Download Complete Source Code Package</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Get the entire production-ready codebase packaged into a clean, modular structure. All frontend code (React, TypeScript, Tailwind CSS, Lucide icons) is organized cleanly under the <code className="text-yellow-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded font-bold">frontend/</code> directory, while all backend resources (Vercel serverless API routes connected to Supabase PostgreSQL database) are packaged cleanly under the <code className="text-yellow-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded font-bold">backend/</code> directory.
                  </p>
                </div>
                <a
                  href="/chhotan-ram-construction-source.zip"
                  download="chhotan-ram-construction-source.zip"
                  className="flex-shrink-0 inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-base font-black bg-yellow-400 hover:bg-yellow-500 text-black transition-all transform hover:-translate-y-0.5 shadow-xl shadow-yellow-400/20 cursor-pointer"
                >
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
