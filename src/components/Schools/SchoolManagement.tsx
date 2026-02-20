"use client"
import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import {
  Upload,
  Save,
  Edit,
  Trash2,
  Plus,
  Image as ImageIcon,
  Mail,
  Phone,
  MapPin,
  Users,
  BookOpen,
  Building,
  CreditCard,
  Crown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Award,
  Eye,
  EyeOff,
  LayoutDashboard,
  GraduationCap,
  Globe,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SchoolData {
  schoolName: string;
  heroText: string;
  heroSubtitle: string;
  schoolLogo: string | null;
  heroImage: string | null;
  bannerTitle: string;
  bannerImage: string | null;
  bannerStats: Array<{ icon: string; text: string }>;
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string | null;
  classes: string[];
  subjectCount: number;
  studentCount: number;
  facilities: { image: string; name: string; description?: string }[];
  campus: { image: string; name: string; description?: string }[];
  softSkills: string[];
  levelSelection: string;
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  description: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

interface Subscription {
  plan: string;
  status: string;
  renewalDate: string;
  features: string[];
  price: number;
  hasPaymentMethod: boolean;
}

interface PaymentMethod {
  type: string;
  last4: string;
  expiry: string;
}

interface SchoolManagementProps {
  school: string;
}

// --- Helper Components (moved outside to prevent re-renders) ---
const SectionCard = ({ title, icon: Icon, children, className = '', action }: { title: string, icon: any, children: React.ReactNode, className?: string, action?: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-surface/50 backdrop-blur-md border border-muted/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col ${className}`}
  >
    <div className="p-5 border-b border-muted/10 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-bold text-text">{title}</h2>
      </div>
      {action}
    </div>
    <div className="p-6 flex-1">
      {children}
    </div>
  </motion.div>
);

const InputField = ({ label, name, value, onChange, placeholder, type = "text", required = false, editing, icon: Icon }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-muted uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
          <Icon size={16} />
        </div>
      )}
      {editing ? (
        type === 'textarea' ? (
          <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className={`w-full p-2.5 rounded-xl bg-bg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm ${Icon ? 'pl-10' : ''}`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full p-2.5 rounded-xl bg-bg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm ${Icon ? 'pl-10' : ''}`}
          />
        )
      ) : (
        <div className={`p-2.5 rounded-xl bg-bg/50 border border-transparent min-h-[42px] flex items-center ${!value ? 'text-muted italic' : 'text-text font-medium'} text-sm ${Icon ? 'pl-10' : ''}`}>
          {value || 'Not set'}
        </div>
      )}
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, editing, name, onChange }: any) => (
  <div className="bg-bg/40 backdrop-blur-sm p-4 rounded-xl border border-muted/10 flex items-center gap-4 group hover:border-primary/30 transition-colors">
    <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:scale-110 transition-transform">
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-muted uppercase tracking-wider">{label}</p>
      {editing ? (
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full text-lg font-bold bg-transparent border-b border-primary/20 focus:border-primary outline-none text-primary"
        />
      ) : (
        <h4 className="text-xl font-bold text-text truncate">{value}</h4>
      )}
    </div>
  </div>
);

const StepIcon = ({ icon: Icon, label, active, completed, onClick }: any) => (
  <button
    onClick={onClick}
    className="relative z-10 flex flex-col items-center gap-2 group outline-none"
  >
    <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${active ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' :
      completed ? 'bg-emerald-500 text-white shadow-md' : 'bg-surface text-muted border border-muted/20 hover:border-primary/30'
      }`}>
      <Icon size={20} className={active ? 'animate-pulse' : ''} />
      {completed && !active && (
        <div className="absolute -top-1 -right-1 bg-white text-emerald-500 rounded-full p-0.5 border-2 border-emerald-500">
          <CheckCircle size={10} />
        </div>
      )}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${active ? 'text-primary' : completed ? 'text-emerald-500' : 'text-muted group-hover:text-text'}`}>
      {label}
    </span>
  </button>
);

// Helper function to check if a step is completed based on data
const isStepCompleted = (stepId: string, data: SchoolData, subscription?: Subscription): boolean => {
  switch (stepId) {
    case 'brand':
      return !!(data.schoolLogo && data.heroImage && data.heroText && data.description);
    case 'banner':
      return !!(data.bannerImage && data.bannerTitle && data.bannerStats.length >= 3);
    case 'experience':
      return !!(data.aboutTitle && data.aboutDescription && data.aboutImage);
    case 'campus':
      return data.facilities.length > 0 && data.campus.length > 0;
    case 'contact':
      return !!(data.contact.address && data.contact.phone && data.contact.email);
    case 'membership':
      return subscription ? subscription.plan !== 'Free' : false;
    default:
      return false;
  }
};

// Helper function to find the first incomplete step
const getFirstIncompleteStep = (steps: any[], data: SchoolData, subscription: Subscription): number => {
  for (let i = 0; i < steps.length; i++) {
    if (!isStepCompleted(steps[i].id, data, subscription)) {
      return i;
    }
  }
  return 0; // Default to first step if all are complete
};

const SchoolManagement = ({ school }: SchoolManagementProps) => {
  // Predefined facility options (matching application form)
  const facilityOptions = [
    "Science Laboratory",
    "Computer Lab",
    "Library",
    "Sports Facilities",
    "Art Room",
    "Music Room",
    "Cafeteria",
    "Auditorium",
    "School Bus",
    "Wi-Fi Connectivity"
  ];

  const managementSteps = [
    { id: 'brand', label: 'Brand & Hero', icon: Crown },
    { id: 'banner', label: 'Banner & Stats', icon: Award },
    { id: 'experience', label: 'Experience & Academics', icon: LayoutDashboard },
    { id: 'campus', label: 'Campus Life', icon: Building },
    { id: 'contact', label: 'Contact & Social', icon: MapPin },
    { id: 'membership', label: 'Membership', icon: Zap },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [levels, setLevels] = useState<any[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolData>({
    schoolName: 'Loading...',
    heroText: '',
    heroSubtitle: '',
    schoolLogo: null,
    heroImage: null,
    bannerTitle: '',
    bannerImage: null,
    bannerStats: [],
    aboutTitle: '',
    aboutDescription: '',
    aboutImage: null,
    classes: [],
    subjectCount: 0,
    studentCount: 0,
    facilities: [],
    campus: [],
    softSkills: [],
    levelSelection: 'jss1-ss3',
    contact: {
      address: '',
      phone: '',
      email: ''
    },
    description: ''
  });

  const [subscription, setSubscription] = useState<Subscription>({
    plan: 'Free',
    status: 'active',
    renewalDate: 'N/A',
    features: [
      'Up to 500 students',
      'Basic analytics',
      'Email support'
    ],
    price: 0,
    hasPaymentMethod: false
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentMethodForm, setShowPaymentMethodForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newClass, setNewClass] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [newFacility, setNewFacility] = useState({ name: '', description: '', imageUrl: '', imageFile: null as File | null });
  const [newCampus, setNewCampus] = useState({ title: '', description: '', imageUrl: '', imageFile: null as File | null });
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newBannerStat, setNewBannerStat] = useState({ icon: '', text: '' });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Preview states for images
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);

  // File states for pending uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);

  // Fetch school data from database
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const data = await response.json();
          const schoolId = data.id;

          // Update school data with fetched data
          setSchoolData(prev => ({
            ...prev,
            schoolName: data.name || 'School Name',
            heroText: data.content?.heroTitle || '',
            heroSubtitle: data.content?.heroSubtitle || '',
            schoolLogo: data.content?.schoolLogo || null,
            heroImage: data.content?.heroImage || null,
            bannerTitle: data.content?.bannerTitle || '',
            bannerImage: data.content?.bannerImage || null,
            bannerStats: data.content?.bannerStats || [],
            aboutTitle: data.content?.aboutTitle || '',
            aboutDescription: data.content?.aboutDescription || '',
            aboutImage: data.content?.aboutImage || null,
            classes: data.content?.classes || [],
            subjectCount: data.subjects?.length || 0,
            studentCount: data.students?.length || 0,
            facilities: data.content?.facilities || [],
            campus: data.content?.campusImages || [],
            softSkills: data.content?.softSkills || [],
            levelSelection: data.content?.levelSelection || 'jss1-ss3',
            contact: {
              address: data.content?.contactAddress || '',
              phone: data.content?.contactPhone || '',
              email: data.content?.contactEmail || ''
            },
            description: data.content?.description || '',
            facebookUrl: data.content?.facebookUrl || '',
            twitterUrl: data.content?.twitterUrl || '',
            instagramUrl: data.content?.instagramUrl || '',
            linkedinUrl: data.content?.linkedinUrl || ''
          }));

          // Fetch levels data
          try {
            const levelsResponse = await fetch(`/api/schools/${schoolId}/levels?page=1&limit=100`);
            if (levelsResponse.ok) {
              const levelsData = await levelsResponse.json();
              setLevels(levelsData.levels || []);
            }
          } catch (levelsError) {
            console.error('Error fetching levels:', levelsError);
          }
        } else if (response.status === 404) {
          console.error('School not found:', school);
        } else {
          console.error('Error fetching school data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching school data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (school) {
      fetchSchoolData();
    }
  }, [school]);

  const plans = [
    {
      name: 'Free',
      price: 0,
      features: [
        'Up to 500 students',
        'Basic analytics',
        'Email support'
      ],
      recommended: false
    },
    {
      name: 'Premium',
      price: 99,
      features: [
        'Unlimited students',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Export capabilities'
      ],
      recommended: true
    },
    {
      name: 'Enterprise',
      price: 249,
      features: [
        'Unlimited everything',
        'Dedicated account manager',
        'Custom integrations',
        'API access',
        'SSO authentication'
      ],
      recommended: false
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSchoolData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof SchoolData] as object || {}),
          [child]: value
        }
      }));
    } else {
      setSchoolData(prev => ({ ...prev, [name]: value }));
    }
  };

  const wrapUpload = async (handler: () => Promise<void>) => {
    setUploading(true);
    try {
      await handler();
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setLogoFile(file);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setHeroImagePreview(previewUrl);
      setHeroImageFile(file);
    }
  };

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setBannerImagePreview(previewUrl);
      setBannerImageFile(file);
    }
  };

  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAboutImagePreview(previewUrl);
      setAboutImageFile(file);
    }
  };


  const addClass = () => {
    if (newClass.trim()) {
      setSchoolData(prev => ({
        ...prev,
        classes: [...prev.classes, newClass.trim()]
      }));
      setNewClass('');
    }
  };

  const removeClass = (index: number) => {
    setSchoolData(prev => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index)
    }));
  };

  const addSoftSkill = () => {
    if (newSoftSkill.trim()) {
      setSchoolData(prev => ({
        ...prev,
        softSkills: [...prev.softSkills, newSoftSkill.trim()]
      }));
      setNewSoftSkill('');
    }
  };

  const removeSoftSkill = (index: number) => {
    setSchoolData(prev => ({
      ...prev,
      softSkills: prev.softSkills.filter((_, i) => i !== index)
    }));
  };

  const addBannerStat = () => {
    if (newBannerStat.icon.trim() && newBannerStat.text.trim()) {
      setSchoolData(prev => ({
        ...prev,
        bannerStats: [...prev.bannerStats, { icon: newBannerStat.icon.trim(), text: newBannerStat.text.trim() }]
      }));
      setNewBannerStat({ icon: '', text: '' });
    }
  };

  const removeBannerStat = (index: number) => {
    setSchoolData(prev => ({
      ...prev,
      bannerStats: prev.bannerStats.filter((_, i) => i !== index)
    }));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Upload any pending images first
      if (logoFile) {
        const imageUrl = await uploadImage(logoFile);
        setSchoolData(prev => ({ ...prev, schoolLogo: imageUrl }));
        // Set the uploaded URL directly for use in the save request
        schoolData.schoolLogo = imageUrl;
        // Clean up
        URL.revokeObjectURL(logoPreview!);
        setLogoPreview(null);
        setLogoFile(null);
      }

      if (heroImageFile) {
        const imageUrl = await uploadImage(heroImageFile);
        setSchoolData(prev => ({ ...prev, heroImage: imageUrl }));
        schoolData.heroImage = imageUrl;
        URL.revokeObjectURL(heroImagePreview!);
        setHeroImagePreview(null);
        setHeroImageFile(null);
      }

      if (bannerImageFile) {
        const imageUrl = await uploadImage(bannerImageFile);
        setSchoolData(prev => ({ ...prev, bannerImage: imageUrl }));
        schoolData.bannerImage = imageUrl;
        URL.revokeObjectURL(bannerImagePreview!);
        setBannerImagePreview(null);
        setBannerImageFile(null);
      }

      if (aboutImageFile) {
        const imageUrl = await uploadImage(aboutImageFile);
        setSchoolData(prev => ({ ...prev, aboutImage: imageUrl }));
        schoolData.aboutImage = imageUrl;
        URL.revokeObjectURL(aboutImagePreview!);
        setAboutImagePreview(null);
        setAboutImageFile(null);
      }

      const schoolResponse = await fetch(`/api/schools/by-subdomain/${school}`);
      if (!schoolResponse.ok) throw new Error('School not found');

      const schoolInfo = await schoolResponse.json();
      const schoolId = schoolInfo.id;

      const facilitiesArray = schoolData.facilities.map(facility => ({
        name: facility.name,
        description: facility.description || '',
        image: facility.image || ''
      }));

      const campusArray = schoolData.campus.map(campus => ({
        name: campus.name,
        description: campus.description || '',
        image: campus.image || ''
      }));

      // Auto-generate banner stats if not already set
      const bannerStatsArray = [
        { icon: 'GrUserExpert', text: `${schoolData.studentCount}+ Students` },
        { icon: 'FaBookReader', text: `${schoolData.subjectCount}+ Subjects` },
        { icon: 'MdOutlineAccessTime', text: 'Good Facilities' }
      ];

      const contentResponse = await fetch(`/api/schools/${schoolId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroTitle: schoolData.heroText,
          heroSubtitle: schoolData.heroSubtitle,
          heroImage: schoolData.heroImage,
          schoolLogo: schoolData.schoolLogo,
          bannerTitle: schoolData.bannerTitle,
          bannerImage: schoolData.bannerImage,
          bannerStats: bannerStatsArray,
          aboutTitle: schoolData.aboutTitle,
          aboutDescription: schoolData.aboutDescription,
          aboutImage: schoolData.aboutImage,
          description: schoolData.description,
          contactAddress: schoolData.contact.address,
          contactPhone: schoolData.contact.phone,
          contactEmail: schoolData.contact.email,
          facilities: facilitiesArray,
          campusImages: campusArray,
          softSkills: schoolData.softSkills,
          classes: schoolData.classes,
          levelSelection: schoolData.levelSelection,
          facebookUrl: schoolData.facebookUrl || '',
          twitterUrl: schoolData.twitterUrl || '',
          instagramUrl: schoolData.instagramUrl || '',
          linkedinUrl: schoolData.linkedinUrl || ''
        }),
      });

      if (contentResponse.ok) {
        console.log('Changes saved successfully!');
      } else {
        const errorData = await contentResponse.json();
        console.error('Save failed:', errorData);
        alert(`Failed to save changes: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Error saving changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = (planName: string, planPrice: number) => {
    if (!subscription.hasPaymentMethod) {
      alert('Please add a payment method before upgrading');
      setShowPaymentMethodForm(true);
      setShowUpgradeModal(false);
      return;
    }

    setSubscription(prev => ({
      ...prev,
      plan: planName,
      price: planPrice,
      features: plans.find(p => p.name === planName)?.features || prev.features,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    setShowUpgradeModal(false);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure?')) {
      setSubscription(prev => ({
        ...prev,
        plan: 'Free',
        status: 'cancelled',
        price: 0,
        features: plans.find(p => p.name === 'Free')?.features || [],
        renewalDate: 'N/A'
      }));
    }
  };

  const handlePaymentMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentMethod({
      type: 'visa',
      last4: cardDetails.number.slice(-4),
      expiry: cardDetails.expiry
    });

    setSubscription(prev => ({ ...prev, hasPaymentMethod: true }));
    setShowPaymentMethodForm(false);
    setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
  };

  const removePaymentMethod = () => {
    setPaymentMethod(null);
    setSubscription(prev => ({ ...prev, hasPaymentMethod: false }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload image');
    const data = await response.json();
    return data.imageUrl;
  };

  const addFacility = async () => {
    if (!newFacility.name.trim()) return;
    setUploading(true);
    try {
      let imageUrl = newFacility.imageUrl;
      if (newFacility.imageFile) {
        imageUrl = await uploadImage(newFacility.imageFile);
      }
      setSchoolData(prev => ({
        ...prev,
        facilities: [...prev.facilities, {
          name: newFacility.name,
          description: newFacility.description,
          image: imageUrl
        }]
      }));
      setNewFacility({ name: '', description: '', imageUrl: '', imageFile: null });
      setShowFacilityModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const deleteFacility = (index: number) => {
    setSchoolData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  const addCampus = async () => {
    if (!newCampus.title.trim()) return;
    setUploading(true);
    try {
      let imageUrl = newCampus.imageUrl;
      if (newCampus.imageFile) {
        imageUrl = await uploadImage(newCampus.imageFile);
      }
      setSchoolData(prev => ({
        ...prev,
        campus: [...prev.campus, {
          name: newCampus.title,
          description: newCampus.description,
          image: imageUrl
        }]
      }));
      setNewCampus({ title: '', description: '', imageUrl: '', imageFile: null });
      setShowCampusModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const deleteCampus = (index: number) => {
    setSchoolData(prev => ({
      ...prev,
      campus: prev.campus.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted font-medium animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen font-sans pb-20 selection:bg-primary/20">
      {/* Sticky Top Header */}
      <header className="sticky -top-6 z-40 bg-surface backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center border border-primary/20">
              {schoolData.schoolLogo ? (
                <NextImage src={schoolData.schoolLogo} alt="Logo" fill className="object-cover" />
              ) : (
                <GraduationCap className="text-primary" size={24} />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-text leading-tight">
                {schoolData.schoolName || 'Management'}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${editing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  {editing ? 'Editing Mode' : 'Live Dashboard'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => {
                if (editing) {
                  // If discarding changes, reset currentStep and cleanup previews
                  setCurrentStep(0);
                  // Clean up any preview URLs
                  if (logoPreview) URL.revokeObjectURL(logoPreview);
                  if (heroImagePreview) URL.revokeObjectURL(heroImagePreview);
                  if (bannerImagePreview) URL.revokeObjectURL(bannerImagePreview);
                  if (aboutImagePreview) URL.revokeObjectURL(aboutImagePreview);
                  // Reset preview states
                  setLogoPreview(null);
                  setHeroImagePreview(null);
                  setBannerImagePreview(null);
                  setAboutImagePreview(null);
                  setLogoFile(null);
                  setHeroImageFile(null);
                  setBannerImageFile(null);
                  setAboutImageFile(null);
                  setEditing(false);
                } else {
                  // When entering edit mode, jump to first incomplete step
                  const firstIncomplete = getFirstIncompleteStep(managementSteps, schoolData, subscription);
                  setCurrentStep(firstIncomplete);
                  setEditing(true);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${editing
                ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
            >
              {editing ? <EyeOff size={16} /> : <Edit size={16} />}
              <span className="hidden md:inline">{editing ? 'Discard Changes' : 'Edit Content'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stepper Header (Editing Mode Only) */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-surface/30 border-b border-muted/10 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 overflow-x-auto no-scrollbar">
              <div className="flex items-center justify-between min-w-[600px] relative">
                {/* Background Line */}
                <div className="absolute top-6 left-0 right-0 h-[2px] bg-muted/20 z-0" />

                {/* Active Progress Line */}
                <motion.div
                  className="absolute top-6 left-0 h-[2px] bg-emerald-500 z-0"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / (managementSteps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />

                {managementSteps.map((step, idx) => (
                  <div key={step.id} className="relative z-10 transition-transform hover:scale-105">
                    <StepIcon
                      icon={step.icon}
                      label={step.label}
                      active={currentStep === idx}
                      completed={isStepCompleted(step.id, schoolData, subscription)}
                      onClick={() => setCurrentStep(idx)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

        {/* Alerts for missing info */}
        {editing && (!schoolData.heroText || !schoolData.description) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertCircle className="text-amber-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Landing page incomplete. <span className="font-normal opacity-80">Add hero title and description to publish.</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* --- Main Content Grid --- */}
        {/* --- Main Content Sections --- */}
        <AnimatePresence mode="wait">
          {(!editing || currentStep === 0) && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <SectionCard
                title="Brand Identity & Hero"
                icon={Crown}
                className="relative"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-gray-100 dark:ring-gray-800 p-4 rounded-2xl bg-bg/30">
                  {/* Images Section */}
                  <div className="space-y-6">
                    {/* Hero Image Control */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Hero Cover</label>
                      <div className="relative aspect-[3/4] w-full bg-bg border-2 border-dashed border-muted/20 rounded-2xl overflow-hidden group">
                        {heroImagePreview || schoolData.heroImage ? (
                          <NextImage
                            src={heroImagePreview || schoolData.heroImage!}
                            alt="Hero"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted gap-2">
                            <div className="p-3 bg-bg rounded-full">
                              <ImageIcon size={24} className="opacity-50" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">No cover image</span>
                          </div>
                        )}

                        {editing && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                            <label className="cursor-pointer bg-surface px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                              <Upload size={14} />
                              {heroImagePreview ? 'Change Selection' : 'Select Cover'}
                              <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageUpload} />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logo Control - More compact */}
                    <div className="flex items-center gap-4 p-4 bg-bg rounded-2xl border border-muted/10">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-bg border-2 border-muted/10 group">
                        {logoPreview || (!logoFile && schoolData.schoolLogo) ? (
                          <NextImage src={logoPreview || schoolData.schoolLogo!} alt="Logo Preview" fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-bg">
                            <GraduationCap className="text-muted" size={24} />
                          </div>
                        )}
                        {editing && (
                          <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Upload size={14} className="text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                          </label>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">School Logo</h4>
                        <p className="text-[10px] text-muted font-medium">Standard square format recommended</p>
                      </div>
                    </div>
                  </div>

                  {/* Text Data Section */}
                  <div className="space-y-4">
                    <InputField label="School Name" name="schoolName" value={schoolData.schoolName} onChange={handleInputChange} editing={editing} required icon={Building} />
                    <InputField label="Hero Title" name="heroText" value={schoolData.heroText} onChange={handleInputChange} editing={editing} required icon={ImageIcon} />
                    <InputField label="Hero Subtitle" name="heroSubtitle" value={schoolData.heroSubtitle} onChange={handleInputChange} editing={editing} placeholder="Brief catchy slogan..." icon={Zap} />
                    <InputField label="About Summary" name="description" value={schoolData.description} onChange={handleInputChange} editing={editing} type="textarea" placeholder="Detailed about the school..." icon={LayoutDashboard} />
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}

          {(!editing || currentStep === 1) && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pt-6"
            >
              <SectionCard title="Banner & Key Stats" icon={Award}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-gray-100 dark:ring-gray-800 p-4 rounded-2xl bg-bg/30">
                  {/* Banner Image Section */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Banner Cover Image</label>
                      <div className="relative aspect-[3/4] w-full bg-bg border-2 border-dashed border-muted/20 rounded-2xl overflow-hidden group">
                        {bannerImagePreview || schoolData.bannerImage ? (
                          <NextImage
                            src={bannerImagePreview || schoolData.bannerImage!}
                            alt="Banner"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted gap-2">
                            <div className="p-3 bg-bg rounded-full">
                              <ImageIcon size={24} className="opacity-50" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">No banner image</span>
                          </div>
                        )}
                        {editing && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                            <label className="cursor-pointer bg-surface px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                              <Upload size={14} />
                              {bannerImagePreview ? 'Change Selection' : 'Select Banner'}
                              <input type="file" className="hidden" accept="image/*" onChange={handleBannerImageUpload} />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                    <InputField
                      label="Banner Title"
                      name="bannerTitle"
                      value={schoolData.bannerTitle}
                      onChange={handleInputChange}
                      editing={editing}
                      placeholder="e.g., Excellence in Education Since 1990"
                      icon={Award}
                    />
                  </div>

                  {/* Banner Stats Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Key Statistics (3 Required)</label>
                    <div className="space-y-3">
                      {/* Student Count Stat */}
                      <div className="bg-bg/60 border border-muted/10 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Users size={16} className="text-primary" />
                          <span className="text-xs font-bold opacity-50">Icon: GrUserExpert</span>
                        </div>
                        <input
                          type="text"
                          value={`${schoolData.studentCount}+ Students`}
                          readOnly
                          className="w-full bg-transparent text-sm font-bold text-text outline-none"
                        />
                        <p className="text-[9px] text-muted mt-1">Auto-generated from student count</p>
                      </div>

                      {/* Subject Count Stat */}
                      <div className="bg-bg/60 border border-muted/10 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen size={16} className="text-primary" />
                          <span className="text-xs font-bold opacity-50">Icon: FaBookReader</span>
                        </div>
                        <input
                          type="text"
                          value={`${schoolData.subjectCount}+ Subjects`}
                          readOnly
                          className="w-full bg-transparent text-sm font-bold text-text outline-none"
                        />
                        <p className="text-[9px] text-muted mt-1">Auto-generated from subject count</p>
                      </div>

                      {/* Good Facilities Stat (Default) */}
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Building size={16} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-600">Icon: MdOutlineAccessTime</span>
                        </div>
                        <input
                          type="text"
                          value="Good Facilities"
                          readOnly
                          className="w-full bg-transparent text-sm font-bold text-emerald-900 dark:text-emerald-100 outline-none"
                        />
                        <p className="text-[9px] text-emerald-600 mt-1">Default stat - highlights campus quality</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl flex items-center gap-3">
                      <AlertCircle size={16} className="text-blue-600 shrink-0" />
                      <p className="text-[10px] text-blue-900 dark:text-blue-100 font-medium">
                        These stats display prominently on your school homepage to attract parents and students.
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}

          {(!editing || currentStep === 2) && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6"
            >
              <div className="lg:col-span-8 space-y-6">
                <SectionCard title="Experience & Identity" icon={LayoutDashboard}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:p-2">
                    <div className="space-y-4">
                      <InputField label="About Page Title" name="aboutTitle" value={schoolData.aboutTitle} onChange={handleInputChange} editing={editing} placeholder="e.g. Our History & Vision" icon={Award} />
                      <InputField label="About Detailed Description" name="aboutDescription" value={schoolData.aboutDescription} onChange={handleInputChange} editing={editing} type="textarea" placeholder="Full history and mission statement..." />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Identity Image</label>
                      <div className="relative aspect-[3/4] w-full bg-bg border border-muted/10 rounded-2xl overflow-hidden group">
                        {aboutImagePreview || (!aboutImageFile && schoolData.aboutImage) ? (
                          <NextImage src={aboutImagePreview || schoolData.aboutImage!} alt="About Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-bg border-2 border-dashed border-muted/20 rounded-2xl">
                            <ImageIcon className="text-muted" size={32} />
                          </div>
                        )}
                        {editing && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <label className="cursor-pointer bg-surface px-4 py-2 rounded-xl text-xs font-bold shadow-xl">
                              {aboutImagePreview ? 'Change Selection' : 'Select Image'}
                              <input type="file" className="hidden" accept="image/*" onChange={handleAboutImageUpload} />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <SectionCard title="School Levels & Classes" icon={GraduationCap}>
                  <div className="space-y-4">
                    {/* Info banner */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl flex items-center gap-3">
                      <AlertCircle size={16} className="text-blue-600 shrink-0" />
                      <p className="text-[10px] text-blue-900 dark:text-blue-100 font-medium">
                        Levels and classes are managed in the <strong>Levels section</strong>. Changes made there will automatically appear here.
                      </p>
                    </div>

                    {/* Levels Display */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <GraduationCap size={12} />
                        Current Levels ({levels.length})
                      </label>
                      {levels.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {levels.map((level: any) => (
                            <div key={level.id} className="px-3 py-2 bg-bg border border-muted/10 rounded-lg">
                              <p className="text-[11px] font-bold text-text">{level.name}</p>
                              {level.description && (
                                <p className="text-[9px] text-muted truncate mt-0.5">{level.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1 text-[8px] text-muted">
                                <span className="flex items-center gap-1">
                                  <Users size={8} /> {level.classCount || 0} classes
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen size={8} /> {level.subjectCount || 0} subjects
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center text-center bg-bg/50 border-2 border-dashed border-muted/20 rounded-xl">
                          <GraduationCap size={24} className="text-muted/30 mb-2" />
                          <p className="text-xs font-bold text-muted/70">No levels created yet</p>
                          <p className="text-[10px] text-muted/50 mt-1">Visit the Levels page to add levels</p>
                        </div>
                      )}
                    </div>

                    {/* Classes Display (if any) */}
                    {schoolData.classes && schoolData.classes.length > 0 && (
                      <div className="pt-4 border-t border-muted/10 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted">Additional Classes</label>
                        <div className="flex flex-wrap gap-2">
                          {schoolData.classes.map((cls, i) => (
                            <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold text-primary">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            </motion.div>
          )}

          {(!editing || currentStep === 3) && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pt-6"
            >
              <SectionCard
                title="Campus Facilities"
                icon={Building}
                action={editing && (
                  <button
                    onClick={() => setShowFacilityModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={14} /> Add New
                  </button>
                )}
              >
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolData.facilities.map((facility, idx) => (
                    <div key={idx} className="group relative rounded-2xl overflow-hidden border border-muted/10 bg-bg transition-all hover:border-primary/20">
                      <div className="aspect-[3/4] relative">
                        {facility.image ? (
                          <NextImage src={facility.image} alt={facility.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full flex items-center justify-center bg-bg border-2 border-dashed border-muted/20 rounded-2xl"><Building className="text-muted" /></div>
                        )}

                        {editing && (
                          <button
                            onClick={() => deleteFacility(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-xs truncate uppercase tracking-tight">{facility.name}</h4>
                        {facility.description && <p className="text-[10px] text-muted truncate mt-1">{facility.description}</p>}
                      </div>
                    </div>
                  ))}

                  {!editing && schoolData.facilities.length === 0 && (
                    <div className="col-span-full py-10 flex flex-col items-center justify-center text-muted border-2 border-dashed border-muted/20 rounded-3xl">
                      <Building size={32} className="opacity-20 mb-2" />
                      <p className="text-xs font-medium italic">No facilities showcased yet</p>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Campus Showcase (Moved inside step 2 for editing) */}
              <SectionCard
                title="Campus Showcase"
                icon={Globe}
                action={editing && (
                  <button
                    onClick={() => setShowCampusModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={14} /> Add Photo
                  </button>
                )}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {schoolData.campus.map((img, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square border border-muted/10 bg-bg transition-all hover:shadow-xl">
                      {img.image ? (
                        <NextImage src={img.image} alt={img.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-bg border-2 border-dashed border-muted/20 rounded-2xl"><ImageIcon className="text-muted" /></div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                        <p className="text-xs font-black text-white uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform">{img.name}</p>
                        {img.description && <p className="text-[10px] text-white/70 line-clamp-1 mt-1 translate-y-2 group-hover:translate-y-0 transition-transform delay-75">{img.description}</p>}
                      </div>

                      {editing && (
                        <button
                          onClick={() => deleteCampus(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-10"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}

                  {!editing && schoolData.campus.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted border-2 border-dashed border-muted/20 rounded-3xl">
                      <Globe size={48} className="opacity-10 mb-4 animate-pulse" />
                      <p className="text-sm font-bold uppercase tracking-widest opacity-30">No campus photos available</p>
                    </div>
                  )}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {(!editing || currentStep === 4) && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pt-6"
            >
              <SectionCard title="Contact Detail" icon={MapPin}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <InputField label="Address" name="contact.address" value={schoolData.contact.address} onChange={handleInputChange} editing={editing} icon={MapPin} />
                    <InputField label="Direct Phone" name="contact.phone" value={schoolData.contact.phone} onChange={handleInputChange} editing={editing} icon={Phone} />
                    <InputField label="Support Email" name="contact.email" value={schoolData.contact.email} onChange={handleInputChange} editing={editing} icon={Mail} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2"><Share2 size={12} /> Social Handles</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <InputField label="Facebook" name="facebookUrl" value={schoolData.facebookUrl} onChange={handleInputChange} editing={editing} placeholder="FB profile URL..." />
                      <InputField label="Twitter/X" name="twitterUrl" value={schoolData.twitterUrl} onChange={handleInputChange} editing={editing} placeholder="X handle URL..." />
                      <InputField label="Instagram" name="instagramUrl" value={schoolData.instagramUrl} onChange={handleInputChange} editing={editing} placeholder="IG link URL..." />
                      <InputField label="LinkedIn" name="linkedinUrl" value={schoolData.linkedinUrl} onChange={handleInputChange} editing={editing} placeholder="LI page URL..." />
                    </div>
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}

          {(!editing || currentStep === 5) && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pt-6 max-w-2xl mx-auto"
            >
              <div className={`rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl transition-all duration-500 ${subscription.plan === 'Premium' ? 'bg-gradient-to-br from-primary via-emerald-600 to-emerald-800' : 'bg-gradient-to-br from-gray-800 to-black'}`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-1">Current Membership</p>
                      <h3 className="text-4xl font-black italic tracking-tighter">{subscription.plan}</h3>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10 group-hover:rotate-12 transition-transform shadow-2xl">
                      {subscription.plan === 'Premium' ? <Crown size={40} className="text-yellow-400" /> : <Zap size={40} className="text-white" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="py-4 px-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${subscription.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        <p className="text-sm font-black uppercase tracking-widest">{subscription.status}</p>
                      </div>
                    </div>
                    <div className="py-4 px-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-1">Valid Until</p>
                      <p className="text-sm font-black tracking-widest">{subscription.renewalDate}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1">Plan Features</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {subscription.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 px-4 bg-black/20 rounded-2xl border border-white/5">
                          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold opacity-80">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full py-5 bg-white text-gray-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Zap size={18} fill="currentColor" />
                    Expand Your Potential
                  </button>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-700" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/40 rounded-full blur-[100px]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Floating Navigation Footer (Editing Mode Only) */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto bg-surface/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-4 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="p-3 rounded-xl bg-bg text-text border border-gray-100 dark:border-gray-800 disabled:opacity-30 transition-all hover:bg-gray-50 active:scale-95"
                >
                  <motion.div animate={{ x: currentStep === 0 ? 0 : -2 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Edit size={18} className="rotate-180" />
                  </motion.div>
                </button>
                <div className="hidden sm:block px-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">Step {currentStep + 1} of {managementSteps.length}</p>
                  <p className="text-sm font-black tracking-tight">{managementSteps[currentStep].label}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="p-3 rounded-xl bg-bg text-text border border-gray-100 dark:border-gray-800 disabled:opacity-30 transition-all hover:bg-gray-50 active:scale-95"
                >
                  <motion.svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ x: currentStep === 0 ? 0 : [-2, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </motion.svg>
                </button>
                {currentStep < managementSteps.length - 1 ? (
                  <button
                    onClick={async () => {
                      await saveChanges();
                      if (!saving) {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save & Continue
                        <Zap size={16} fill="white" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await saveChanges();
                      if (!saving) {
                        setEditing(false);
                        setCurrentStep(0);
                      }
                    }}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Finish & Publish
                        <CheckCircle size={16} fill="white" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modals --- */}
      {/* (Keeping existing modal logic but wrapping in cleaner container) */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Choose Your Tier</h2>
                <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-bg rounded-full transition-colors"><XCircle size={24} /></button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan, i) => (
                  <div key={i} className={`relative p-8 rounded-3xl border transition-all duration-500 overflow-hidden group ${plan.recommended ? 'border-primary ring-4 ring-primary/10' : 'border-muted/10'} ${plan.name === 'Enterprise' ? 'bg-gray-900 text-white' : 'bg-bg'}`}>
                    {plan.recommended && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg">Popular Choice</div>}
                    <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-black tracking-tighter text-primary">${plan.price}</span>
                      <span className="text-xs font-bold opacity-50 uppercase tracking-widest">/ Month</span>
                    </div>
                    <ul className="space-y-4 mb-10">
                      {plan.features.map((f, fi) => (
                        <li key={fi} className="flex gap-3 text-xs font-bold leading-relaxed items-start">
                          <div className="p-0.5 bg-emerald-500/10 rounded text-emerald-500 mt-0.5">
                            <CheckCircle size={14} className="shrink-0" />
                          </div>
                          <span className="opacity-80">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade(plan.name, plan.price)}
                      disabled={subscription.plan === plan.name}
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${plan.name === 'Enterprise' ? 'bg-white text-black hover:bg-gray-200' :
                        plan.recommended ? 'bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200'
                        }`}
                    >
                      {subscription.plan === plan.name ? 'Active Plan' : 'Select Tier'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Reusing simple modals structure for others for brevity but styled */}
      {[
        {
          show: showFacilityModal, close: () => {
            setShowFacilityModal(false);
            setNewFacility({ name: '', description: '', imageUrl: '', imageFile: null });
          }, title: "Add New Facility", icon: Building, content: (
            <div className="space-y-5">
              <div className='flex flex-col gap-1.5'>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Select Facility Category *</label>
                <select
                  value={newFacility.name}
                  onChange={(e: any) => setNewFacility({ ...newFacility, name: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-bg border border-muted/20 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold appearance-none shadow-sm"
                >
                  <option value="">-- Choose a category --</option>
                  {facilityOptions.map(option => (
                    <option
                      key={option}
                      value={option}
                      disabled={schoolData.facilities.some(f => f.name === option)}
                    >
                      {option} {schoolData.facilities.some(f => f.name === option) ? '(Already added)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex flex-col gap-1.5'>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Feature Description</label>
                <textarea
                  value={newFacility.description}
                  onChange={e => setNewFacility({ ...newFacility, description: e.target.value })}
                  placeholder="Describe what makes this facility special..."
                  rows={3}
                  className="w-full p-4 rounded-2xl bg-bg border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm font-medium"
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Media Upload *</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && setNewFacility({ ...newFacility, imageFile: e.target.files[0] })}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full p-6 border-2 border-dashed border-muted/20 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-primary/50 transition-colors bg-bg/50">
                    <div className="p-3 bg-primary/5 rounded-full text-primary">
                      <ImageIcon size={20} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-primary transition-colors">
                      {newFacility.imageFile ? newFacility.imageFile.name : 'Click to select image'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={addFacility}
                disabled={uploading || !newFacility.name.trim() || !newFacility.imageFile}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add to Showcase
                  </>
                )}
              </button>
            </div>
          )
        },
        {
          show: showCampusModal, close: () => {
            setShowCampusModal(false);
            setNewCampus({ title: '', description: '', imageUrl: '', imageFile: null });
          }, title: "Add Campus Highlight", icon: Globe, content: (
            <div className="space-y-5">
              <div className='flex flex-col gap-1.5'>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Location Name *</label>
                <input
                  type="text"
                  value={newCampus.title}
                  onChange={(e: any) => setNewCampus({ ...newCampus, title: e.target.value })}
                  placeholder="e.g. Main Entrance, Football Pitch..."
                  className="w-full p-4 rounded-2xl bg-bg border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold shadow-sm"
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Highlight Notes</label>
                <textarea
                  value={newCampus.description}
                  onChange={e => setNewCampus({ ...newCampus, description: e.target.value })}
                  placeholder="Brief story about this location..."
                  rows={3}
                  className="w-full p-4 rounded-2xl bg-bg border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm font-medium"
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Visual Content *</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && setNewCampus({ ...newCampus, imageFile: e.target.files[0] })}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full p-6 border-2 border-dashed border-muted/20 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-primary/50 transition-colors bg-bg/50">
                    <div className="p-3 bg-primary/5 rounded-full text-primary">
                      <Globe size={20} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-primary transition-colors">
                      {newCampus.imageFile ? newCampus.imageFile.name : 'Select campus photo'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={addCampus}
                disabled={uploading || !newCampus.title.trim() || !newCampus.imageFile}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Highlight
                  </>
                )}
              </button>
            </div>
          )
        },
        {
          show: showPaymentMethodForm, close: () => setShowPaymentMethodForm(false), title: "Payment Settings", icon: CreditCard, content: (
            <form onSubmit={handlePaymentMethodSubmit} className="space-y-5">
              <InputField label="Cardholder Identity" value={cardDetails.name} onChange={(e: any) => setCardDetails({ ...cardDetails, name: e.target.value })} editing={true} icon={Users} placeholder="Full Name on Card" />
              <InputField label="Secure Card Number" value={cardDetails.number} onChange={(e: any) => setCardDetails({ ...cardDetails, number: e.target.value })} editing={true} placeholder="0000 0000 0000 0000" icon={CreditCard} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Expiry Date" value={cardDetails.expiry} onChange={(e: any) => setCardDetails({ ...cardDetails, expiry: e.target.value })} editing={true} placeholder="MM/YY" icon={Zap} />
                <InputField label="CVV Mask" value={cardDetails.cvc} onChange={(e: any) => setCardDetails({ ...cardDetails, cvc: e.target.value })} editing={true} placeholder="123" icon={EyeOff} />
              </div>
              <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest mt-4 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all">Save Securely</button>
            </form>
          )
        }
      ].map((modal, i) => (
        modal.show && (
          <div key={i} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-surface/90 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-white/10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <modal.icon size={20} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{modal.title}</h3>
                </div>
                <button onClick={modal.close} className="p-2 hover:bg-bg rounded-full transition-colors"><XCircle size={20} className="text-muted" /></button>
              </div>
              {modal.content}
            </motion.div>
          </div>
        )
      ))}

    </div>
  );
};

export default SchoolManagement;