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
  EyeOff
} from 'lucide-react';

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

const SchoolManagement = ({ school }: SchoolManagementProps) => {
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

  // Fetch school data from database
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const data = await response.json();
          
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
        } else if (response.status === 404) {
          console.error('School not found:', school);
          alert('School not found. Please check if the school exists in the database.');
        } else {
          console.error('Error fetching school data:', response.status);
          alert(`Error fetching school data: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching school data:', error);
        alert('Network error while fetching school data. Please check your connection.');
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setSchoolData(prev => ({ ...prev, schoolLogo: imageUrl }));
      } catch (error) {
        console.error('Error uploading logo:', error);
        alert('Error uploading logo');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setSchoolData(prev => ({ ...prev, heroImage: imageUrl }));
      } catch (error) {
        console.error('Error uploading hero image:', error);
        alert('Error uploading hero image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setSchoolData(prev => ({ ...prev, bannerImage: imageUrl }));
      } catch (error) {
        console.error('Error uploading banner image:', error);
        alert('Error uploading banner image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setSchoolData(prev => ({ ...prev, aboutImage: imageUrl }));
      } catch (error) {
        console.error('Error uploading about image:', error);
        alert('Error uploading about image');
      } finally {
        setUploading(false);
      }
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
      // First get the school ID from the subdomain
      const schoolResponse = await fetch(`/api/schools/by-subdomain/${school}`);
      if (!schoolResponse.ok) {
        if (schoolResponse.status === 404) {
          alert('School not found. Please check if the school exists in the database.');
        } else {
          alert(`Error fetching school data: ${schoolResponse.status}`);
        }

        return;
      }
      
      const schoolInfo = await schoolResponse.json();
      const schoolId = schoolInfo.id;

      // Save facilities and campus images to the school's content
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

      console.log('Saving facilities:', facilitiesArray);
      console.log('Saving campus:', campusArray);
      console.log('School ID:', schoolId);

      // Update the school content with new fields
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
          bannerStats: schoolData.bannerStats,
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
        console.log('Saving school data:', schoolData);
        setEditing(false);
        alert('Changes saved successfully!');
      } else {
        const contentError = await contentResponse.text();
        console.error('Content error:', contentError);
        alert(`Error saving data to database. Status: ${contentResponse.status}`);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes');
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
      renewalDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    }));
    
    setShowUpgradeModal(false);
    alert(`Successfully upgraded to ${planName} plan!`);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      setSubscription(prev => ({ 
        ...prev, 
        plan: 'Free',
        status: 'cancelled',
        price: 0,
        features: plans.find(p => p.name === 'Free')?.features || [],
        renewalDate: 'N/A'
      }));
      alert('Subscription has been cancelled. You have been downgraded to the Free plan.');
    }
  };

  const handlePaymentMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to a payment processor
    setPaymentMethod({
      type: 'visa',
      last4: cardDetails.number.slice(-4),
      expiry: cardDetails.expiry
    });
    
    setSubscription(prev => ({ ...prev, hasPaymentMethod: true }));
    setShowPaymentMethodForm(false);
    setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
    alert('Payment method added successfully!');
  };

  const removePaymentMethod = () => {
    setPaymentMethod(null);
    setSubscription(prev => ({ ...prev, hasPaymentMethod: false }));
    alert('Payment method removed successfully!');
  };

  // Image upload function
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
  };

  // Facility Management Functions
  const addFacility = async () => {
    if (!newFacility.name.trim()) {
      alert('Facility name is required');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = newFacility.imageUrl;
      
      // Upload image if file is selected
      if (newFacility.imageFile) {
        imageUrl = await uploadImage(newFacility.imageFile);
      }

      // Add facility to the school's facilities array
      const updatedFacilities = [...schoolData.facilities, {
        name: newFacility.name,
        description: newFacility.description,
        image: imageUrl
      }];

      setSchoolData(prev => ({
        ...prev,
        facilities: updatedFacilities
      }));

      setNewFacility({ name: '', description: '', imageUrl: '', imageFile: null });
      setShowFacilityModal(false);
      alert('Facility added successfully!');
    } catch (error) {
      console.error('Error adding facility:', error);
      alert('Error adding facility');
    } finally {
      setUploading(false);
    }
  };

  const deleteFacility = (index: number) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;

    const updatedFacilities = schoolData.facilities.filter((_, i) => i !== index);
    setSchoolData(prev => ({
      ...prev,
      facilities: updatedFacilities
    }));
    alert('Facility deleted successfully!');
  };

  // Campus Management Functions
  const addCampus = async () => {
    if (!newCampus.title.trim()) {
      alert('Campus title is required');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = newCampus.imageUrl;
      
      // Upload image if file is selected
      if (newCampus.imageFile) {
        imageUrl = await uploadImage(newCampus.imageFile);
      }

      // Add campus to the school's campus array
      const updatedCampus = [...schoolData.campus, {
        name: newCampus.title,
        description: newCampus.description,
        image: imageUrl
      }];

      setSchoolData(prev => ({
        ...prev,
        campus: updatedCampus
      }));

      setNewCampus({ title: '', description: '', imageUrl: '', imageFile: null });
      setShowCampusModal(false);
      alert('Campus image added successfully!');
    } catch (error) {
      console.error('Error adding campus:', error);
      alert('Error adding campus image');
    } finally {
      setUploading(false);
    }
  };

  const deleteCampus = (index: number) => {
    if (!window.confirm('Are you sure you want to delete this campus image?')) return;

    const updatedCampus = schoolData.campus.filter((_, i) => i !== index);
    setSchoolData(prev => ({
      ...prev,
      campus: updatedCampus
    }));
    alert('Campus image deleted successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text font-poppins p-4 md:p-6">
        <div className="max-w-6xl mx-auto bg-surface rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading school data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text font-poppins p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-surface rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-text">
          <h1 className="text-2xl md:text-3xl font-bold">School Management Dashboard</h1>
          <p className="mt-2">Manage your school&apos;s landing page content and subscription</p>
        </div>

        <div className="p-6">
          {/* Setup Banner */}
          {(!schoolData.heroText || !schoolData.description || !schoolData.contact.address) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-yellow-600 text-2xl mr-3">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-yellow-800 font-semibold mb-2">
                    Complete Your School Landing Page Setup
                  </h3>
                  <p className="text-yellow-700 text-sm mb-3">
                    Your landing page is missing some important content. Please fill in the required fields below to make your school&apos;s website complete.
                  </p>
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Missing content:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {!schoolData.heroText && <li>Hero text (main title)</li>}
                      {!schoolData.description && <li>School description</li>}
                      {!schoolData.contact.address && <li>Contact address</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit/Save Toggle */}
          <div className="flex justify-end mb-6">
            {editing ? (
              <button
                onClick={saveChanges}
                disabled={saving}
                className="flex items-center bg-success text-text px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center bg-primary text-text px-4 py-2 rounded-lg font-medium"
              >
                <Edit size={18} className="mr-2" />
                Edit Content
              </button>
            )}
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Basic Information</h2>
              
              <div className="mb-4">
                <label className="block text-muted mb-2">School Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="schoolName"
                    value={schoolData.schoolName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-bg"
                  />
                ) : (
                  <p className="text-xl font-semibold">{schoolData.schoolName}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">
                  Hero Text
                  {!schoolData.heroText && (
                    <span className="text-red-500 text-sm ml-2">⚠️ Required for landing page</span>
                  )}
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="heroText"
                    value={schoolData.heroText}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg bg-bg ${
                      !schoolData.heroText ? 'border-red-300' : 'border-muted'
                    }`}
                    placeholder="Enter your school's hero title"
                  />
                ) : (
                  <p className={`text-lg ${!schoolData.heroText ? 'text-gray-400 italic' : ''}`}>
                    {schoolData.heroText || 'No hero text set - this will show on your landing page'}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">Hero Subtitle</label>
                {editing ? (
                  <input
                    type="text"
                    name="heroSubtitle"
                    value={schoolData.heroSubtitle}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-bg"
                    placeholder="Enter hero subtitle"
                  />
                ) : (
                  <p className="text-lg">{schoolData.heroSubtitle || 'No subtitle set'}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">Hero Image</label>
                {editing ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      name="heroImage"
                      value={schoolData.heroImage || ''}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-muted rounded-lg bg-bg"
                      placeholder="Enter hero image URL"
                    />
                    <div className="text-center text-muted">OR</div>
                    <label className="block w-full p-3 border border-dashed border-muted rounded-lg bg-bg text-center cursor-pointer hover:bg-surface transition-colors">
                      <Upload size={16} className="inline mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Hero Image'}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleHeroImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="h-64 w-full relative rounded-lg overflow-hidden">
                    {schoolData.heroImage ? (
                      <NextImage 
                        src={schoolData.heroImage} 
                        alt="Hero" 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 100vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <p className="text-lg text-gray-400 italic">No hero image set</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">Banner Title</label>
                {editing ? (
                  <input
                    type="text"
                    name="bannerTitle"
                    value={schoolData.bannerTitle}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-bg"
                  />
                ) : (
                  <p className="text-lg">{schoolData.bannerTitle}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">Banner Image</label>
                {editing ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      name="bannerImage"
                      value={schoolData.bannerImage || ''}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-muted rounded-lg bg-bg"
                      placeholder="Enter banner image URL"
                    />
                    <div className="text-center text-muted">OR</div>
                    <label className="block w-full p-3 border border-dashed border-muted rounded-lg bg-bg text-center cursor-pointer hover:bg-surface transition-colors">
                      <Upload size={16} className="inline mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Banner Image'}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleBannerImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="h-64 w-full relative rounded-lg overflow-hidden">
                    {schoolData.bannerImage ? (
                      <NextImage 
                        src={schoolData.bannerImage} 
                        alt="Banner" 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 100vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <p className="text-lg text-gray-400 italic">No banner image set</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">Banner Stats</label>
                {editing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {schoolData.bannerStats.map((stat, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-surface rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{stat.icon}</span>
                            <span>{stat.text}</span>
                          </div>
                          <button 
                            onClick={() => removeBannerStat(index)}
                            className="text-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBannerStat.icon}
                        onChange={(e) => setNewBannerStat(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="Icon (e.g., FaBookReader)"
                        className="flex-1 p-2 border border-muted rounded-lg bg-bg text-sm"
                      />
                      <input
                        type="text"
                        value={newBannerStat.text}
                        onChange={(e) => setNewBannerStat(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Text (e.g., 50+ Courses)"
                        className="flex-1 p-2 border border-muted rounded-lg bg-bg text-sm"
                      />
                      <button 
                        onClick={addBannerStat}
                        className="bg-primary text-text px-3 rounded-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schoolData.bannerStats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-surface rounded-lg">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{stat.icon}</span>
                        <span>{stat.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">About Title</label>
                {editing ? (
                  <input
                    type="text"
                    name="aboutTitle"
                    value={schoolData.aboutTitle}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-bg"
                  />
                ) : (
                  <p className="text-lg">{schoolData.aboutTitle}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">About Description</label>
                {editing ? (
                  <textarea
                    name="aboutDescription"
                    value={schoolData.aboutDescription}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-bg h-32"
                    placeholder="Enter about description"
                  />
                ) : (
                  <p className="text-lg">{schoolData.aboutDescription}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">About Image</label>
                {editing ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      name="aboutImage"
                      value={schoolData.aboutImage || ''}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-muted rounded-lg bg-bg"
                      placeholder="Enter about image URL"
                    />
                    <div className="text-center text-muted">OR</div>
                    <label className="block w-full p-3 border border-dashed border-muted rounded-lg bg-bg text-center cursor-pointer hover:bg-surface transition-colors">
                      <Upload size={16} className="inline mr-2" />
                      {uploading ? 'Uploading...' : 'Upload About Image'}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleAboutImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="h-64 w-full relative rounded-lg overflow-hidden">
                    {schoolData.aboutImage ? (
                      <NextImage 
                        src={schoolData.aboutImage} 
                        alt="About" 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 100vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <p className="text-lg text-gray-400 italic">No about image set</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">Total Students</label>
                {editing ? (
                  <input
                    type="number"
                    name="studentCount"
                    value={schoolData.studentCount}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-bg"
                  />
                ) : (
                  <div className="flex items-center">
                    <Users size={20} className="text-primary mr-2" />
                    <p>{schoolData.studentCount.toLocaleString()} students</p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-2">Number of Subjects</label>
                {editing ? (
                  <input
                    type="number"
                    name="subjectCount"
                    value={schoolData.subjectCount}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-bg"
                  />
                ) : (
                  <div className="flex items-center">
                    <BookOpen size={20} className="text-primary mr-2" />
                    <p>{schoolData.subjectCount} subjects</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Classes */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Classes Offered</h2>
            <div className="bg-bg rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {schoolData.classes.map((cls, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-surface rounded-lg">
                    <span>{cls}</span>
                    {editing && (
                      <button 
                        onClick={() => removeClass(index)}
                        className="text-danger"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {editing && (
                <div className="flex mt-4">
                  <input
                    type="text"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="Add new class"
                    className="flex-grow p-3 border border-muted rounded-l-lg bg-bg"
                  />
                  <button 
                    onClick={addClass}
                    className="bg-primary text-text px-4 rounded-r-lg"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Level Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">School Levels</h2>
            <div className="bg-bg rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-muted mb-2">Select School Levels</label>
                {editing ? (
                  <div className="flex flex-wrap gap-4">
                    {[
                      { value: 'jss1-3', label: 'JSS1 - JSS3' },
                      { value: 'ss1-3', label: 'SS1 - SS3' },
                      { value: 'jss1-ss3', label: 'JSS1 - SS3' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="levelSelection"
                          value={option.value}
                          checked={schoolData.levelSelection === option.value}
                          onChange={(e) => setSchoolData(prev => ({ ...prev, levelSelection: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-text">{option.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="text-lg">
                      {schoolData.levelSelection === 'jss1-3' && 'JSS1 - JSS3'}
                      {schoolData.levelSelection === 'ss1-3' && 'SS1 - SS3'}
                      {schoolData.levelSelection === 'jss1-ss3' && 'JSS1 - SS3'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Soft Skills Management */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Soft Skills</h2>
            <div className="bg-bg rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {schoolData.softSkills.map((skill, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-surface rounded-lg">
                    <span>{skill}</span>
                    {editing && (
                      <button 
                        onClick={() => removeSoftSkill(index)}
                        className="text-danger"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {editing && (
                <div className="flex mt-4">
                  <input
                    type="text"
                    value={newSoftSkill}
                    onChange={(e) => setNewSoftSkill(e.target.value)}
                    placeholder="Add new soft skill (e.g., Carpentry, Coding)"
                    className="flex-grow p-3 border border-muted rounded-l-lg bg-surface"
                  />
                  <button 
                    onClick={addSoftSkill}
                    className="bg-primary text-text px-4 rounded-r-lg"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Subscription Plan</h2>
            
            {/* Current Plan */}
            <div className="bg-gradient-to-r from-primary to-primary-400 rounded-xl p-6  mb-6">
              <div className="flex items-center justify-between flex-wrap">
                <div>
                  <div className="flex items-center mb-2">
                    {subscription.plan === 'Free' ? (
                      <Award size={24} className="mr-2" />
                    ) : subscription.plan === 'Premium' ? (
                      <Crown size={24} className="mr-2" />
                    ) : (
                      <Zap size={24} className="mr-2" />
                    )}
                    <h3 className="text-2xl font-bold">{subscription.plan} Plan</h3>
                    {subscription.plan !== 'Free' && (
                      <span className="ml-4 bg-cta text-sm px-3 py-1 rounded-full">
                        ${subscription.price}/month
                      </span>
                    )}
                  </div>
                  <p className="flex items-center">
                    {subscription.status === 'active' ? (
                      <CheckCircle size={16} className="text-success mr-2" />
                    ) : (
                      <XCircle size={16} className="text-danger mr-2" />
                    )}
                    Status: {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </p>
                  {subscription.renewalDate !== 'N/A' && (
                    <p className="mt-2">Renewal date: {subscription.renewalDate}</p>
                  )}
                </div>
                
                <div className="flex space-x-4 mt-4 md:mt-0">
                  {subscription.plan === 'Free' ? (
                    <button 
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-cta  px-4 py-2 rounded-lg font-medium"
                    >
                      Upgrade Plan
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setShowUpgradeModal(true)}
                        className="bg-surface text-primary px-4 py-2 rounded-lg font-medium"
                      >
                        Change Plan
                      </button>
                      <button 
                        onClick={handleCancel}
                        className="bg-danger text-text px-4 py-2 rounded-lg font-medium"
                      >
                        Cancel Subscription
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white border-opacity-20">
                <h4 className="font-bold mb-2">Plan Features:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle size={18} className="text-success mr-2 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-bg rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">Payment Method</h3>
                {paymentMethod ? (
                  <button 
                    onClick={removePaymentMethod}
                    className="text-danger text-sm"
                  >
                    Remove
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowPaymentMethodForm(true)}
                    className="text-primary text-sm"
                  >
                    Add Payment Method
                  </button>
                )}
              </div>
              
              {paymentMethod ? (
                <div className="flex items-center p-4 bg-surface rounded-lg">
                  <CreditCard size={24} className="text-primary mr-4" />
                  <div>
                    <p className="font-medium">**** **** **** {paymentMethod.last4}</p>
                    <p className="text-muted">Expires {paymentMethod.expiry}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-surface rounded-lg text-center">
                  <CreditCard size={32} className="mx-auto text-muted mb-2" />
                  <p className="text-muted">No payment method added</p>
                  <button 
                    onClick={() => setShowPaymentMethodForm(true)}
                    className="text-primary mt-2"
                  >
                    Add a payment method
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Facilities Management */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">Facilities</h2>
              {editing && (
                <button
                  onClick={() => setShowFacilityModal(true)}
                  className="bg-primary text-text px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Facility
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {schoolData.facilities.map((facility, index) => (
                <div key={index} className="border border-muted rounded-xl overflow-hidden">
                  <div className="h-48 bg-bg flex items-center justify-center relative">
                    {facility.image ? (
                      <NextImage 
                        src={facility.image} 
                        alt={facility.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Building size={48} className="mx-auto text-muted mb-2" />
                        <p className="text-muted">No image</p>
                      </div>
                    )}
                    
                    {editing && (
                      <button
                        onClick={() => deleteFacility(index)}
                        className="absolute top-2 right-2 bg-danger text-text p-1 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-center">{facility.name}</p>
                    {facility.description && (
                      <p className="text-sm text-muted text-center mt-1">{facility.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Images Management */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">Campus Images</h2>
              {editing && (
                <button
                  onClick={() => setShowCampusModal(true)}
                  className="bg-primary text-text px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Campus Image
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {schoolData.campus.map((campus, index) => (
                <div key={index} className="border border-muted rounded-xl overflow-hidden">
                  <div className="h-48 bg-bg flex items-center justify-center relative">
                    {campus.image ? (
                      <NextImage 
                        src={campus.image} 
                        alt={campus.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon size={48} className="mx-auto text-muted mb-2" />
                        <p className="text-muted">No image</p>
                      </div>
                    )}
                    
                    {editing && (
                      <button
                        onClick={() => deleteCampus(index)}
                        className="absolute top-2 right-2 bg-danger text-text p-1 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-center">{campus.name}</p>
                    {campus.description && (
                      <p className="text-sm text-muted text-center mt-1">{campus.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-bg p-4 rounded-lg">
              <div>
                <label className="block text-muted mb-2">
                  <MapPin size={18} className="inline mr-2 text-primary" />
                  Address
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="contact.address"
                    value={schoolData.contact.address}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-surface"
                  />
                ) : (
                  <p>{schoolData.contact.address}</p>
                )}
              </div>
              
              <div>
                <label className="block text-muted mb-2">
                  <Phone size={18} className="inline mr-2 text-primary" />
                  Phone
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="contact.phone"
                    value={schoolData.contact.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-surface"
                  />
                ) : (
                  <p>{schoolData.contact.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-muted mb-2">
                  <Mail size={18} className="inline mr-2 text-primary" />
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="contact.email"
                    value={schoolData.contact.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-surface"
                  />
                ) : (
                  <p>{schoolData.contact.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg p-4 rounded-lg">
              <div>
                <label className="block text-muted mb-2">Facebook Link</label>
                {editing ? (
                  <input
                    type="url"
                    name="facebookUrl"
                    value={schoolData.facebookUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full p-3 border border-muted rounded-lg bg-surface"
                  />
                ) : (
                  <p>{schoolData.facebookUrl || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-muted mb-2">Twitter Link</label>
                {editing ? (
                  <input
                    type="url"
                    name="twitterUrl"
                    value={schoolData.twitterUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/yourpage"
                    className="w-full p-3 border border-muted rounded-lg bg-surface"
                  />
                ) : (
                  <p>{schoolData.twitterUrl || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-muted mb-2">Instagram Link</label>
                {editing ? (
                  <input
                    type="url"
                    name="instagramUrl"
                    value={schoolData.instagramUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourpage"
                    className="w-full p-3 border border-muted rounded-lg bg-surface"
                  />
                ) : (
                  <p>{schoolData.instagramUrl || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-muted mb-2">LinkedIn Link</label>
                {editing ? (
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={schoolData.linkedinUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourpage"
                    className="w-full p-3 border border-muted rounded-lg bg-surface"
                  />
                ) : (
                  <p>{schoolData.linkedinUrl || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* School Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">School Description</h2>
            {editing ? (
              <textarea
                name="description"
                value={schoolData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full p-4 border border-muted rounded-lg bg-bg"
              />
            ) : (
              <p className="bg-bg p-4 rounded-lg">{schoolData.description}</p>
            )}
          </div>
        </div>
    

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-muted">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">Upgrade Your Plan</h2>
                <button onClick={() => setShowUpgradeModal(false)} className="text-muted">
                  <XCircle size={24} />
                </button>
              </div>
              <p className="text-muted mt-2">Choose the plan that&apos;s right for your school</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`border rounded-xl p-6 ${plan.recommended ? 'border-primary ring-2 ring-primary ring-opacity-50 relative' : 'border-muted'}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-text text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="my-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted">/month</span>
                    </div>
                    <button 
                      onClick={() => handleUpgrade(plan.name, plan.price)}
                      className={`w-full py-2 rounded-lg font-medium ${
                        plan.name === 'Free' 
                          ? 'bg-muted text-text' 
                          : subscription.plan === plan.name
                            ? 'bg-success text-text'
                            : 'bg-primary text-text'
                      }`}
                      disabled={subscription.plan === plan.name}
                    >
                      {subscription.plan === plan.name ? 'Current Plan' : plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
                    </button>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <CheckCircle size={18} className="text-success mr-2 mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-muted bg-bg rounded-b-xl">
              <div className="flex items-center">
                <AlertCircle size={20} className="text-cta mr-2" />
                <p className="text-sm">
                  {subscription.hasPaymentMethod 
                    ? 'Your payment method will be charged immediately upon upgrade.' 
                    : 'You need to add a payment method before upgrading.'}
                </p>
              </div>
              
              {!subscription.hasPaymentMethod && (
                <button 
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setShowPaymentMethodForm(true);
                  }}
                  className="mt-4 bg-primary text-text px-4 py-2 rounded-lg"
                >
                  Add Payment Method
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Form Modal */}
      {showPaymentMethodForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-muted">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">Add Payment Method</h2>
                <button onClick={() => setShowPaymentMethodForm(false)} className="text-muted">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handlePaymentMethodSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-muted mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full p-3 border border-muted rounded-lg bg-bg"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-muted mb-2">Card Number</label>
                <div className="relative">
                  <input
                    type={showCardDetails ? "text" : "password"}
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-3 border border-muted rounded-lg bg-bg pr-10"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCardDetails(!showCardDetails)}
                    className="absolute right-3 top-3 text-muted"
                  >
                    {showCardDetails ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-muted mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                    placeholder="MM/YY"
                    className="w-full p-3 border border-muted rounded-lg bg-bg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-muted mb-2">CVC</label>
                  <input
                    type={showCardDetails ? "text" : "password"}
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                    placeholder="123"
                    className="w-full p-3 border border-muted rounded-lg bg-bg"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentMethodForm(false)}
                  className="flex-1 py-3 border border-muted rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-text py-3 rounded-lg font-medium"
                >
                  Save Payment Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {showFacilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-muted">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">Add Facility</h2>
                <button onClick={() => setShowFacilityModal(false)} className="text-muted">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-muted mb-2">Facility Name</label>
                <input
                  type="text"
                  value={newFacility.name}
                  onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
                  placeholder="e.g., Library, Laboratory"
                  className="w-full p-3 border border-muted rounded-lg bg-bg"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-muted mb-2">Description (Optional)</label>
                <textarea
                  value={newFacility.description}
                  onChange={(e) => setNewFacility({...newFacility, description: e.target.value})}
                  placeholder="Describe the facility..."
                  className="w-full p-3 border border-muted rounded-lg bg-bg"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-muted mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewFacility({...newFacility, imageFile: file, imageUrl: ''});
                    }
                  }}
                  className="w-full p-3 border border-muted rounded-lg bg-bg"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-muted mb-2">Or Image URL (Optional)</label>
                <input
                  type="url"
                  value={newFacility.imageUrl}
                  onChange={(e) => setNewFacility({...newFacility, imageUrl: e.target.value, imageFile: null})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border border-muted rounded-lg bg-bg"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowFacilityModal(false)}
                  className="flex-1 py-3 border border-muted rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addFacility}
                  disabled={uploading}
                  className="flex-1 bg-primary text-text py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Add Facility'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Campus Modal */}
      {showCampusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-muted">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">Add Campus Image</h2>
                <button onClick={() => setShowCampusModal(false)} className="text-muted">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-muted mb-2">Campus Title</label>
                <input
                  type="text"
                  value={newCampus.title}
                  onChange={(e) => setNewCampus({...newCampus, title: e.target.value})}
                  placeholder="e.g., Main Building, Playground"
                  className="w-full p-3 border border-muted rounded-lg bg-bg"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-muted mb-2">Description (Optional)</label>
                <textarea
                  value={newCampus.description}
                  onChange={(e) => setNewCampus({...newCampus, description: e.target.value})}
                  placeholder="Describe the campus area..."
                  className="w-full p-3 border border-muted rounded-lg bg-bg"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-muted mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewCampus({...newCampus, imageFile: file, imageUrl: ''});
                    }
                  }}
                  className="w-full p-3 border border-muted rounded-lg bg-bg"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-muted mb-2">Or Image URL (Optional)</label>
                <input
                  type="url"
                  value={newCampus.imageUrl}
                  onChange={(e) => setNewCampus({...newCampus, imageUrl: e.target.value, imageFile: null})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border border-muted rounded-lg bg-bg"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCampusModal(false)}
                  className="flex-1 py-3 border border-muted rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addCampus}
                  disabled={uploading}
                  className="flex-1 bg-primary text-text py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Add Campus Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolManagement;