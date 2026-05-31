import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calculator, 
  DollarSign, 
  Layers, 
  CheckCircle, 
  HardHat, 
  Building2, 
  Users, 
  Award, 
  ChevronRight, 
  Loader2,
  X,
  Info,
  MapPin,
  Mail,
  Phone,
  Tag,
  Gift,
  Sparkles,
  Megaphone
} from 'lucide-react';

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
  created_at: string;
}

// Helper to dynamically classify ads into styled categories based on content/badge keywords
function getAdStyle(ad: Ad) {
  const text = `${ad.badge} ${ad.title} ${ad.description}`.toUpperCase();
  
  if (text.includes('FREE') || text.includes('COMPLIMENTARY') || text.includes('GIFT') || text.includes('TESTING') || text.includes('SOIL') || text.includes('WATERPROOF')) {
    return {
      typeName: 'Complimentary Upgrade',
      icon: 'Gift',
      cardClass: 'border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-950/10 shadow-emerald-950/20',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      glowClass: 'bg-emerald-500/5',
      textColor: 'text-emerald-400'
    };
  }
  
  if (text.includes('DISCOUNT') || text.includes('OFFER') || text.includes('₹') || text.includes('RS') || text.includes('PERCENT') || text.includes('%')) {
    return {
      typeName: 'Special Promotional Offer',
      icon: 'Tag',
      cardClass: 'border-yellow-500/20 hover:border-yellow-500/40 bg-yellow-950/10 shadow-yellow-950/20',
      badgeClass: 'bg-yellow-400 text-black font-black',
      glowClass: 'bg-yellow-400/5',
      textColor: 'text-yellow-400'
    };
  }
  
  if (text.includes('NEW') || text.includes('LAUNCH') || text.includes('EXPANSION') || text.includes('INTRODUCING')) {
    return {
      typeName: 'New Capability Launch',
      icon: 'Sparkles',
      cardClass: 'border-cyan-500/20 hover:border-cyan-500/40 bg-cyan-950/10 shadow-cyan-950/20',
      badgeClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      glowClass: 'bg-cyan-500/5',
      textColor: 'text-cyan-400'
    };
  }
  
  return {
    typeName: 'Featured Announcement',
    icon: 'Megaphone',
    cardClass: 'border-yellow-500/10 hover:border-yellow-500/30 bg-zinc-950/80',
    badgeClass: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    glowClass: 'bg-yellow-400/5',
    textColor: 'text-yellow-400/80'
  };
}

export default function Home() {
  // Rates state
  const [rates, setRates] = useState<Rates>({
    labor_only: 280,
    basic: 1400,
    standard: 1800,
    premium: 2400,
    renovation: 180,
  });
  const [loadingRates, setLoadingRates] = useState(true);

  // Packages state
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // Ads state
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Form Inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [serviceType, setServiceType] = useState('Project with Material');
  const [packageTier, setPackageTier] = useState('Standard');

  // Live evaluated cost
  const [liveCost, setLiveCost] = useState<number>(0);

  // Form Submission States
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch rates, packages, and active ads on mount
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('/api/rates');
        if (res.ok) {
          const data = await res.json();
          setRates({
            labor_only: data.labor_only,
            basic: data.basic,
            standard: data.standard,
            premium: data.premium,
            renovation: data.renovation || 180,
          });
        }
      } catch (err) {
        console.error('Error fetching rates:', err);
      } finally {
        setLoadingRates(false);
      }
    }

    async function fetchPackages() {
      try {
        const res = await fetch('/api/packages');
        if (res.ok) {
          const data = await res.json();
          setPackages(data);
        } else {
          // Fallback static packages if API not ready
          setPackages([
            {
              id: 'labor_only',
              name: 'Labor Only Pack',
              description: 'Skilled structural labor, masonry, and steel reinforcement placement without material procurement.',
              badge: 'Labor Only',
              features: {
                list: ['Elite structural masonry team', 'Accurate foundation alignment', 'High-speed column & beam casting', 'Strict construction tolerance control'],
                image_url: '/images/hero-bg.jpg'
              }
            },
            {
              id: 'basic',
              name: 'Basic Material Pack',
              description: 'Standard building materials including brand-name cement, local sand, structural bricks, and standard grade steel.',
              badge: 'Basic Material',
              features: {
                list: ['Standard grade concrete foundation', 'Local structural bricks (Class A)', 'Standard steel rebar reinforcement', 'Basic sanitary & plumbing piping'],
                image_url: '/images/calculator-bg.jpg'
              }
            },
            {
              id: 'standard',
              name: 'Standard Material Pack',
              description: 'Premium building materials with branded cement, premium structural steel, high-quality tiles, and robust wiring.',
              badge: 'Standard Material',
              features: {
                list: ['Ultra-dense concrete foundation', 'Branded premium cement (ACC/Ultratech)', 'High-tensile TMT steel rebar', 'Premium vitrified flooring tiles', 'Concealed copper wiring with modular switches'],
                image_url: '/images/hero-bg.jpg'
              }
            },
            {
              id: 'premium',
              name: 'Premium Luxury Pack',
              description: 'Ultra-luxurious grade specifications with Italian marble, smart home pre-wiring, high-end structural elements, and structural design.',
              badge: 'Luxury Material',
              features: {
                list: ['Seismic-resistant structural grade design', 'Premium Italian marble & granite flooring', 'Top-tier structural steel reinforcement', 'Smart home automated concealed piping', 'Architectural custom lighting planning'],
                image_url: '/images/admin-bg.jpg'
              }
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
      } finally {
        setLoadingPackages(false);
      }
    }

    async function fetchAds() {
      try {
        const res = await fetch('/api/ads');
        if (res.ok) {
          const data = await res.json();
          setAds(data);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
      }
    }

    fetchRates();
    fetchPackages();
    fetchAds();
  }, []);

  // Slide through ads if multiple exist
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [ads]);

  // Recalculate cost live as inputs change
  useEffect(() => {
    const parsedArea = parseFloat(area);
    if (isNaN(parsedArea) || parsedArea <= 0) {
      setLiveCost(0);
      return;
    }

    let rate = 0;
    if (serviceType === 'Project without Material (Labor Only)') {
      rate = rates.labor_only;
    } else if (serviceType === 'Renovation & Repair') {
      rate = rates.renovation || 180;
    } else {
      if (packageTier === 'Basic') rate = rates.basic;
      else if (packageTier === 'Standard') rate = rates.standard;
      else if (packageTier === 'Premium') rate = rates.premium;
    }

    setLiveCost(parsedArea * rate);
  }, [area, serviceType, packageTier, rates]);

  // Find a recommended ad based on current calculator selections
  const getRecommendedAd = () => {
    if (ads.length === 0) return null;
    
    // If Labor Only is selected, find ads containing "labor" or "discount"
    if (serviceType === 'Project without Material (Labor Only)') {
      const laborAd = ads.find(ad => {
        const text = `${ad.badge} ${ad.title} ${ad.description}`.toUpperCase();
        return text.includes('LABOR') || text.includes('DISCOUNT') || text.includes('OFFER');
      });
      if (laborAd) return laborAd;
    } else {
      // If Material is selected, find ads matching the specific package tier
      const tierAd = ads.find(ad => {
        const text = `${ad.badge} ${ad.title} ${ad.description}`.toUpperCase();
        return text.includes(packageTier.toUpperCase()) || text.includes('WATERPROOF') || text.includes('CONCRETE');
      });
      if (tierAd) return tierAd;
    }
    
    // Fallback to the first active ad
    return ads[0];
  };

  // Handle selecting a package from the modal
  const handleSelectPackageFromModal = (pkg: Package) => {
    if (pkg.id === 'labor_only') {
      setServiceType('Project without Material (Labor Only)');
    } else if (pkg.id === 'renovation') {
      setServiceType('Renovation & Repair');
    } else {
      setServiceType('Project with Material');
      if (pkg.id === 'basic') setPackageTier('Basic');
      else if (pkg.id === 'standard') setPackageTier('Standard');
      else if (pkg.id === 'premium') setPackageTier('Premium');
    }
    setSelectedPackage(null); // Close modal
    
    // Smooth scroll to calculator
    const calcSection = document.getElementById('calculator');
    if (calcSection) {
      calcSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle inquiry submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!name.trim()) {
      setSubmitError('Full Name is required.');
      return;
    }
    if (!phone.trim()) {
      setSubmitError('Phone Number is required.');
      return;
    }
    const parsedArea = parseFloat(area);
    if (isNaN(parsedArea) || parsedArea <= 0) {
      setSubmitError('Please enter a valid Total Area in square feet.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          area: parsedArea,
          service_type: serviceType,
          package_tier: serviceType === 'Project with Material' ? packageTier : null,
          estimated_cost: liveCost,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        // Reset form
        setName('');
        setPhone('');
        setArea('');
      } else {
        const errData = await res.json();
        setSubmitError(errData.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      setSubmitError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Dynamic Ad / Offers Announcement Bar */}
      {ads.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black py-2.5 px-4 text-center text-xs sm:text-sm font-black tracking-wide relative overflow-hidden transition-all duration-500 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <span className="bg-black text-yellow-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0 animate-pulse">
              {ads[currentAdIndex].badge}
            </span>
            <span className="font-extrabold truncate">
              {ads[currentAdIndex].title} — 
            </span>
            <span className="opacity-95 hidden sm:inline">
              {ads[currentAdIndex].description}
            </span>
            <span className="opacity-95 sm:hidden truncate text-xs">
              {ads[currentAdIndex].description}
            </span>
          </div>
        </div>
      )}

      <Navbar />

      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center py-20 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('/images/hero-bg.jpg')` }}
      >
        <div className="absolute inset-0 border-b border-yellow-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Text */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/30 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest text-yellow-400 uppercase">
              <HardHat className="h-4 w-4 animate-bounce" />
              <span>Premium Engineering & Construction</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
              We Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Masterpieces</span> That Stand The Test Of Time
            </h1>
            
            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed max-w-2xl">
              Chhotan Ram Construction provides supreme architectural integrity, flawless execution, and premium finishes. Calculate your project cost instantly and book a free structural site consultation today.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <a 
                href="#calculator"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-black bg-yellow-400 hover:bg-yellow-500 text-black transition-all transform hover:-translate-y-1 shadow-xl shadow-yellow-400/20 text-center cursor-pointer"
              >
                <span>Instant Cost Estimator</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
              <a 
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-zinc-700 transition-all text-center cursor-pointer"
              >
                Explore Services
              </a>
            </div>

            {/* Stats Badge */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-800 max-w-lg">
              <div>
                <span className="block text-3xl font-black text-yellow-400">25+</span>
                <span className="block text-xs text-zinc-400 uppercase font-bold tracking-wider mt-1">Years Experience</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-yellow-400">450+</span>
                <span className="block text-xs text-zinc-400 uppercase font-bold tracking-wider mt-1">Projects Completed</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-yellow-400">100%</span>
                <span className="block text-xs text-zinc-400 uppercase font-bold tracking-wider mt-1">Premium Quality</span>
              </div>
            </div>
          </div>

          {/* Quick Features Panel */}
          <div className="lg:col-span-5 bg-zinc-950/80 backdrop-blur-md p-8 rounded-3xl border border-yellow-500/20 shadow-2xl relative">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Guaranteed Rates
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-yellow-400" />
              <span>Why Choose Chhotan Ram?</span>
            </h3>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400/10 p-2.5 rounded-lg text-yellow-400 mt-1">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Transparent Pricing</h4>
                  <p className="text-sm text-zinc-400 mt-1">No hidden charges. Our live rates let you plan precisely.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400/10 p-2.5 rounded-lg text-yellow-400 mt-1">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Supreme Structural Grade</h4>
                  <p className="text-sm text-zinc-400 mt-1">We use premium grade concrete, top-tier steel, and highly skilled structural engineers.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400/10 p-2.5 rounded-lg text-yellow-400 mt-1">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">On-Time Completion</h4>
                  <p className="text-sm text-zinc-400 mt-1">Strict construction schedules with real-time project milestone tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-zinc-950 border-t border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black tracking-widest text-yellow-400 uppercase">Our Core Specializations</span>
            <h2 className="text-3xl sm:text-5xl font-black">Crafting Premium Structures</h2>
            <p className="text-zinc-400">We offer tailored pricing structures to match your unique financial and architectural requirements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-yellow-400/30 transition-all group">
              <div className="bg-yellow-400/10 text-yellow-400 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-200">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Labor Only Projects</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Perfect if you want to manage material procurement directly. Our elite team of masonry, electrical, and structural labor executes the build flawlessly.
              </p>
              <div className="text-yellow-400 font-bold text-sm">
                Live Rate: ₹{rates.labor_only}/sq. ft.
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-yellow-400/30 transition-all group">
              <div className="bg-yellow-400/10 text-yellow-400 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-200">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Standard Material Projects</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Premium-grade materials sourced from trusted manufacturers. Includes durable structural foundations, standard flooring, and premium electrical wiring.
              </p>
              <div className="text-yellow-400 font-bold text-sm">
                Live Rate: ₹{rates.standard}/sq. ft.
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-yellow-400/30 transition-all group">
              <div className="bg-yellow-400/10 text-yellow-400 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-200">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Premium Luxury Projects</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Top-of-the-line concrete, structural steel, luxury marble flooring, smart home automation pre-wiring, and ultra-high-end fixtures.
              </p>
              <div className="text-yellow-400 font-bold text-sm">
                Live Rate: ₹{rates.premium}/sq. ft.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Details Modal (if selected) */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-yellow-500/30 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 right-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2 rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-3">
                <span className="bg-yellow-400 text-black text-xs font-black px-2.5 py-1 rounded uppercase tracking-wider">
                  {selectedPackage.badge}
                </span>
                <h3 className="text-2xl font-black text-white">{selectedPackage.name}</h3>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed">{selectedPackage.description}</p>

              <div className="space-y-3">
                <h4 className="text-xs font-black tracking-widest text-yellow-400 uppercase">Key Specifications Included:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-400">
                  {selectedPackage.features.list.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-zinc-900 flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="px-5 py-3 rounded-xl text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition"
                >
                  Close Specs
                </button>
                <button
                  onClick={() => handleSelectPackageFromModal(selectedPackage)}
                  className="px-6 py-3 rounded-xl text-sm font-black bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-400/10 transition"
                >
                  Apply to Calculator & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Calculator & Inquiry Form Section (MOVED ABOVE ANNOUNCEMENTS) */}
      <section 
        id="calculator" 
        className="relative py-24 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.95)), url('/images/calculator-bg.jpg')` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black tracking-widest text-yellow-400 uppercase">Interactive Tool</span>
            <h2 className="text-3xl sm:text-5xl font-black">Live Project Cost Calculator</h2>
            <p className="text-zinc-400">
              Input your details, specify your built-up area in square feet, and get a highly precise cost assessment instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Form Inputs & Live Calculation Display */}
            <div className="lg:col-span-7 bg-zinc-950/90 border border-yellow-500/20 p-8 sm:p-10 rounded-3xl shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. +91 97981 33589"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Service Type Dropdown */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">Service Type</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                    >
                      <option value="Project with Material">Project with Material</option>
                      <option value="Project without Material (Labor Only)">Project without Material (Labor Only)</option>
                    </select>
                  </div>

                  {/* Total Area */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">Total Area (Square Feet)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      placeholder="e.g. 1500"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                    />
                  </div>
                </div>

                {/* Package Tier (Only show if Material is selected) */}
                {serviceType === 'Project with Material' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">Package Tier</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['Basic', 'Standard', 'Premium'].map((tier) => {
                        const tierRate = tier === 'Basic' ? rates.basic : tier === 'Standard' ? rates.standard : rates.premium;
                        return (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setPackageTier(tier)}
                            className={`p-4 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                              packageTier === tier 
                                ? 'bg-yellow-400 border-yellow-400 text-black font-bold' 
                                : 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700'
                            }`}
                          >
                            <span className="text-sm uppercase tracking-wider block font-black">{tier}</span>
                            <span className="text-[10px] opacity-80 mt-1 block">₹{tierRate}/sq. ft.</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dynamic Construction Ad Recommendation */}
                {(() => {
                  const recommendedAd = getRecommendedAd();
                  if (!recommendedAd) return null;
                  const adStyle = getAdStyle(recommendedAd);
                  return (
                    <div className={`p-4 rounded-xl border flex items-start space-x-3 transition-all duration-300 ${adStyle.cardClass}`}>
                      <div className="mt-1 flex-shrink-0">
                        {adStyle.icon === 'Gift' && <Gift className="h-4 w-4 text-emerald-400 animate-pulse" />}
                        {adStyle.icon === 'Tag' && <Tag className="h-4 w-4 text-yellow-400 animate-pulse" />}
                        {adStyle.icon === 'Sparkles' && <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />}
                        {adStyle.icon === 'Megaphone' && <Megaphone className="h-4 w-4 text-yellow-400/80 animate-pulse" />}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${adStyle.badgeClass}`}>
                            {recommendedAd.badge}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">
                            Recommended {adStyle.typeName}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">
                          {recommendedAd.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                          {recommendedAd.description}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Live Cost Display Box */}
                <div className="bg-yellow-400/5 border-2 border-dashed border-yellow-400/30 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-400 p-2.5 rounded-lg text-black">
                      <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">Live Estimated Evaluation</span>
                      <span className="text-white text-xs mt-0.5 block">
                        {serviceType === 'Project with Material' ? `${packageTier} Package` : 'Labor Only'} @ ₹{
                          serviceType === 'Project with Material' 
                            ? (packageTier === 'Basic' ? rates.basic : packageTier === 'Standard' ? rates.standard : rates.premium)
                            : rates.labor_only
                        }/sqft
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-yellow-400/80 font-bold block uppercase tracking-widest">Estimated Cost</span>
                    <span className="text-3xl sm:text-4xl font-black text-yellow-400">
                      ₹{liveCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Actions and Status */}
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={submitting || liveCost <= 0}
                    className="w-full inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-black bg-yellow-400 hover:bg-yellow-500 text-black transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl shadow-yellow-400/10 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        <span>Submitting Inquiry...</span>
                      </>
                    ) : (
                      <span>Submit Inquiry & Estimated Cost</span>
                    )}
                  </button>

                  {submitSuccess && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold text-center">
                      ✓ Inquiry successfully sent! Our structural team will contact you within 24 hours.
                    </div>
                  )}

                  {submitError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold text-center">
                      ⚠ {submitError}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Side Information */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl space-y-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider border-b border-yellow-500/20 pb-2">
                  What Happens Next?
                </h3>
                
                <ul className="space-y-6">
                  <li className="flex items-start space-x-4">
                    <div className="bg-yellow-400/10 text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Inquiry Verification</h4>
                      <p className="text-xs text-zinc-400 mt-1">Our technical estimation desk verifies your building square footage and service tier requirements.</p>
                    </div>
                  </li>

                  <li className="flex items-start space-x-4">
                    <div className="bg-yellow-400/10 text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Structural Site Inspection</h4>
                      <p className="text-xs text-zinc-400 mt-1">We schedule a soil testing and structural site inspection to confirm architectural feasibility.</p>
                    </div>
                  </li>

                  <li className="flex items-start space-x-4">
                    <div className="bg-yellow-400/10 text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Finalized Blueprint & Contract</h4>
                      <p className="text-xs text-zinc-400 mt-1">Receive a comprehensive, legally-binding construction contract outlining exact materials, milestones, and dates.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Trust Badge */}
              <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl flex items-center space-x-4">
                <div className="bg-yellow-400/10 p-3.5 rounded-2xl text-yellow-400">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Locked-In Price Guarantee</h4>
                  <p className="text-xs text-zinc-400 mt-1">Once a contract is signed, rates are secured. We cover any unexpected supply chain inflation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Construction Ads / Announcements Section (MOVED BELOW CALCULATOR) */}
      {ads.length > 0 && (
        <section className="py-16 bg-black border-t border-b border-zinc-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.03),transparent)] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <span className="text-xs font-black tracking-widest text-yellow-400 uppercase">Live Promoted Services & Offers</span>
              <h2 className="text-2xl sm:text-4xl font-black">Featured Announcements</h2>
              <p className="text-zinc-400 text-sm">
                Explore our highlighted special offers, technical expertise additions, and limited-time discounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => {
                const style = getAdStyle(ad);
                return (
                  <div 
                    key={ad.id} 
                    className={`border p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${style.cardClass}`}
                  >
                    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-xl group-hover:opacity-100 transition duration-300 ${style.glowClass}`}></div>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${style.badgeClass}`}>
                          {ad.badge}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(ad.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="mt-1 flex-shrink-0">
                          {style.icon === 'Gift' && <Gift className="h-5 w-5 text-emerald-400" />}
                          {style.icon === 'Tag' && <Tag className="h-5 w-5 text-yellow-400" />}
                          {style.icon === 'Sparkles' && <Sparkles className="h-5 w-5 text-cyan-400" />}
                          {style.icon === 'Megaphone' && <Megaphone className="h-5 w-5 text-yellow-400/80" />}
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${style.textColor}`}>
                            {style.typeName}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-0.5 group-hover:text-yellow-400 transition-colors duration-200">
                            {ad.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-zinc-400 text-xs leading-relaxed pl-8">
                        {ad.description}
                      </p>
                    </div>
                    <div className="border-t border-zinc-900/50 pt-4 mt-4 pl-8 flex items-center justify-between text-[10px] text-zinc-500 font-black tracking-widest uppercase">
                      <span>Verified Promo</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    </div>
                  </div>
                );
              })}

              {/* Informative "How to use this feature" Card */}
              <div className="bg-zinc-950/40 border border-dashed border-zinc-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center space-x-2 text-yellow-400 mb-4">
                    <Info className="h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-wider">Ad Configuration Guide</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    How Do I Publish My Own Ads?
                  </h3>
                  <p className="text-zinc-500 text-xs leading-relaxed space-y-2">
                    <span className="block">1. Log in to the <strong>Admin Panel</strong>.</span>
                    <span className="block">2. Scroll to <strong>Rate & Announcement Configuration</strong>.</span>
                    <span className="block">3. Enter Title, Description, and Badge.</span>
                    <span className="block">4. Our system automatically reads keywords (like <em>"Free", "Discount", "₹", "New"</em>) and formats them into matching <strong>Generated Types</strong> with custom colors and icons!</span>
                  </p>
                </div>
                <div className="border-t border-zinc-900/50 pt-4 mt-4 text-[10px] text-yellow-400/60 font-bold uppercase tracking-widest">
                  ★ Smart Ad Classification System
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Address & Head Office Section */}
      <section className="py-20 bg-zinc-950/50 border-t border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Address Details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-black tracking-widest text-yellow-400 uppercase">Headquarters</span>
                <h2 className="text-3xl sm:text-5xl font-black mt-1">Visit Our Office</h2>
                <p className="text-zinc-400 mt-2">Drop by to discuss custom structural blueprints, soil reports, and project financing options.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-400/10 p-3 rounded-xl text-yellow-400 mt-1">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Patna Office</h4>
                    <p className="text-sm text-zinc-400 mt-1">Patna, Bihar, India</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-400/10 p-3 rounded-xl text-yellow-400 mt-1">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Email Support</h4>
                    <a href="mailto:ramchhotan63@gmail.com" className="text-sm text-yellow-400 hover:underline mt-1 block">ramchhotan63@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-400/10 p-3 rounded-xl text-yellow-400 mt-1">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Direct Phone Line</h4>
                    <a href="tel:+919798133589" className="text-sm text-yellow-400 hover:underline mt-1 block">+91 97981 33589</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map Overlay */}
            <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 p-2 rounded-3xl overflow-hidden shadow-2xl h-[380px] relative group">
              <div className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125 brightness-50 group-hover:scale-105 transition-all duration-700 pointer-events-none" style={{ backgroundImage: `url('/images/calculator-bg.jpg')` }}></div>
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-all duration-300 pointer-events-none"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="bg-yellow-400 text-black p-4 rounded-full shadow-xl shadow-yellow-400/20 animate-bounce">
                  <MapPin className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-black text-white">Chhotan Ram Construction HQ</h4>
                <p className="text-zinc-300 text-xs max-w-sm">Patna, Bihar, India. Near Main Commercial Hub. Available for site visits and structural blueprint discussions.</p>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xs rounded-xl transition"
                >
                  <span>Open in Google Maps</span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
