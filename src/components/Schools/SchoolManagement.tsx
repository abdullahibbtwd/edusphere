"use client"
import React, { useState } from 'react';
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
  Star,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';

interface SchoolData {
  schoolName: string;
  heroText: string;
  schoolLogo: string | null;
  classes: string[];
  subjectCount: number;
  studentCount: number;
  facilities: { image: string; name: string }[];
  campus: { image: string; name: string }[];
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  description: string;
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

const SchoolManagement = () => {
  const [schoolData, setSchoolData] = useState<SchoolData>({
    schoolName: 'Example High School',
    heroText: 'Excellence in Education Since 1995',
    schoolLogo: null,
    classes: ['Science', 'Arts', 'Commerce'],
    subjectCount: 15,
    studentCount: 1250,
    facilities: [
      { image: '', name: 'Science Laboratory' },
      { image: '', name: 'Library' },
      { image: '', name: 'Sports Complex' }
    ],
    campus: [
      { image: '', name: 'Main Building' },
      { image: '', name: 'Playground' },
      { image: '', name: 'Auditorium' }
    ],
    contact: {
      address: '123 Education Street, Academic City',
      phone: '+1 (555) 123-4567',
      email: 'info@examplehigh.edu'
    },
    description: 'Our school is committed to providing a nurturing environment that fosters academic excellence, character development, and lifelong learning. We pride ourselves on our diverse curriculum and dedicated faculty.'
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
          ...prev[parent as keyof SchoolData],
          [child]: value
        }
      }));
    } else {
      setSchoolData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSchoolData(prev => ({ ...prev, schoolLogo: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFacilityImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedFacilities = [...schoolData.facilities];
        updatedFacilities[index].image = event.target?.result as string;
        setSchoolData(prev => ({ ...prev, facilities: updatedFacilities }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCampusImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedCampus = [...schoolData.campus];
        updatedCampus[index].image = event.target?.result as string;
        setSchoolData(prev => ({ ...prev, campus: updatedCampus }));
      };
      reader.readAsDataURL(file);
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

  const saveChanges = () => {
    console.log('Saving school data:', schoolData);
    setEditing(false);
    alert('Changes saved successfully!');
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

  return (
    <div className="min-h-screen bg-bg text-text font-poppins p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-surface rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-text">
          <h1 className="text-2xl md:text-3xl font-bold">School Management Dashboard</h1>
          <p className="mt-2">Manage your school's landing page content and subscription</p>
        </div>

        <div className="p-6">
          {/* Edit/Save Toggle */}
          <div className="flex justify-end mb-6">
            {editing ? (
              <button
                onClick={saveChanges}
                className="flex items-center bg-success text-text px-4 py-2 rounded-lg font-medium"
              >
                <Save size={18} className="mr-2" />
                Save Changes
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

          {/* School Logo and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold mb-4 text-primary">School Logo</h2>
              <div className="border-2 border-dashed border-muted rounded-xl h-64 flex items-center justify-center relative">
                {schoolData.schoolLogo ? (
                  <img 
                    src={schoolData.schoolLogo} 
                    alt="School Logo" 
                    className="max-h-60 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={48} className="mx-auto  mb-2" />
                    <p className="">No logo uploaded</p>
                  </div>
                )}
                
                {editing && (
                  <label className="absolute bottom-4 bg-primary text-text px-4 py-2 rounded-lg cursor-pointer">
                    <Upload size={16} className="inline mr-2" />
                    Upload Logo
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
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
                <label className="block text-muted mb-2">Hero Text</label>
                {editing ? (
                  <input
                    type="text"
                    name="heroText"
                    value={schoolData.heroText}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-muted rounded-lg bg-bg"
                  />
                ) : (
                  <p className="text-lg">{schoolData.heroText}</p>
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
                    <li key={index} className="flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      {feature}
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

          {/* Facilities */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Facilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {schoolData.facilities.map((facility, index) => (
                <div key={index} className="border border-muted rounded-xl overflow-hidden">
                  <div className="h-48 bg-bg flex items-center justify-center relative">
                    {facility.image ? (
                      <img 
                        src={facility.image} 
                        alt={facility.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Building size={48} className="mx-auto text-muted mb-2" />
                        <p className="text-muted">No image</p>
                      </div>
                    )}
                    
                    {editing && (
                      <label className="absolute bg-primary text-text px-3 py-1 rounded-lg cursor-pointer text-sm">
                        <Upload size={14} className="inline mr-1" />
                        Upload
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFacilityImageUpload(index, e)}
                          accept="image/*"
                        />
                      </label>
                    )}
                  </div>
                  <div className="p-4">
                    {editing ? (
                      <input
                        type="text"
                        value={facility.name}
                        onChange={(e) => {
                          const updatedFacilities = [...schoolData.facilities];
                          updatedFacilities[index].name = e.target.value;
                          setSchoolData(prev => ({ ...prev, facilities: updatedFacilities }));
                        }}
                        className="w-full p-2 border border-muted rounded-lg bg-bg"
                      />
                    ) : (
                      <p className="font-medium text-center">{facility.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Images */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Campus Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {schoolData.campus.map((campusItem, index) => (
                <div key={index} className="border border-muted rounded-xl overflow-hidden">
                  <div className="h-48 bg-bg flex items-center justify-center relative">
                    {campusItem.image ? (
                      <img 
                        src={campusItem.image} 
                        alt={campusItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon size={48} className="mx-auto text-muted mb-2" />
                        <p className="text-muted">No image</p>
                      </div>
                    )}
                    
                    {editing && (
                      <label className="absolute bg-primary text-text px-3 py-1 rounded-lg cursor-pointer text-sm">
                        <Upload size={14} className="inline mr-1" />
                        Upload
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleCampusImageUpload(index, e)}
                          accept="image/*"
                        />
                      </label>
                    )}
                  </div>
                  <div className="p-4">
                    {editing ? (
                      <input
                        type="text"
                        value={campusItem.name}
                        onChange={(e) => {
                          const updatedCampus = [...schoolData.campus];
                          updatedCampus[index].name = e.target.value;
                          setSchoolData(prev => ({ ...prev, campus: updatedCampus }));
                        }}
                        className="w-full p-2 border border-muted rounded-lg bg-bg"
                      />
                    ) : (
                      <p className="font-medium text-center">{campusItem.name}</p>
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
              <p className="text-muted mt-2">Choose the plan that's right for your school</p>
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
    </div>
  );
};

export default SchoolManagement;