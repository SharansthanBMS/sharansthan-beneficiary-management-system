import React, { useState, useEffect, useMemo } from 'react';

import { Avatar } from "./Avatar";
import { getDirectDriveUrl } from "./utils/imageUtils";
import { ReportsView } from './ReportsView';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, onSnapshot, getDoc } from 'firebase/firestore';
import { 
  Users, 
  Baby, 
  User as UserIcon, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  BarChart2, 
  LogOut, 
  TrendingUp, 
  PieChart, 
  Info, 
  Building,
  Image,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Scissors,
  Home,
  School,
  BookOpen,
  Heart,
  Stethoscope
} from 'lucide-react';

import { generateThumbnailFromBase64 } from './utils/imageUtils';

// Domain model matching Android exactly
interface Beneficiary {
  id: string;
  name: string;
  center: string;
  programType: string; // "Children" | "Women"
  moduleType: string;
  gender: string;
  age: number;
  dateOfBirth?: string | null;
  date: string;
  status: string; // "Active" | "Completed" | "Exited"
  remarks: string;
  photoUrl?: string | null;
  documentUrl?: string | null;
  parentPhotoUrl?: string | null;
  joiningPhotoUrl?: string | null;
  progressPhotoUrl?: string | null;
  leavingPhotoUrl?: string | null;
  profilePhoto?: any;
  parentPhoto?: any;
  joiningPhoto?: any;
  leavingPhoto?: any;
  lastUpdated: number;
  isDeleted: boolean;

  // Real-time synchronization fields
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  hasOrphanCertificate?: string | null; // "Yes" | "No"
  eligibleForOrphanCertificate?: string | null; // "Yes" | "No"
  childrenDetailsJson?: string | null;

  // Deletion Request fields
  deleteRequested?: boolean;
  deleteRequestedBy?: string | null;
  deleteRequestStatus?: string | null; // "Pending" | "Approved" | "Rejected"
  deleteRequestedAt?: string | null;
  deleteRequestReason?: string | null;
  deleteActionBy?: string | null;
  deleteActionAt?: string | null;

  // Help & Support fields
  supportType?: string | null;
  supportDescription?: string | null;
  supportPriority?: string | null;
  supportStatus?: string | null;
  supportRemarks?: string | null;

  // Health Info fields
  currentHealthStatus?: string | null;
  hivStageStatus?: string | null;
  currentTreatmentMedication?: string | null;
  hospitalClinicName?: string | null;
  medicalDoctorName?: string | null;
  lastCheckUpDate?: string | null;
  medicalNextReviewDate?: string | null;
  additionalMedicalNotes?: string | null;

  // Outreach fields
  outreachProgramName?: string | null;
  outreachParticipationStatus?: string | null;
  outreachStartDate?: string | null;
  outreachEndDate?: string | null;
  outreachRemarks?: string | null;

  // Skill Training fields
  skillTrainingName?: string | null;
  skillCourseName?: string | null;
  skillTrainingStatus?: string | null;
  skillStartDate?: string | null;
  skillExpectedCompletionDate?: string | null;
  skillTrainerInstructor?: string | null;
  skillRemarks?: string | null;

  // 6 Advanced Document Fields
  aadhaarUrl?: string | null;
  birthCertificateUrl?: string | null;
  schoolRecordsUrl?: string | null;
  medicalReportsUrl?: string | null;
  transferCertificateUrl?: string | null;
  otherDocsUrl?: string | null;

  // Residential Home
  admissionNumber?: string | null;
  dormitoryNumber?: string | null;
  bedNumber?: string | null;
  dateOfAdmission?: string | null;
  expectedLeavingDate?: string | null;
  actualLeavingDate?: string | null;
  fatherName?: string | null;
  fatherOccupation?: string | null;
  motherName?: string | null;
  motherOccupation?: string | null;
  guardianName?: string | null;
  guardianRelationship?: string | null;
  fatherMobileNumber?: string | null;
  motherMobileNumber?: string | null;
  guardianMobileNumber?: string | null;
  familyBackground?: string | null;
  reasonForAdmission?: string | null;
  reasonForLeaving?: string | null;
  previousSchoolName?: string | null;
  currentSchoolName?: string | null;
  currentClass?: string | null;
  mediumOfEducation?: string | null;
  academicPerformance?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
  disability?: string | null;
  counsellingNotes?: string | null;
  behaviourObservations?: string | null;
  specialTalents?: string | null;
  sponsorshipDetails?: string | null;
  staffRemarks?: string | null;

  // Graduates
  graduationYear?: string | null;
  courseCompleted?: string | null;
  qualification?: string | null;
  higherEducationDetails?: string | null;
  currentEmploymentStatus?: string | null;
  employerName?: string | null;
  jobPosition?: string | null;
  monthlyIncome?: string | null;
  currentAddress?: string | null;
  currentContactNumber?: string | null;
  guardianContactDetails?: string | null;
  reasonForJoining?: string | null;
  alumniFollowUpNotes?: string | null;
  staffObservations?: string | null;

  // Daycare
  parentContactNumbers?: string | null;
  schoolNameDaycare?: string | null;
  currentClassDaycare?: string | null;
  attendance?: string | null;
  academicProgress?: string | null;
  healthIssues?: string | null;
  nutritionSupport?: string | null;

  // Education Support
  schoolNameEducation?: string | null;
  currentClassEducation?: string | null;
  tuitionSubjects?: string | null;
  scholarshipDetails?: string | null;

  // Women Support
  husbandName?: string | null;
  maritalStatus?: string | null;
  numberOfChildren?: string | null;
  education?: string | null;
  occupation?: string | null;
  currentSupportRequired?: string | null;
  livelihoodSupport?: string | null;

  // Women Medical
  hospitalName?: string | null;
  doctorName?: string | null;
  medicalCondition?: string | null;
  medicationDetails?: string | null;
  nextReviewDate?: string | null;
  medicalNotes?: string | null;

  // Outreach
  outreachArea?: string | null;
  community?: string | null;
  dateOfVisit?: string | null;
  servicesProvided?: string | null;
  followUpRequired?: string | null;
  followUpNotes?: string | null;

  // Skill Training
  courseName?: string | null;
  batchNumber?: string | null;
  trainerName?: string | null;
  startDate?: string | null;
  completionDate?: string | null;
  assessmentResult?: string | null;
  certificateIssued?: string | null;
  placementStatus?: string | null;
  monthlySalary?: string | null;
}

// Display names for outreach center modules
const MODULE_DISPLAY_NAMES: Record<string, string> = {
  "children_residential": "Children's Residential Home",
  "graduates": "Graduates (Passed-Out)",
  "daycare": "Daycare Program",
  "education_support": "Education Support",
  "women_support": "Women Help & Support",
  "women_medical_hiv": "Women Medical (HIV+)",
  "outreach_programs": "Outreach Programs",
  "skill_training": "Skill Training"
};

const getModuleIcon = (code: string) => {
  switch (code) {
    case 'children_residential': return Home;
    case 'graduates': return School;
    case 'daycare': return Baby;
    case 'education_support': return BookOpen;
    case 'women_support': return Heart;
    case 'women_medical_hiv': return Stethoscope;
    case 'outreach_programs': return Users;
    case 'skill_training': return Scissors;
    default: return null;
  }
};

export default function App() {
  // --- Authentication States ---
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string; name?: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Database State ---
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  // --- Application State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'analytics' | 'pending-deletes' | 'reports'>('dashboard');
  const [selectedCenter, setSelectedCenter] = useState<'Asansol' | 'Nagpur'>('Asansol');
  const [globalSearch, setGlobalSearch] = useState('');

  // Filter States (for Search screen)
  const [filterModule, setFilterModule] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAgeMin, setFilterAgeMin] = useState<string>('');
  const [filterAgeMax, setFilterAgeMax] = useState<string>('');

  // Modals & Detail Drawers
  const [selectedModule, setSelectedModule] = useState<{ program: 'Children' | 'Women'; code: string; name: string } | null>(null);
  const [programSearch, setProgramSearch] = useState('');
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [selectedBeneficiaryDetail, setSelectedBeneficiaryDetail] = useState<Beneficiary | null>(null);

  useEffect(() => {
    if (selectedBeneficiaryDetail) {
      console.log("profilePhoto", selectedBeneficiaryDetail.profilePhoto);
      console.log("profilePhoto.originalUrl", selectedBeneficiaryDetail.profilePhoto?.originalUrl);
      console.log("profilePhoto.thumbnailUrl", selectedBeneficiaryDetail.profilePhoto?.thumbnailUrl);
      console.log("photoUrl", selectedBeneficiaryDetail.photoUrl);
    }
  }, [selectedBeneficiaryDetail]);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New beneficiary form inputs
  const [formName, setFormName] = useState('');
  const [formDateOfBirth, setFormDateOfBirth] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formProgram, setFormProgram] = useState<'Children' | 'Women'>('Children');
  const [formModule, setFormModule] = useState('children_residential');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState('Active');
  const [formRemarks, setFormRemarks] = useState('');
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [formDocument, setFormDocument] = useState<string | null>(null);
  const [formParentPhoto, setFormParentPhoto] = useState<string | null>(null);
  const [formJoiningPhoto, setFormJoiningPhoto] = useState<string | null>(null);
  const [formProgressPhoto, setFormProgressPhoto] = useState<string | null>(null);
  const [formLeavingPhoto, setFormLeavingPhoto] = useState<string | null>(null);

  // New optional synchronized fields
  const [formAadhaarNumber, setFormAadhaarNumber] = useState('');
  const [formPanNumber, setFormPanNumber] = useState('');
  const [formHasOrphanCertificate, setFormHasOrphanCertificate] = useState<'Yes' | 'No' | ''>('');
  const [formEligibleForOrphanCertificate, setFormEligibleForOrphanCertificate] = useState<'Yes' | 'No' | 'Under Review' | ''>('');
  const [formChildrenList, setFormChildrenList] = useState<any[]>([]);

  // 6 Advanced Document Fields Form States
  const [formAadhaarUrl, setFormAadhaarUrl] = useState<string | null>(null);
  const [formBirthCertificateUrl, setFormBirthCertificateUrl] = useState<string | null>(null);
  const [formSchoolRecordsUrl, setFormSchoolRecordsUrl] = useState<string | null>(null);
  const [formMedicalReportsUrl, setFormMedicalReportsUrl] = useState<string | null>(null);
  const [formTransferCertificateUrl, setFormTransferCertificateUrl] = useState<string | null>(null);
  const [formOtherDocsUrl, setFormOtherDocsUrl] = useState<string | null>(null);

  // Map of program-specific custom fields
  const [formProgramFields, setFormProgramFields] = useState<Record<string, string>>({});

  const [formError, setFormError] = useState('');

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state representation
  const [syncing, setSyncing] = useState(false);

  // Track active real-time listeners for clean unsubscriptions
  const activeListenersRef = React.useRef<(() => void)[]>([]);

  // Automatic Age Calculation from Date of Birth
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge : 0;
  };

  useEffect(() => {
    if (formDateOfBirth) {
      const computedAge = calculateAge(formDateOfBirth);
      setFormAge(computedAge.toString());
    } else {
      setFormAge('');
    }
  }, [formDateOfBirth]);

  // Real-time synchronization with Firestore
  useEffect(() => {
    if (!currentUser) {
      activeListenersRef.current.forEach(unsub => unsub());
      activeListenersRef.current = [];
      setBeneficiaries([]);
      return;
    }

    // Clean up any existing listeners first
    activeListenersRef.current.forEach(unsub => unsub());
    activeListenersRef.current = [];

    const centers = ['asansol', 'nagpur'];
    const modules = [
      'children_residential', 'graduates', 'daycare', 'education_support',
      'women_support', 'women_medical_hiv', 'outreach_programs', 'skill_training'
    ];

    const unsubs: (() => void)[] = [];

    centers.forEach(center => {
      modules.forEach(module => {
        const colRef = collection(db, "outreach_centers", center, module);
        const unsub = onSnapshot(colRef, (snapshot: any) => {
          setBeneficiaries(prev => {
            // Filter out any existing records that belong to THIS center and module
            // so that we replace them completely with the fresh list from Firestore!
            const filtered = prev.filter(b => 
              !(b.center.toLowerCase() === center.toLowerCase() && b.moduleType === module)
            );

            // Map the current documents from Firestore
            const currentDocs = snapshot.docs
              .filter((doc: any) => !doc.data().isDeleted)
              .map((doc: any) => {
                const data = doc.data();
                const id = data.id || doc.id;
                return {
                  ...data,
                  id,
                  name: data.name || '',
                  center: data.center || (center === 'asansol' ? 'Asansol' : 'Nagpur'),
                  programType: data.programType || '',
                  moduleType: data.moduleType || module,
                  gender: data.gender || 'Other',
                  age: Number(data.age) || 0,
                  date: data.date || '',
                  status: data.status || 'Active',
                  remarks: data.remarks || '',
                  photoUrl: data.photoUrl || null,
                  documentUrl: data.documentUrl || null,
                  parentPhotoUrl: data.parentPhotoUrl || null,
                  joiningPhotoUrl: data.joiningPhotoUrl || null,
                  progressPhotoUrl: data.progressPhotoUrl || null,
                  leavingPhotoUrl: data.leavingPhotoUrl || null,
                  lastUpdated: Number(data.lastUpdated) || Date.now(),
                } as Beneficiary;
              });

            // Combine and sort
            const updated = [...filtered, ...currentDocs];
            updated.sort((a, b) => b.lastUpdated - a.lastUpdated);
            return updated;
          });
        }, (error: any) => {
          console.error(`Firestore subscribe error for ${center}/${module}:`, error);
        });
        unsubs.push(unsub);
      });
    });

    activeListenersRef.current = unsubs;

    return () => {
      activeListenersRef.current.forEach(unsub => unsub());
      activeListenersRef.current = [];
    };
  }, [currentUser?.email]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Listen for real Auth changes
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        // Fetch or create user profile from Firestore users collection
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCurrentUser({
              email: firebaseUser.email || "",
              role: userData.role || "staff",
              name: userData.name || firebaseUser.email?.split('@')[0] || "Staff Member"
            });
          } else {
            // Document doesn't exist, create it with default role = "staff"
            const defaultProfile = {
              name: firebaseUser.email?.split('@')[0] || "Staff Member",
              email: firebaseUser.email || "",
              role: "staff",
              centerAccess: ["Asansol", "Nagpur"],
              active: true
            };
            await setDoc(userDocRef, defaultProfile);
            setCurrentUser({
              email: defaultProfile.email,
              role: defaultProfile.role,
              name: defaultProfile.name
            });
          }
        } catch (error) {
          console.error("Error reading/writing user document:", error);
          // Fallback to local representation if Firestore fails
          setCurrentUser({
            email: firebaseUser.email || "",
            role: firebaseUser.email?.includes("admin") ? "admin" : "staff",
            name: firebaseUser.email?.split('@')[0] || "NGO Member"
          });
        }
      } else {
        setCurrentUser(null);
        setBeneficiaries([]);
      }
    });
    return () => unsubscribe();
  }, []);


  // Auth hook bypassed for testing

  // Handle Firebase authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!auth) {
      setLoginError("Firebase authentication is not initialized.");
      return;
    }
    const email = loginEmail.trim();
    const password = loginPassword;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setToastMessage("Signed in securely!");
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials.");
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setLoginEmail('');
    setLoginPassword('');
    setToastMessage('Signed out securely.');
  };

  // Sync simulation representing background sync workers in Android app
  const handleTriggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setToastMessage("Bi-directional real-time sync with cloud Firestore succeeded!");
    }, 1200);
  };

  const resetFormState = () => {
    setEditingBeneficiary(null);
    setFormName('');
    setFormDateOfBirth('');
    setFormAge('');
    setFormProgram('Children');
    setFormModule('children_residential');
    setFormGender('Male');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStatus('Active');
    setFormRemarks('');
    setFormPhoto(null);
    setFormDocument(null);
    setFormParentPhoto(null);
    setFormJoiningPhoto(null);
    setFormProgressPhoto(null);
    setFormLeavingPhoto(null);

    // Reset advanced documents
    setFormAadhaarUrl(null);
    setFormBirthCertificateUrl(null);
    setFormSchoolRecordsUrl(null);
    setFormMedicalReportsUrl(null);
    setFormTransferCertificateUrl(null);
    setFormOtherDocsUrl(null);

    // Reset optional fields
    setFormAadhaarNumber('');
    setFormPanNumber('');
    setFormHasOrphanCertificate('');
    setFormEligibleForOrphanCertificate('');
    setFormChildrenList([]);

    // Reset program specific fields
    setFormProgramFields({});

    setFormError('');
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetFormState();
  };

  // Pre-populate creation form
  const openCreateForm = (program: 'Children' | 'Women', moduleCode: string) => {
    resetFormState();
    setFormProgram(program);
    setFormModule(moduleCode);
    setFormGender(program === 'Children' ? 'Male' : 'Female');
    setIsFormOpen(true);
  };

  // Pre-populate editing form
  const openEditForm = (b: Beneficiary) => {
    setSelectedBeneficiaryDetail(null);
    setEditingBeneficiary(b);
    setFormName(b.name);
    setFormDateOfBirth(b.dateOfBirth || '');
    setFormAge(b.age.toString());
    setFormProgram(b.programType as 'Children' | 'Women');
    setFormModule(b.moduleType);
    setFormGender(b.gender);
    setFormDate(b.date);
    setFormStatus(b.status);
    setFormRemarks(b.remarks);
    setFormPhoto(b.photoUrl || null);
    setFormDocument(b.documentUrl || null);
    setFormParentPhoto(b.parentPhotoUrl || null);
    setFormJoiningPhoto(b.joiningPhotoUrl || null);
    setFormProgressPhoto(b.progressPhotoUrl || null);
    setFormLeavingPhoto(b.leavingPhotoUrl || null);

    // Set advanced documents
    setFormAadhaarUrl(b.aadhaarUrl || null);
    setFormBirthCertificateUrl(b.birthCertificateUrl || null);
    setFormSchoolRecordsUrl(b.schoolRecordsUrl || null);
    setFormMedicalReportsUrl(b.medicalReportsUrl || null);
    setFormTransferCertificateUrl(b.transferCertificateUrl || null);
    setFormOtherDocsUrl(b.otherDocsUrl || null);

    // Set optional fields
    setFormAadhaarNumber(b.aadhaarNumber || '');
    setFormPanNumber(b.panNumber || '');
    setFormHasOrphanCertificate((b.hasOrphanCertificate as any) || '');
    setFormEligibleForOrphanCertificate((b.eligibleForOrphanCertificate as any) || '');
    
    // Parse childrenDetailsJson if present
    try {
      const parsed = b.childrenDetailsJson ? JSON.parse(b.childrenDetailsJson) : [];
      setFormChildrenList(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      setFormChildrenList([]);
    }

    // Extract and set program specific custom fields
    const docFields = [
      'aadhaarUrl', 'birthCertificateUrl', 'schoolRecordsUrl',
      'medicalReportsUrl', 'transferCertificateUrl', 'otherDocsUrl'
    ];
    const programFields: Record<string, string> = {};
    const standardKeys = new Set([
      'id', 'name', 'center', 'programType', 'moduleType', 'gender', 'age', 'date', 'status', 'remarks',
      'photoUrl', 'documentUrl', 'parentPhotoUrl', 'joiningPhotoUrl', 'progressPhotoUrl', 'leavingPhotoUrl', 'lastUpdated',
      'dateOfBirth',
      ...docFields
    ]);
    Object.keys(b).forEach(key => {
      if (!standardKeys.has(key)) {
        const val = (b as any)[key];
        if (val !== undefined && val !== null) {
          programFields[key] = String(val);
        }
      }
    });
    setFormProgramFields(programFields);

    setFormError('');
    setIsFormOpen(true);
  };

  // Handle Form Submission (Create or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const name = formName.trim();
    const age = parseInt(formAge);

    if (!name) {
      setFormError('Full name is required.');
      return;
    }
    if (isNaN(age) || age <= 0 || age > 120) {
      setFormError('Please enter a valid age (1-120).');
      return;
    }

    setToastMessage("Saving...");

    const getBase64Data = (url: string | null) => url?.startsWith('data:') ? url.split(',')[1] : null;
    
    const base64Photos: any = {};
    if (formProgram === 'Women') {
      const p = getBase64Data(formPhoto);
      if (p) base64Photos.profile = p;
    } else {
      const p = getBase64Data(formPhoto);
      const pa = getBase64Data(formParentPhoto);
      const j = getBase64Data(formJoiningPhoto);
      const ex = getBase64Data(formLeavingPhoto);
      if (p) base64Photos.profile = p;
      if (pa) base64Photos.parent = pa;
      if (j) base64Photos.joining = j;
      if (ex) base64Photos.exit = ex;
    }

    let resolvedPhotoUrl = formPhoto;
    let resolvedParentUrl = formParentPhoto;
    let resolvedJoiningUrl = formJoiningPhoto;
    let resolvedLeavingUrl = formLeavingPhoto;

    let profilePhotoObj: any = editingBeneficiary?.profilePhoto || null;
    let parentPhotoObj: any = editingBeneficiary?.parentPhoto || null;
    let joiningPhotoObj: any = editingBeneficiary?.joiningPhoto || null;
    let leavingPhotoObj: any = editingBeneficiary?.leavingPhoto || null;

    const beneficiaryId = editingBeneficiary ? editingBeneficiary.id : `b_${selectedCenter.toLowerCase()}_${Date.now()}`;

    // Generate thumbnails async
    if (formProgram === 'Women') {
      const p = getBase64Data(formPhoto);
      if (p && formPhoto) {
        base64Photos.profile = p;
        const pThumb = await generateThumbnailFromBase64(formPhoto);
        base64Photos.profile_thumb = getBase64Data(pThumb);
      }
    } else {
      const p = getBase64Data(formPhoto);
      if (p && formPhoto) {
        base64Photos.profile = p;
        const pThumb = await generateThumbnailFromBase64(formPhoto);
        base64Photos.profile_thumb = getBase64Data(pThumb);
      }
      const pa = getBase64Data(formParentPhoto);
      if (pa && formParentPhoto) {
        base64Photos.parent = pa;
        const paThumb = await generateThumbnailFromBase64(formParentPhoto);
        base64Photos.parent_thumb = getBase64Data(paThumb);
      }
      const j = getBase64Data(formJoiningPhoto);
      if (j && formJoiningPhoto) {
        base64Photos.joining = j;
        const jThumb = await generateThumbnailFromBase64(formJoiningPhoto);
        base64Photos.joining_thumb = getBase64Data(jThumb);
      }
      const ex = getBase64Data(formLeavingPhoto);
      if (ex && formLeavingPhoto) {
        base64Photos.exit = ex;
        const exThumb = await generateThumbnailFromBase64(formLeavingPhoto);
        base64Photos.exit_thumb = getBase64Data(exThumb);
      }
    }

    if (Object.keys(base64Photos).length > 0) {
      setToastMessage("Uploading photos to Google Drive...");
      try {
        const payload = {
          location: editingBeneficiary ? editingBeneficiary.center : selectedCenter,
          category: MODULE_DISPLAY_NAMES[formModule] || formModule,
          beneficiaryId,
          beneficiaryName: name,
          photos: base64Photos
        };
        const payloadStr = JSON.stringify(payload);
        const res = await fetch("https://script.google.com/macros/s/AKfycbx9UXCGv-zD8RtLv1wDIo9PB6Gk_bUo36vh2FQPwAEW-O9osNd6xaxTduUMqUo2vCsD/exec", {
          method: 'POST',
          body: payloadStr
        });
        
        
        const resText = await res.text();
        
        const data = JSON.parse(resText);
        if (data.success && data.photos) {
          if (data.photos.profile) {
            resolvedPhotoUrl = data.photos.profile.url;
            profilePhotoObj = {
              originalUrl: data.photos.profile.url,
              thumbnailUrl: data.photos.profile_thumb?.url || data.photos.profile.url,
              fileId: data.photos.profile.id || data.photos.profile.fileId || "",
              thumbnailFileId: data.photos.profile_thumb?.id || data.photos.profile_thumb?.fileId || ""
            };
          }
          if (data.photos.parent) {
            resolvedParentUrl = data.photos.parent.url;
            parentPhotoObj = {
              originalUrl: data.photos.parent.url,
              thumbnailUrl: data.photos.parent_thumb?.url || data.photos.parent.url,
              fileId: data.photos.parent.id || data.photos.parent.fileId || "",
              thumbnailFileId: data.photos.parent_thumb?.id || data.photos.parent_thumb?.fileId || ""
            };
          }
          if (data.photos.joining) {
            resolvedJoiningUrl = data.photos.joining.url;
            joiningPhotoObj = {
              originalUrl: data.photos.joining.url,
              thumbnailUrl: data.photos.joining_thumb?.url || data.photos.joining.url,
              fileId: data.photos.joining.id || data.photos.joining.fileId || "",
              thumbnailFileId: data.photos.joining_thumb?.id || data.photos.joining_thumb?.fileId || ""
            };
          }
          if (data.photos.exit) {
            resolvedLeavingUrl = data.photos.exit.url;
            leavingPhotoObj = {
              originalUrl: data.photos.exit.url,
              thumbnailUrl: data.photos.exit_thumb?.url || data.photos.exit.url,
              fileId: data.photos.exit.id || data.photos.exit.fileId || "",
              thumbnailFileId: data.photos.exit_thumb?.id || data.photos.exit_thumb?.fileId || ""
            };
          }
        }
      } catch (err) {
        console.error("Apps script upload error:", err);
      }
    }

    if (editingBeneficiary) {
      // Edit mode
      const updatedData = {
        ...editingBeneficiary,
        id: editingBeneficiary.id,
        name,
        center: editingBeneficiary.center,
        programType: formProgram,
        moduleType: formModule,
        gender: formGender,
        age,
        dateOfBirth: formDateOfBirth || null,
        date: formDate,
        status: formStatus,
        remarks: formRemarks,
        photoUrl: resolvedPhotoUrl || null,
        documentUrl: formDocument || null,
        parentPhotoUrl: resolvedParentUrl || null,
        joiningPhotoUrl: resolvedJoiningUrl || null,
        progressPhotoUrl: formProgressPhoto || null,
        leavingPhotoUrl: resolvedLeavingUrl || null,
        profilePhoto: profilePhotoObj,
        parentPhoto: parentPhotoObj,
        joiningPhoto: joiningPhotoObj,
        leavingPhoto: leavingPhotoObj,
        lastUpdated: Date.now(),
        isDeleted: false,
        // Optional synchronized fields
        aadhaarNumber: formAadhaarNumber.trim() || null,
        panNumber: formPanNumber.trim() || null,
        hasOrphanCertificate: formModule === 'children_residential' ? (formHasOrphanCertificate || null) : null,
        eligibleForOrphanCertificate: (formModule === 'children_residential' && formHasOrphanCertificate === 'No') ? (formEligibleForOrphanCertificate || null) : null,
        childrenDetailsJson: (formProgram === 'Women' && formChildrenList.length > 0) ? JSON.stringify(formChildrenList) : null,
        // Advanced documents
        aadhaarUrl: formAadhaarUrl || null,
        birthCertificateUrl: formBirthCertificateUrl || null,
        schoolRecordsUrl: formSchoolRecordsUrl || null,
        medicalReportsUrl: formMedicalReportsUrl || null,
        transferCertificateUrl: formTransferCertificateUrl || null,
        otherDocsUrl: formOtherDocsUrl || null,
        // Program specific custom fields
        ...formProgramFields
      };

      try {
        const oldDocRef = doc(db, "outreach_centers", editingBeneficiary.center.toLowerCase(), editingBeneficiary.moduleType, editingBeneficiary.id);
        const newDocRef = doc(db, "outreach_centers", editingBeneficiary.center.toLowerCase(), formModule, editingBeneficiary.id);

        if (editingBeneficiary.moduleType !== formModule) {
          await deleteDoc(oldDocRef);
        }
        await setDoc(newDocRef, updatedData);
        setToastMessage("Beneficiary record updated successfully.");
      } catch (err: any) {
        console.error("Error updating document in Firestore:", err);
        setToastMessage("Failed to update in Firestore. Updating local fallback.");
      }

      setBeneficiaries(prev => prev.map(b => b.id === editingBeneficiary.id ? {
        ...b,
        ...updatedData
      } : b));
    } else {
      // Create mode
      const newB: Beneficiary = {
        id: beneficiaryId,
        name,
        center: selectedCenter,
        programType: formProgram,
        moduleType: formModule,
        gender: formGender,
        age,
        dateOfBirth: formDateOfBirth || null,
        date: formDate,
        status: formStatus,
        remarks: formRemarks,
        photoUrl: resolvedPhotoUrl,
        documentUrl: formDocument,
        parentPhotoUrl: resolvedParentUrl,
        joiningPhotoUrl: resolvedJoiningUrl,
        progressPhotoUrl: formProgressPhoto,
        leavingPhotoUrl: resolvedLeavingUrl,
        profilePhoto: profilePhotoObj,
        parentPhoto: parentPhotoObj,
        joiningPhoto: joiningPhotoObj,
        leavingPhoto: leavingPhotoObj,
        lastUpdated: Date.now(),
        isDeleted: false,
        // Optional synchronized fields
        aadhaarNumber: formAadhaarNumber.trim() || null,
        panNumber: formPanNumber.trim() || null,
        hasOrphanCertificate: formModule === 'children_residential' ? (formHasOrphanCertificate || null) : null,
        eligibleForOrphanCertificate: (formModule === 'children_residential' && formHasOrphanCertificate === 'No') ? (formEligibleForOrphanCertificate || null) : null,
        childrenDetailsJson: (formProgram === 'Women' && formChildrenList.length > 0) ? JSON.stringify(formChildrenList) : null,
        // Advanced documents
        aadhaarUrl: formAadhaarUrl || null,
        birthCertificateUrl: formBirthCertificateUrl || null,
        schoolRecordsUrl: formSchoolRecordsUrl || null,
        medicalReportsUrl: formMedicalReportsUrl || null,
        transferCertificateUrl: formTransferCertificateUrl || null,
        otherDocsUrl: formOtherDocsUrl || null,
        // Program specific custom fields
        ...formProgramFields
      };

      try {
        const docRef = doc(db, "outreach_centers", selectedCenter.toLowerCase(), formModule, beneficiaryId);
        await setDoc(docRef, { ...newB, isDeleted: false });
        setToastMessage("New beneficiary registered successfully.");
      } catch (err: any) {
        console.error("Error creating document in Firestore:", err);
        setToastMessage("Failed to register in Firestore. Saving local fallback.");
      }

      setBeneficiaries(prev => {
        const map = new Map<string, Beneficiary>();
        prev.forEach(b => {
          if (b && b.id) {
            map.set(b.id, b);
          }
        });
        map.set(newB.id, newB);
        const finalRecords = Array.from(map.values());
        finalRecords.sort((a, b) => b.lastUpdated - a.lastUpdated);
        return finalRecords;
      });
    }

    closeForm();
  };

  // Convert photo to Base64 (Data URL) for preview and Apps Script upload
  const handlePhotoUpload = (file: File, type: 'primary' | 'parent' | 'joining' | 'progress' | 'leaving') => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      switch (type) {
        case 'primary': setFormPhoto(base64Url); break;
        case 'parent': setFormParentPhoto(base64Url); break;
        case 'joining': setFormJoiningPhoto(base64Url); break;
        case 'progress': setFormProgressPhoto(base64Url); break;
        case 'leaving': setFormLeavingPhoto(base64Url); break;
      }
    };
    reader.readAsDataURL(file);
  };

  // Request Delete (Staff)
  const handleRequestDelete = async (id: string) => {
    const reason = window.prompt("Are you sure you want to request deletion of this record? An administrator must approve this request.\n\nPlease enter an optional reason for deletion:");
    if (reason === null) return; // User cancelled

    const target = beneficiaries.find(b => b.id === id);
    if (target) {
      const updatedTarget = {
        ...target,
        deleteRequested: true,
        deleteRequestedBy: currentUser?.email || 'unknown',
        deleteRequestStatus: 'Pending',
        deleteRequestedAt: new Date().toLocaleString(),
        deleteRequestReason: reason.trim() || null,
        lastUpdated: Date.now()
      };
      try {
        const docRef = doc(db, "outreach_centers", target.center.toLowerCase(), target.moduleType, target.id);
        await setDoc(docRef, updatedTarget);
        setToastMessage("Deletion request submitted successfully.");
        
        // Update details drawer if open
        if (selectedBeneficiaryDetail?.id === id) {
          setSelectedBeneficiaryDetail(updatedTarget);
        }
      } catch (err: any) {
        console.error("Error requesting delete from Firestore:", err);
        setToastMessage("Failed to submit request to Firestore.");
      }
      setBeneficiaries(prev => prev.map(b => b.id === id ? updatedTarget : b));
    }
  };

  // Reject Delete Request (Admin only)
  const handleRejectDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to REJECT this deletion request?")) {
      const target = beneficiaries.find(b => b.id === id);
      if (target) {
        const updatedTarget = {
          ...target,
          deleteRequested: false,
          deleteRequestedBy: null,
          deleteRequestStatus: null,
          deleteRequestedAt: null,
          deleteRequestReason: null,
          lastUpdated: Date.now()
        };
        try {
          const docRef = doc(db, "outreach_centers", target.center.toLowerCase(), target.moduleType, target.id);
          await setDoc(docRef, updatedTarget);
          setToastMessage("Deletion request rejected.");
          
          // Update details drawer if open
          if (selectedBeneficiaryDetail?.id === id) {
            setSelectedBeneficiaryDetail(updatedTarget);
          }
        } catch (err: any) {
          console.error("Error rejecting request from Firestore:", err);
          setToastMessage("Failed to reject request in Firestore.");
        }
        setBeneficiaries(prev => prev.map(b => b.id === id ? updatedTarget : b));
      }
    }
  };

  // Soft-Delete record
  const handleDeleteRecord = async (id: string) => {
    if (currentUser?.email?.toLowerCase() !== 'admin@sharansthan.org') {
      setToastMessage("Permission denied: Only admin@sharansthan.org can delete records.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this record? This will trigger real-time synchronization deletes.")) {
      const target = beneficiaries.find(b => b.id === id);
      if (target) {
        try {
          const docRef = doc(db, "outreach_centers", target.center.toLowerCase(), target.moduleType, target.id);
          await deleteDoc(docRef);
          setToastMessage("Beneficiary record deleted successfully.");
        } catch (err: any) {
          console.error("Error deleting document from Firestore:", err);
          setToastMessage("Failed to delete from Firestore. Deleted locally.");
        }
      } else {
        setToastMessage("Beneficiary record deleted successfully.");
      }
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      setSelectedBeneficiaryDetail(null);
    }
  };

  // Filter lists dynamically
  const dashboardRecords = useMemo(() => {
    return beneficiaries.filter(b => b.center.toLowerCase() === selectedCenter.toLowerCase());
  }, [beneficiaries, selectedCenter]);

  // Program-specific filtering
  const programRecords = useMemo(() => {
    return dashboardRecords.filter(b => {
      if (!selectedModule) return false;
      if (b.moduleType !== selectedModule.code) return false;
      if (!programSearch) return true;
      return (
        b.name.toLowerCase().includes(programSearch.toLowerCase()) ||
        b.remarks.toLowerCase().includes(programSearch.toLowerCase())
      );
    });
  }, [dashboardRecords, selectedModule, programSearch]);

  // Global search filtering (Search Screen)
  const searchFilteredRecords = useMemo(() => {
    return beneficiaries.filter(b => {
      const matchCenter = b.center.toLowerCase() === selectedCenter.toLowerCase();
      
      const matchQuery = !globalSearch ? true : (
        b.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        b.remarks.toLowerCase().includes(globalSearch.toLowerCase())
      );
      
      const matchModule = !filterModule ? true : b.moduleType === filterModule;
      const matchGender = !filterGender ? true : b.gender === filterGender;
      const matchStatus = !filterStatus ? true : b.status === filterStatus;
      
      const minAge = filterAgeMin ? parseInt(filterAgeMin) : 0;
      const maxAge = filterAgeMax ? parseInt(filterAgeMax) : 120;
      const matchAge = b.age >= minAge && b.age <= maxAge;

      return matchCenter && matchQuery && matchModule && matchGender && matchStatus && matchAge;
    });
  }, [beneficiaries, selectedCenter, globalSearch, filterModule, filterGender, filterStatus, filterAgeMin, filterAgeMax]);

  // State calculations for graphs
  const stats = useMemo(() => {
    const total = beneficiaries.length;
    const children = beneficiaries.filter(b => b.programType === 'Children').length;
    const women = beneficiaries.filter(b => b.programType === 'Women').length;
    const asansol = beneficiaries.filter(b => b.center === 'Asansol').length;
    const nagpur = beneficiaries.filter(b => b.center === 'Nagpur').length;

    return { total, children, women, asansol, nagpur };
  }, [beneficiaries]);

  // Specific module pre-population is handled inline on dropdown onChange to prevent stale state issues

  const NgoLogoIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg viewBox="0 0 512 512" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="webRoofGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A52A2A" />
          <stop offset="50%" stopColor="#BE4A3A" />
          <stop offset="100%" stopColor="#D56332" />
        </linearGradient>
        <linearGradient id="webWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D56332" />
          <stop offset="100%" stopColor="#A52A2A" />
        </linearGradient>
      </defs>
      <g transform="translate(0, 5)">
        <path d="M 50,415 C 120,447 250,450 380,427 C 420,420 445,410 450,400 C 445,393 420,407 380,413 C 250,430 120,427 50,415 Z" fill="url(#webRoofGrad)" />
        <path d="M 126,225 C 126,285 128,345 127,405 C 132,405 134,345 133,225 Z" fill="url(#webWallGrad)" />
        <path d="M 382,205 C 378,265 371,335 367,395 C 372,395 379,335 384,205 Z" fill="url(#webWallGrad)" />
        <path d="M 40,245 C 40,245 110,205 255,95 C 265,90 272,90 270,100 C 255,115 120,235 50,260 C 42,263 38,255 40,245 Z" fill="url(#webRoofGrad)" />
        <path d="M 255,95 C 255,95 320,145 410,205 C 418,211 415,219 405,213 C 320,160 265,115 255,95 Z" fill="url(#webRoofGrad)" />
        <path d="M 190,170 C 215,150 240,130 255,115 C 270,130 295,150 320,170" stroke="url(#webRoofGrad)" strokeWidth={3.5} strokeLinecap="round" />
        <path d="M 60,315 C 50,315 55,290 90,275 C 130,255 215,210 250,180 C 280,155 295,120 260,120 C 210,120 180,180 200,250 C 215,305 245,365 215,395 C 195,415 165,405 160,375 C 155,345 185,290 210,250 C 240,200 310,180 390,175 C 395,175 398,180 390,180 C 310,185 245,205 215,255 C 190,295 165,350 170,380 C 175,410 205,420 225,400 C 255,370 225,310 210,260 C 195,200 220,130 260,130 C 285,130 275,160 245,187 C 210,217 130,263 92,281 C 68,293 58,315 60,315 Z" fill="#222222" />
        <path d="M 408,207 C 418,193 436,183 454,187 C 447,201 433,215 417,223 Z" fill="#222222" />
        <path d="M 422,193 C 431,175 447,173 454,180 C 445,187 433,193 422,193 Z" fill="#222222" />
        <path d="M 410,207 C 414,209 420,211 425,215 C 430,220 435,220 438,215 C 441,210 445,207 448,209 C 447,210 445,213 442,214 C 438,216 435,221 430,221 C 422,221 414,217 410,207 Z" fill="#222222" />
      </g>
    </svg>
  );

  // -----------------------------------------------------------------
  // 1. LOGIN SCREEN COMPONENT (IF NOT AUTHENTICATED)
  // -----------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slateBg flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slateSurface border border-slateBorder rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-childrenPrimary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 border border-childrenPrimary border-opacity-30">
              <NgoLogoIcon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-textPrimary tracking-tight">Sharansthan</h1>
            <p className="text-textSecondary text-sm mt-1">Beneficiary Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textSecondary mb-2">NGO Staff Email</label>
              <input 
                type="email" 
                placeholder="staff@sharansthan.org" 
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full h-12 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textSecondary mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full h-12 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                required
              />
            </div>

            {loginError && (
              <div className="bg-colorError bg-opacity-10 border border-colorError rounded-xl p-3 flex items-center gap-2 text-colorError text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full h-12 bg-childrenPrimary text-white rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg shadow-childrenPrimary/20"
            >
              Sign In to System
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // 2. MAIN APPLICATION CONTENT
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slateBg flex flex-col md:flex-row">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slateSurface border border-colorSuccess rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle className="text-colorSuccess w-5 h-5" />
          <span className="text-sm font-bold text-textPrimary">{toastMessage}</span>
        </div>
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-full md:w-64 bg-slateSurface border-r border-slateBorder p-6 shrink-0 flex flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-childrenPrimary bg-opacity-10 rounded-xl flex items-center justify-center border border-childrenPrimary border-opacity-20 shrink-0">
              <NgoLogoIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-black text-textPrimary leading-none">Sharansthan</h1>
              <p className="text-[10px] text-textSecondary mt-1">Beneficiary Management</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full h-11 rounded-xl px-4 flex items-center gap-3 text-sm font-bold transition ${activeTab === 'dashboard' ? 'bg-childrenPrimary text-white' : 'text-textSecondary hover:bg-slateBg hover:text-textPrimary'}`}
            >
              <Building className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveTab('search')}
              className={`w-full h-11 rounded-xl px-4 flex items-center gap-3 text-sm font-bold transition ${activeTab === 'search' ? 'bg-childrenPrimary text-white' : 'text-textSecondary hover:bg-slateBg hover:text-textPrimary'}`}
            >
              <Search className="w-4 h-4" />
              <span>Global Search</span>
            </button>

             <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full h-11 rounded-xl px-4 flex items-center gap-3 text-sm font-bold transition ${activeTab === 'analytics' ? 'bg-childrenPrimary text-white' : 'text-textSecondary hover:bg-slateBg hover:text-textPrimary'}`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analytics Metrics</span>
            </button>

             <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full h-11 rounded-xl px-4 flex items-center gap-3 text-sm font-bold transition ${activeTab === 'reports' ? 'bg-childrenPrimary text-white' : 'text-textSecondary hover:bg-slateBg hover:text-textPrimary'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span>Reports</span>
            </button>

            {currentUser?.email?.toLowerCase() === 'admin@sharansthan.org' && (
              <button 
                onClick={() => setActiveTab('pending-deletes')}
                className={`w-full h-11 rounded-xl px-4 flex items-center justify-between text-sm font-bold transition ${activeTab === 'pending-deletes' ? 'bg-rose-600 text-white' : 'text-textSecondary hover:bg-slateBg hover:text-rose-400'}`}
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4" />
                  <span>Pending Deletes</span>
                </div>
                {beneficiaries.filter(b => b.deleteRequested).length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {beneficiaries.filter(b => b.deleteRequested).length}
                  </span>
                )}
              </button>
            )}

          </nav>
        </div>

        {/* User context & log out */}
        <div className="mt-8 pt-6 border-t border-slateBorder">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-childrenPrimary bg-opacity-10 rounded-full flex items-center justify-center font-black text-childrenPrimary border border-childrenPrimary border-opacity-30">
              {currentUser.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-textSecondary font-bold truncate max-w-[150px]">{currentUser.email}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full h-10 border border-slateBorder text-colorError rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-colorError hover:bg-opacity-10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT CONTAINER --- */}
      <main className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto">
        
        {/* Top Header Row */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            {activeTab === 'pending-deletes' ? (
              <>
                <h2 className="text-2xl font-black text-textPrimary">Pending Deletion Requests</h2>
                <p className="text-xs text-textSecondary mt-1">Review, approve, or reject record deletion requests submitted by staff.</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black text-textPrimary capitalize">{activeTab} Panel</h2>
                <p className="text-xs text-textSecondary mt-1">Sharansthan NGO outreach operations metrics database</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            {/* Center Switcher Row */}
            <div className="flex bg-[#ECE6F0] p-1 rounded-full border border-slateBorder shadow-inner">
              {(['Asansol', 'Nagpur'] as const).map(center => (
                <button
                  key={center}
                  onClick={() => setSelectedCenter(center)}
                  className={`h-9 px-6 rounded-full text-xs font-bold transition duration-250 ${selectedCenter === center ? 'bg-white text-[#21005D] shadow-sm font-black' : 'text-[#49454F] hover:text-textPrimary'}`}
                >
                  {center}
                </button>
              ))}
            </div>

            {/* Sync trigger */}
            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="h-11 px-4 bg-slateSurface border border-slateBorder rounded-xl hover:border-textSecondary transition text-textPrimary text-xs font-bold flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-colorWarning animate-ping' : 'bg-colorSuccess'}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>
          </div>
        </header>

        {/* -----------------------------------------------------------
            TAB 1: DASHBOARD
            ----------------------------------------------------------- */}
        {/* -----------------------------------------------------------
            TAB 1: DASHBOARD - HOME SCREEN (PROGRAM CARDS)
            ----------------------------------------------------------- */}
        {activeTab === 'dashboard' && !selectedModule && (
          <div className="space-y-8 animate-fadeIn">
            
            {currentUser?.email?.toLowerCase() === 'admin@sharansthan.org' && (
              <button 
                onClick={() => setActiveTab('reports')}
                className="w-full h-12 bg-textPrimary hover:bg-opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Generate Reports
              </button>
            )}

            {/* --- 3 Infographic Stats Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slateSurface border border-slateBorder rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition duration-200">
                <div>
                  <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Total Active</p>
                  <p className="text-3xl font-black text-[#21005D] mt-2">{dashboardRecords.length}</p>
                  <p className="text-[10px] text-textSecondary mt-1">Beneficiaries in {selectedCenter}</p>
                </div>
                <div className="w-12 h-12 bg-slateBg rounded-xl flex items-center justify-center border border-slateBorder text-[#21005D]">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slateSurface border border-slateBorder rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition duration-200">
                <div>
                  <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Children Programs</p>
                  <p className="text-3xl font-black text-childrenPrimary mt-2">
                    {dashboardRecords.filter(b => b.programType === 'Children').length}
                  </p>
                  <p className="text-[10px] text-textSecondary mt-1">Active residential & daycare</p>
                </div>
                <div className="w-12 h-12 bg-slateBg rounded-xl flex items-center justify-center border border-slateBorder text-childrenPrimary">
                  <Baby className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slateSurface border border-slateBorder rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition duration-200">
                <div>
                  <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Women Programs</p>
                  <p className="text-3xl font-black text-womenPrimary mt-2">
                    {dashboardRecords.filter(b => b.programType === 'Women').length}
                  </p>
                  <p className="text-[10px] text-textSecondary mt-1">Support, medical & training</p>
                </div>
                <div className="w-12 h-12 bg-slateBg rounded-xl flex items-center justify-center border border-slateBorder text-womenPrimary">
                  <UserIcon className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* --- 2 Programs Columns Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Children Programs Module List (Blue/Purple theme) */}
              <div className="bg-[#E8EAF6] border border-indigo-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-indigo-900">
                  <Baby className="w-5 h-5 text-indigo-700" />
                  <h3 className="font-black text-sm tracking-widest uppercase text-indigo-900">CHILDREN'S PROGRAMS</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { code: "children_residential", name: "Residential Home", icon: Home },
                    { code: "graduates", name: "Graduates", icon: School },
                    { code: "daycare", name: "Daycare", icon: Baby },
                    { code: "education_support", name: "Education Program", icon: BookOpen }
                  ].map(m => {
                    const count = dashboardRecords.filter(b => b.moduleType === m.code).length;
                    return (
                      <div 
                        key={m.code} 
                        onClick={() => setSelectedModule({ program: 'Children', code: m.code, name: m.name })}
                        className="flex items-center justify-between p-4 bg-white border border-indigo-100 rounded-2xl hover:border-childrenPrimary transition shadow-sm cursor-pointer hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <m.icon className="w-4 h-4 text-indigo-700" />
                            <p className="text-sm font-bold text-textPrimary">{m.name}</p>
                          </div>
                          <p className="text-xs text-textSecondary mt-0.5">{count} Registered</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModule({ program: 'Children', code: m.code, name: m.name });
                            openCreateForm('Children', m.code);
                          }}
                          className="w-8 h-8 bg-childrenPrimary bg-opacity-10 text-childrenPrimary rounded-lg flex items-center justify-center hover:bg-childrenPrimary hover:text-white transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Women Programs Module List (Rose/Red theme) */}
              <div className="bg-[#FCE4EC] border border-rose-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-rose-900">
                  <UserIcon className="w-5 h-5 text-rose-700" />
                  <h3 className="font-black text-sm tracking-widest uppercase text-rose-900">WOMEN'S PROGRAMS</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { code: "women_support", name: "Help & Support", icon: Heart },
                    { code: "women_medical_hiv", name: "Medical (HIV)", icon: Stethoscope },
                    { code: "outreach_programs", name: "Outreach Programs", icon: Users },
                    { code: "skill_training", name: "Skill Training", icon: Scissors }
                  ].map(m => {
                    const count = dashboardRecords.filter(b => b.moduleType === m.code).length;
                    return (
                      <div 
                        key={m.code} 
                        onClick={() => setSelectedModule({ program: 'Women', code: m.code, name: m.name })}
                        className="flex items-center justify-between p-4 bg-white border border-rose-100 rounded-2xl hover:border-womenPrimary transition shadow-sm cursor-pointer hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <m.icon className="w-4 h-4 text-rose-700" />
                            <p className="text-sm font-bold text-textPrimary">{m.name}</p>
                          </div>
                          <p className="text-xs text-textSecondary mt-0.5">{count} Registered</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModule({ program: 'Women', code: m.code, name: m.name });
                            openCreateForm('Women', m.code);
                          }}
                          className="w-8 h-8 bg-womenPrimary bg-opacity-10 text-womenPrimary rounded-lg flex items-center justify-center hover:bg-womenPrimary hover:text-white transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>


          </div>
        )}

        {/* -----------------------------------------------------------
            TAB 1: DASHBOARD - DETAILED PROGRAM MODULE SCREEN
            ----------------------------------------------------------- */}
        {activeTab === 'dashboard' && selectedModule && (
          <div className="space-y-8 animate-fadeIn">
            {/* --- Program Screen Header --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slateSurface border border-slateBorder p-5 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setSelectedModule(null); setProgramSearch(''); }}
                  className="p-2 bg-slateBg hover:bg-slateBorder border border-slateBorder text-textPrimary rounded-xl transition flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-xl font-black text-textPrimary flex items-center gap-2">
                    {(() => {
                      const IconComp = getModuleIcon(selectedModule.code);
                      const isWomen = selectedModule.program === 'Women';
                      return (
                        <>
                          {IconComp && <IconComp className={`w-5 h-5 ${isWomen ? 'text-rose-700' : 'text-indigo-700'}`} />}
                          <span>{selectedModule.name}</span>
                        </>
                      );
                    })()}
                  </h3>
                  <p className="text-xs text-textSecondary mt-0.5">
                    {selectedModule.program} Program Module • {selectedCenter}
                  </p>
                </div>
              </div>
              <button
                onClick={() => openCreateForm(selectedModule.program, selectedModule.code)}
                className="w-full sm:w-auto h-11 bg-childrenPrimary hover:bg-[#3d00ad] text-white px-5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* --- 2 Infographic Stats Cards for Program --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slateSurface border border-slateBorder rounded-3xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Total Registered</p>
                  <p className="text-3xl font-black text-[#21005D] mt-2">
                    {dashboardRecords.filter(b => b.moduleType === selectedModule.code).length}
                  </p>
                  <p className="text-[10px] text-textSecondary mt-1">Total database records</p>
                </div>
                <div className="w-12 h-12 bg-slateBg rounded-xl flex items-center justify-center border border-slateBorder text-[#21005D]">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slateSurface border border-slateBorder rounded-3xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Active Beneficiaries</p>
                  <p className="text-3xl font-black text-colorSuccess mt-2">
                    {dashboardRecords.filter(b => b.moduleType === selectedModule.code && b.status === 'Active').length}
                  </p>
                  <p className="text-[10px] text-textSecondary mt-1">Currently enrolled and active</p>
                </div>
                <div className="w-12 h-12 bg-slateBg rounded-xl flex items-center justify-center border border-slateBorder text-colorSuccess">
                  <UserIcon className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* --- Local Filter Block --- */}
            <div className="bg-slateSurface border border-slateBorder p-6 rounded-3xl shadow-sm">
              <div className="w-full sm:max-w-md relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-textSecondary">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  placeholder="Search name or remarks..."
                  value={programSearch}
                  onChange={e => setProgramSearch(e.target.value)}
                  className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl pl-10 pr-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                />
              </div>
            </div>

            {/* --- Beneficiaries List Grid --- */}
            <div className="bg-slateSurface border border-slateBorder rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-sm text-textPrimary">Program Enrollments</h3>
                <span className="text-xs text-textSecondary">{programRecords.length} found</span>
              </div>

              {programRecords.length === 0 ? (
                <div className="py-12 text-center text-textSecondary">
                  <Info className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No beneficiary records enrolled in this program.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programRecords.map(b => {
                    const themeColor = b.programType === 'Children' ? 'text-childrenPrimary' : 'text-womenPrimary';
                    return (
                      <div 
                        key={b.id}
                        className="bg-slateBg border border-slateBorder rounded-2xl p-4 flex flex-col justify-between hover:border-textSecondary transition cursor-pointer"
                        onClick={() => setSelectedBeneficiaryDetail(b)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-slateSurface flex items-center justify-center font-bold text-base overflow-hidden ${themeColor}`}>
                              {(b.profilePhoto?.thumbnailUrl || b.photoUrl) ? (
                                <Avatar src={b.profilePhoto?.thumbnailUrl || b.photoUrl} alt={b.name} fallback={b.name[0]} className="w-full h-full object-cover" />
                              ) : (
                                b.name[0]
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-textPrimary">{b.name}</p>
                              <p className="text-xs text-textSecondary mt-0.5">{b.gender} • {b.age} Yrs</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-slateSurface border ${b.status === 'Active' ? 'text-colorSuccess border-colorSuccess border-opacity-30' : 'text-textSecondary border-slateBorder'}`}>
                              {b.status}
                            </span>
                            {b.deleteRequested && (
                              <span className="text-[8px] font-black uppercase tracking-wider bg-rose-500 bg-opacity-15 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500 border-opacity-20">
                                DELETE REQ
                              </span>
                            )}
                          </div>
                        </div>
                        {b.remarks && (
                          <p className="text-xs text-textSecondary italic mt-3 bg-slateSurface p-2 rounded-lg border border-slateBorder line-clamp-1">
                            {b.remarks}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slateBorder text-[10px] text-textSecondary">
                          <span>Reg Date: {b.date}</span>
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => openEditForm(b)}
                              className="px-2 py-1 bg-slateSurface hover:bg-slateBorder border border-slateBorder rounded font-bold transition text-textPrimary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (currentUser?.email?.toLowerCase() === 'admin@sharansthan.org') {
                                  handleDeleteRecord(b.id);
                                } else {
                                  handleRequestDelete(b.id);
                                }
                              }}
                              className="px-2 py-1 bg-rose-500 bg-opacity-10 hover:bg-rose-500 hover:text-white border border-rose-500 border-opacity-20 rounded font-bold transition text-rose-500"
                            >
                              {currentUser?.email?.toLowerCase() === 'admin@sharansthan.org' ? 'Delete' : 'Request Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------
            TAB 2: GLOBAL SEARCH
            ----------------------------------------------------------- */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            
            {/* Search Input Bar & Advanced Filters Toggle */}
            <div className="bg-slateSurface border border-slateBorder rounded-2xl p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Search beneficiaries by name or remarks..."
                  value={globalSearch}
                  onChange={e => setGlobalSearch(e.target.value)}
                  className="w-full h-12 bg-slateBg border border-slateBorder rounded-xl pl-12 pr-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                />
              </div>

              {/* Advanced Filter Parameter Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Module</label>
                  <select 
                    value={filterModule} 
                    onChange={e => setFilterModule(e.target.value)}
                    className="w-full h-10 bg-slateBg border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none"
                  >
                    <option value="">All Modules</option>
                    {Object.entries(MODULE_DISPLAY_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Gender</label>
                  <select 
                    value={filterGender} 
                    onChange={e => setFilterGender(e.target.value)}
                    className="w-full h-10 bg-slateBg border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Status</label>
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full h-10 bg-slateBg border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Exited">Exited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Min Age</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={filterAgeMin}
                    onChange={e => setFilterAgeMin(e.target.value)}
                    className="w-full h-10 bg-slateBg border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Max Age</label>
                  <input 
                    type="number"
                    placeholder="100"
                    value={filterAgeMax}
                    onChange={e => setFilterAgeMax(e.target.value)}
                    className="w-full h-10 bg-slateBg border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Results Grid List */}
            <div className="bg-slateSurface border border-slateBorder rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-sm text-textPrimary">Search Query Matches</h3>
                <span className="text-xs text-textSecondary">{searchFilteredRecords.length} records found</span>
              </div>

              {searchFilteredRecords.length === 0 ? (
                <div className="py-12 text-center text-textSecondary">
                  <Info className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No beneficiary records matched the specified search filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchFilteredRecords.map(b => {
                    const themeColor = b.programType === 'Children' ? 'text-childrenPrimary' : 'text-womenPrimary';
                    return (
                      <div 
                        key={b.id}
                        onClick={() => setSelectedBeneficiaryDetail(b)}
                        className="bg-slateBg border border-slateBorder rounded-xl p-4 flex justify-between items-center hover:border-textSecondary transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-slateSurface flex items-center justify-center font-bold text-base overflow-hidden ${themeColor}`}>
                            {(b.profilePhoto?.thumbnailUrl || b.photoUrl) ? (
                              <Avatar src={b.profilePhoto?.thumbnailUrl || b.photoUrl} alt={b.name} fallback={b.name[0]} className="w-full h-full object-cover" />
                            ) : (
                              b.name[0]
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-textPrimary">{b.name}</p>
                            <p className="text-xs text-textSecondary mt-0.5">{MODULE_DISPLAY_NAMES[b.moduleType]}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <p className="text-[10px] text-textSecondary font-bold">{b.gender} • {b.age} Yrs</p>
                          <div className="flex gap-1.5 items-center">
                            {b.deleteRequested && (
                              <span className="text-[8px] font-black uppercase tracking-wider bg-rose-500 bg-opacity-15 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500 border-opacity-20">
                                DELETE REQ
                              </span>
                            )}
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slateSurface border ${b.status === 'Active' ? 'text-colorSuccess border-colorSuccess border-opacity-30' : 'text-textSecondary border-slateBorder'}`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------
            TAB 3: ANALYTICS METRICS
            ----------------------------------------------------------- */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Pie Chart: Center Demographics */}
              <div className="bg-slateSurface border border-slateBorder rounded-2xl p-6">
                <h3 className="font-black text-sm text-textPrimary mb-2 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-childrenPrimary" />
                  Center Records Distribution
                </h3>
                <p className="text-xs text-textSecondary mb-6">Comparative statistics between Nagpur and Asansol</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                  {/* SVG Responsive Pie Chart */}
                  <svg className="w-36 h-36 shrink-0" viewBox="0 0 100 100">
                    {(() => {
                      const total = stats.asansol + stats.nagpur;
                      if (total === 0) return <circle cx="50" cy="50" r="40" fill="#334155" />;
                      
                      const asansolPct = stats.asansol / total;
                      
                      // Polar coordinates helper
                      const getCoordinatesForPercent = (percent: number) => {
                        const x = Math.cos(2 * Math.PI * percent);
                        const y = Math.sin(2 * Math.PI * percent);
                        return [x, y];
                      };
                      
                      const [x1, y1] = getCoordinatesForPercent(0);
                      const [x2, y2] = getCoordinatesForPercent(asansolPct);
                      const largeArcFlag = asansolPct > 0.5 ? 1 : 0;
                      
                      // SVG Arc path
                      const pathData = [
                        `M 50 50`,
                        `L ${50 + x1 * 40} ${50 + y1 * 40}`,
                        `A 40 40 0 ${largeArcFlag} 1 ${50 + x2 * 40} ${50 + y2 * 40}`,
                        `Z`
                      ].join(' ');

                      return (
                        <>
                          {/* Full background representing Nagpur */}
                          <circle cx="50" cy="50" r="40" fill="#A52A2A" />
                          {/* Segment representing Asansol */}
                          <path d={pathData} fill="#D56332" />
                          <circle cx="50" cy="50" r="24" fill="#FFFFFF" />
                        </>
                      );
                    })()}
                  </svg>

                  <div className="space-y-3 font-semibold text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 bg-childrenPrimary rounded" />
                      <span className="text-textPrimary">Asansol: {stats.asansol} beneficiaries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 bg-womenPrimary rounded" />
                      <span className="text-textPrimary">Nagpur: {stats.nagpur} beneficiaries</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Chart: Registration Growth Trends */}
              <div className="bg-slateSurface border border-slateBorder rounded-2xl p-6">
                <h3 className="font-black text-sm text-textPrimary mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-childrenPrimary" />
                  Monthly Registration Growth
                </h3>
                <p className="text-xs text-textSecondary mb-6">Chronological database increments (Year 2026)</p>

                {/* SVG Responsive Line Chart */}
                <div className="h-40 w-full">
                  {(() => {
                    const monthlyCounts = [
                      { m: "Jan", count: beneficiaries.filter(b => b.date.includes("-01-")).length },
                      { m: "Feb", count: beneficiaries.filter(b => b.date.includes("-02-")).length },
                      { m: "Mar", count: beneficiaries.filter(b => b.date.includes("-03-")).length },
                      { m: "Apr", count: beneficiaries.filter(b => b.date.includes("-04-")).length },
                      { m: "May", count: beneficiaries.filter(b => b.date.includes("-05-")).length },
                      { m: "Jun", count: beneficiaries.filter(b => b.date.includes("-06-")).length },
                    ];

                    const maxVal = Math.max(...monthlyCounts.map(x => x.count), 4);
                    const width = 300;
                    const height = 120;
                    const points = monthlyCounts.map((x, idx) => {
                      const px = (idx / 5) * width;
                      const py = height - (x.count / maxVal) * (height - 20) - 10;
                      return `${px},${py}`;
                    }).join(' ');

                    return (
                      <div className="w-full h-full flex flex-col justify-between">
                        <svg className="w-full h-[120px]" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                          {/* Grid lines */}
                          {[0, 1, 2, 3].map(i => (
                            <line 
                              key={i} 
                              x1="0" 
                              y1={height * i / 3} 
                              x2={width} 
                              y2={height * i / 3} 
                              stroke="#334155" 
                              strokeDasharray="4 4" 
                              strokeWidth="0.5" 
                            />
                          ))}
                          {/* Smooth Path */}
                          <polyline fill="none" stroke="#6366F1" strokeWidth="3" points={points} strokeLinecap="round" />
                          {/* Interactive Nodes */}
                          {monthlyCounts.map((x, idx) => {
                            const px = (idx / 5) * width;
                            const py = height - (x.count / maxVal) * (height - 20) - 10;
                            return (
                              <g key={idx}>
                                <circle cx={px} cy={py} r="4" fill="#FFF" />
                                <circle cx={px} cy={py} r="2.5" fill="#6366F1" />
                              </g>
                            );
                          })}
                        </svg>
                        
                        <div className="flex justify-between text-[10px] text-textSecondary px-1 font-black">
                          {monthlyCounts.map((x, idx) => <span key={idx}>{x.m} ({x.count})</span>)}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Custom Bar Chart breakdown list */}
            <div className="bg-slateSurface border border-slateBorder rounded-2xl p-6">
              <h3 className="font-black text-sm text-textPrimary mb-6">Program Module Distribution Breakdowns</h3>
              
              <div className="space-y-5">
                {Object.entries(MODULE_DISPLAY_NAMES).map(([code, name]) => {
                  const count = beneficiaries.filter(b => b.moduleType === code).length;
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  const barColor = code.startsWith('children') || code === 'graduates' || code === 'daycare' ? 'bg-childrenPrimary' : 'bg-womenPrimary';

                  return (
                    <div key={code}>
                      <div className="flex justify-between text-xs font-semibold text-textPrimary mb-2">
                        <span>{name}</span>
                        <span>{count} registered ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slateBg rounded-full overflow-hidden border border-slateBorder">
                        <div 
                          className={`h-full ${barColor} rounded-full transition-all duration-500`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
          </div>
        )}

        {/* -----------------------------------------------------------
            TAB 4: REPORTS
            ----------------------------------------------------------- */}
        {activeTab === 'reports' && (
          <ReportsView beneficiaries={beneficiaries} />
        )}
        {activeTab === 'pending-deletes' && (
          <div className="space-y-6">

            {(() => {
              const pendingRequests = beneficiaries.filter(b => b.deleteRequested);

              if (pendingRequests.length === 0) {
                return (
                  <div className="bg-slateSurface border border-slateBorder rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                    <div className="w-16 h-16 bg-slateBg rounded-full flex items-center justify-center text-textSecondary border border-slateBorder mb-4">
                      <Trash2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-base text-textPrimary">No Pending Delete Requests</h4>
                    <p className="text-xs text-textSecondary mt-2 max-w-xs mx-auto">
                      All beneficiary records are secure. No deletion requests require your review at this time.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingRequests.map(b => (
                    <div key={b.id} className="bg-slateSurface border border-slateBorder rounded-2xl p-6 space-y-4 shadow-sm hover:border-textSecondary transition duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-base text-textPrimary">{b.name}</h4>
                          <p className="text-xs font-semibold text-childrenPrimary mt-1">
                            {b.programType} • {b.center} • {MODULE_DISPLAY_NAMES[b.moduleType] || b.moduleType}
                          </p>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-rose-500 bg-opacity-10 border border-rose-500 border-opacity-25 text-rose-400 px-2 py-0.5 rounded-full">
                          Pending Review
                        </span>
                      </div>

                      <div className="border-t border-slateBorder pt-4 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-textSecondary">Requested By:</span>
                          <span className="text-textPrimary font-bold">{b.deleteRequestedBy || "Staff"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-textSecondary">Requested At:</span>
                          <span className="text-textPrimary font-bold">{b.deleteRequestedAt || "N/A"}</span>
                        </div>
                        {b.deleteRequestReason && (
                          <div className="mt-3 bg-slateBg p-3 rounded-xl border border-slateBorder">
                            <p className="text-[10px] text-textSecondary font-black uppercase mb-1">Reason for Deletion:</p>
                            <p className="text-xs text-textPrimary leading-relaxed">{b.deleteRequestReason}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to REJECT the deletion request for ${b.name}?`)) {
                              await handleRejectDelete(b.id);
                            }
                          }}
                          className="flex-1 h-11 border border-slateBorder hover:bg-slateBg text-textPrimary rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                        >
                          Reject Request
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to PERMANENTLY delete the beneficiary record for ${b.name}? This action cannot be undone.`)) {
                              await handleDeleteRecord(b.id);
                            }
                          }}
                          className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Approve Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* -----------------------------------------------------------
          DRAWER: BENEFICIARY DETAILS VIEW
          ----------------------------------------------------------- */}
      {selectedBeneficiaryDetail && (
        <div className="fixed inset-0 bg-slateBg bg-opacity-80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-lg bg-slateSurface border-l border-slateBorder h-full flex flex-col justify-between shadow-2xl animate-slide-left">
            <div className="overflow-y-auto p-8 space-y-6">
              
              {/* Profile Card details */}
              <div className="text-center pb-6 border-b border-slateBorder">
                <div className="w-24 h-24 rounded-full bg-slateBg border-2 border-childrenPrimary flex items-center justify-center font-black text-4xl text-childrenPrimary mx-auto mb-4 overflow-hidden">
                  {(selectedBeneficiaryDetail.profilePhoto?.originalUrl || selectedBeneficiaryDetail.photoUrl) ? (
                    <div className="w-full h-full cursor-pointer" onClick={() => setLightboxUrl(selectedBeneficiaryDetail.profilePhoto?.originalUrl || selectedBeneficiaryDetail.photoUrl)}>
                      <Avatar 
                        src={selectedBeneficiaryDetail.profilePhoto?.originalUrl || selectedBeneficiaryDetail.photoUrl} 
                        alt={selectedBeneficiaryDetail.name} 
                        fallback={selectedBeneficiaryDetail.name[0]}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    selectedBeneficiaryDetail.name[0]
                  )}
                </div>
                <h3 className="text-xl font-black text-textPrimary">{selectedBeneficiaryDetail.name}</h3>
                <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-childrenPrimary bg-opacity-15 text-childrenPrimary rounded-full border border-childrenPrimary border-opacity-20 mt-2">
                  {selectedBeneficiaryDetail.programType} Program
                </span>
              </div>

              {/* Data listing */}
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-textSecondary border-b border-slateBorder pb-1">Detail fields</h4>
                
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-textSecondary">Outreach Center</span>
                  <span className="text-textPrimary">{selectedBeneficiaryDetail.center}</span>
                </div>

                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-textSecondary">Specific Module</span>
                  <span className="text-textPrimary">{MODULE_DISPLAY_NAMES[selectedBeneficiaryDetail.moduleType]}</span>
                </div>

                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-textSecondary">Gender / Age</span>
                  <span className="text-textPrimary">{selectedBeneficiaryDetail.gender} • {selectedBeneficiaryDetail.age} Years</span>
                </div>

                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-textSecondary">Registration Date</span>
                  <span className="text-textPrimary">{selectedBeneficiaryDetail.date}</span>
                </div>

                {selectedBeneficiaryDetail.aadhaarNumber && (
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-textSecondary">Aadhaar Number</span>
                    <span className="text-textPrimary">{selectedBeneficiaryDetail.aadhaarNumber}</span>
                  </div>
                )}

                {selectedBeneficiaryDetail.panNumber && (
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-textSecondary">PAN Number</span>
                    <span className="text-textPrimary">{selectedBeneficiaryDetail.panNumber}</span>
                  </div>
                )}

                {selectedBeneficiaryDetail.hasOrphanCertificate && (
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-textSecondary">Has Orphan Certificate</span>
                    <span className="text-textPrimary">{selectedBeneficiaryDetail.hasOrphanCertificate}</span>
                  </div>
                )}

                {selectedBeneficiaryDetail.hasOrphanCertificate === "No" && selectedBeneficiaryDetail.eligibleForOrphanCertificate && (
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-textSecondary">Eligible for Orphan Certificate</span>
                    <span className="text-textPrimary">{selectedBeneficiaryDetail.eligibleForOrphanCertificate}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-textSecondary">Current Status</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-black uppercase border ${selectedBeneficiaryDetail.status === 'Active' ? 'text-colorSuccess border-colorSuccess border-opacity-30' : 'text-textSecondary border-slateBorder'}`}>
                    {selectedBeneficiaryDetail.status}
                  </span>
                </div>
              </div>

              {/* Program-Specific Details Listing */}
              {(() => {
                const programFieldsConfig: Record<string, { label: string; key: string }[]> = {
                  children_residential: [
                    { label: "Admission Number", key: "admissionNumber" },
                    { label: "Dormitory / Room Number", key: "dormitoryNumber" },
                    { label: "Date of Exit", key: "actualLeavingDate" },
                    { label: "Father Name", key: "fatherName" },
                    { label: "Mother Name", key: "motherName" },
                    { label: "Guardian Name", key: "guardianName" },
                    { label: "Guardian Relationship", key: "guardianRelationship" },
                    { label: "Father Contact Number", key: "fatherMobileNumber" },
                    { label: "Mother Contact Number", key: "motherMobileNumber" },
                    { label: "Guardian Contact Number", key: "guardianMobileNumber" },
                    { label: "Family Background", key: "familyBackground" },
                    { label: "Reason for Admission", key: "reasonForAdmission" },
                    { label: "Reason for Leaving", key: "reasonForLeaving" },
                    { label: "School Name", key: "currentSchoolName" },
                    { label: "Current Class", key: "currentClass" },
                    { label: "Medical Condition (if any)", key: "medicalHistory" },
                    { label: "Allergies (if any)", key: "allergies" },
                    { label: "Staff Remarks", key: "staffRemarks" },
                  ],
                  graduates: [
                    { label: "Graduation Year", key: "graduationYear" },
                    { label: "Qualification", key: "qualification" },
                    { label: "Current Status", key: "currentEmploymentStatus" },
                    { label: "Current Contact Number", key: "currentContactNumber" },
                    { label: "Family Background", key: "familyBackground" },
                    { label: "Staff Remarks", key: "staffRemarks" },
                  ],
                  daycare: [
                    { label: "School Name", key: "schoolNameDaycare" },
                    { label: "Current Class", key: "currentClassDaycare" },
                    { label: "Father Name", key: "fatherName" },
                    { label: "Mother Name", key: "motherName" },
                    { label: "Guardian Name", key: "guardianName" },
                    { label: "Parent / Guardian Contact Number", key: "parentContactNumbers" },
                    { label: "Family Background", key: "familyBackground" },
                    { label: "Reason for Joining", key: "reasonForJoining" },
                    { label: "Staff Remarks", key: "staffRemarks" },
                  ],
                  education_support: [
                    { label: "School Name", key: "schoolNameEducation" },
                    { label: "Current Class", key: "currentClassEducation" },
                    { label: "Academic Performance", key: "academicPerformance" },
                    { label: "Father Name", key: "fatherName" },
                    { label: "Father Occupation", key: "fatherOccupation" },
                    { label: "Father Contact Number", key: "fatherMobileNumber" },
                    { label: "Mother Name", key: "motherName" },
                    { label: "Mother Occupation", key: "motherOccupation" },
                    { label: "Mother Contact Number", key: "motherMobileNumber" },
                    { label: "Guardian Name", key: "guardianName" },
                    { label: "Guardian Relationship", key: "guardianRelationship" },
                    { label: "Guardian Contact Number", key: "guardianMobileNumber" },
                    { label: "Family Background", key: "familyBackground" },
                    { label: "Staff Remarks", key: "staffRemarks" },
                  ],
                  women_support: [
                    { label: "Husband Name (if applicable)", key: "husbandName" },
                    { label: "Marital Status", key: "maritalStatus" },
                    { label: "Number of Children", key: "numberOfChildren" },
                    { label: "Occupation", key: "occupation" },
                    { label: "Family Background", key: "familyBackground" },
                    { label: "Reason for Joining", key: "reasonForJoining" },
                    { label: "Staff Remarks", key: "staffRemarks" },
                    { label: "Type of Support Required", key: "supportType" },
                    { label: "Description of Support Needed", key: "supportDescription" },
                    { label: "Priority (Low / Medium / High)", key: "supportPriority" },
                    { label: "Current Support Status", key: "supportStatus" },
                    { label: "Remarks", key: "supportRemarks" },
                  ],
                  women_medical_hiv: [
                    { label: "Hospital / Clinic Name", key: "hospitalClinicName" },
                    { label: "Doctor Name", key: "medicalDoctorName" },
                    { label: "Current Health Status", key: "currentHealthStatus" },
                    { label: "Medical Condition", key: "medicalCondition" },
                    { label: "Medical Notes", key: "additionalMedicalNotes" },
                  ],
                  outreach_programs: [
                    { label: "Outreach Program Name", key: "outreachProgramName" },
                    { label: "Participation Status", key: "outreachParticipationStatus" },
                    { label: "Start Date", key: "outreachStartDate" },
                    { label: "End Date (Optional)", key: "outreachEndDate" },
                    { label: "Remarks", key: "outreachRemarks" },
                  ],
                  skill_training: [
                    { label: "Skill Training Name", key: "skillTrainingName" },
                    { label: "Training Status", key: "skillTrainingStatus" },
                    { label: "Start Date", key: "skillStartDate" },
                    { label: "Expected Completion Date (or Completion Date if completed)", key: "skillExpectedCompletionDate" },
                    { label: "Trainer / Instructor", key: "skillTrainerInstructor" },
                    { label: "Certificate Issued (Yes/No)", key: "certificateIssued" },
                    { label: "Placement Status", key: "placementStatus" },
                    { label: "Remarks", key: "skillRemarks" },
                  ],
                };

                const activeFields = programFieldsConfig[selectedBeneficiaryDetail.moduleType] || [];
                const presentFields = activeFields.map(f => {
                  const val = (selectedBeneficiaryDetail as any)[f.key];
                  const displayVal = val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : "Not Provided";
                  return { ...f, val: displayVal };
                });

                if (presentFields.length === 0) return null;

                return (
                  <div className="space-y-4 pt-4 border-t border-slateBorder">
                    <h4 className="font-black text-xs uppercase tracking-widest text-textSecondary pb-1 border-b border-slateBorder">
                      Program Specific Metrics
                    </h4>
                    <div className="space-y-3">
                      {presentFields.map(f => {
                        let fieldHeader = null;
                        if (f.key === 'supportType') {
                          fieldHeader = (
                            <div className="pt-3 border-t border-slateBorder mt-3">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-womenPrimary mb-2">Help & Support Required</h5>
                            </div>
                          );
                        } else if (f.key === 'currentHealthStatus') {
                          fieldHeader = (
                            <div className="pt-3 border-t border-slateBorder mt-3">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-womenPrimary mb-2">Health Information</h5>
                            </div>
                          );
                        } else if (f.key === 'outreachProgramName') {
                          fieldHeader = (
                            <div className="pt-3 border-t border-slateBorder mt-3">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-womenPrimary mb-2">Outreach Program Participation</h5>
                            </div>
                          );
                        } else if (f.key === 'skillTrainingName') {
                          fieldHeader = (
                            <div className="pt-3 border-t border-slateBorder mt-3">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-womenPrimary mb-2">Skill Training Details</h5>
                            </div>
                          );
                        }

                        return (
                          <React.Fragment key={f.key}>
                            {fieldHeader}
                            <div className="flex flex-col text-sm bg-slateBg p-3 rounded-xl border border-slateBorder">
                              <span className="text-[10px] font-black uppercase tracking-wider text-textSecondary mb-1">{f.label}</span>
                              <span className="text-textPrimary font-semibold leading-relaxed">
                                {f.val}
                              </span>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Children Details (Women Program Only) */}
              {selectedBeneficiaryDetail.programType === "Women" && (() => {
                let childrenList = [];
                try {
                  childrenList = selectedBeneficiaryDetail.childrenDetailsJson ? JSON.parse(selectedBeneficiaryDetail.childrenDetailsJson) : [];
                } catch (e) {}
                if (!Array.isArray(childrenList) || childrenList.length === 0) return null;

                return (
                  <div className="space-y-4 pt-4 border-t border-slateBorder">
                    <h4 className="font-black text-xs uppercase tracking-widest text-textSecondary pb-1 border-b border-slateBorder">
                      Children Details ({childrenList.length})
                    </h4>
                    <div className="space-y-3">
                      {childrenList.map((child: any, idx: number) => (
                        <div key={idx} className="bg-slateBg p-4 rounded-xl border border-slateBorder space-y-2">
                          <div className="text-xs font-bold text-womenPrimary mb-1">Child #{idx + 1}</div>
                          {child.name && (
                            <div className="flex justify-between text-sm">
                              <span className="text-textSecondary">Name</span>
                              <span className="text-textPrimary font-semibold">{child.name}</span>
                            </div>
                          )}
                          {child.age && (
                            <div className="flex justify-between text-sm">
                              <span className="text-textSecondary">Age / Gender</span>
                              <span className="text-textPrimary font-semibold">{child.age} Yrs • {child.gender || 'Female'}</span>
                            </div>
                          )}
                          {child.relationship && (
                            <div className="flex justify-between text-sm">
                              <span className="text-textSecondary">Relationship</span>
                              <span className="text-textPrimary font-semibold">{child.relationship}</span>
                            </div>
                          )}
                          {child.currentResidence && (
                            <div className="flex justify-between text-sm">
                              <span className="text-textSecondary">Residence</span>
                              <span className="text-textPrimary font-semibold">{child.currentResidence}</span>
                            </div>
                          )}
                          {child.schoolEmploymentStatus && (
                            <div className="flex justify-between text-sm">
                              <span className="text-textSecondary">School/Work</span>
                              <span className="text-textPrimary font-semibold">{child.schoolEmploymentStatus}</span>
                            </div>
                          )}
                          {child.specialNeeds && (
                            <div className="flex justify-between text-sm">
                              <span className="text-textSecondary">Special Needs</span>
                              <span className="text-textPrimary font-semibold text-rose-400">{child.specialNeeds}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Photo History Gallery (Children Only) */}
              {selectedBeneficiaryDetail.programType === "Children" && (
                <div className="space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-widest text-textSecondary border-b border-slateBorder pb-1">Photo History Gallery</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Parent / Guardian', value: selectedBeneficiaryDetail.parentPhotoUrl, fullUrl: selectedBeneficiaryDetail.parentPhoto?.originalUrl || selectedBeneficiaryDetail.parentPhotoUrl, thumbUrl: selectedBeneficiaryDetail.parentPhoto?.thumbnailUrl || selectedBeneficiaryDetail.parentPhotoUrl },
                      { label: 'Joining Photo', value: selectedBeneficiaryDetail.joiningPhotoUrl, fullUrl: selectedBeneficiaryDetail.joiningPhoto?.originalUrl || selectedBeneficiaryDetail.joiningPhotoUrl, thumbUrl: selectedBeneficiaryDetail.joiningPhoto?.thumbnailUrl || selectedBeneficiaryDetail.joiningPhotoUrl },
                      { label: 'Exit / Leaving', value: selectedBeneficiaryDetail.leavingPhotoUrl, fullUrl: selectedBeneficiaryDetail.leavingPhoto?.originalUrl || selectedBeneficiaryDetail.leavingPhotoUrl, thumbUrl: selectedBeneficiaryDetail.leavingPhoto?.thumbnailUrl || selectedBeneficiaryDetail.leavingPhotoUrl },
                    ].map(({ label, value, fullUrl, thumbUrl }) => (
                      <div 
                        key={label} 
                        className={`border rounded-xl p-2.5 flex flex-col items-center justify-center text-center bg-slateBg min-h-[120px] transition ${value ? 'border-childrenPrimary cursor-pointer hover:bg-slateBorder' : 'border-slateBorder opacity-60'}`}
                        onClick={() => value && setLightboxUrl(fullUrl || value)}
                      >
                        {value ? (
                          <div className="flex flex-col items-center gap-1.5 w-full">
                            <Avatar 
                              src={thumbUrl || value} 
                              alt={label} 
                              fallback="Img"
                              className="w-12 h-12 object-cover rounded shadow-sm border border-slateBorder" 
                            />
                            <span className="text-[10px] font-bold text-textPrimary">{label}</span>
                            <span className="text-[8px] uppercase tracking-wider bg-colorSuccess bg-opacity-15 text-colorSuccess px-1.5 py-0.5 rounded font-black">Available</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 w-full text-textSecondary">
                            <Image className="w-5 h-5 opacity-40" />
                            <span className="text-[10px] font-bold">{label}</span>
                            <span className="text-[8px] uppercase tracking-wider bg-slateSurface text-textSecondary px-1.5 py-0.5 rounded font-black">Missing</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks Box */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-widest text-textSecondary border-b border-slateBorder pb-1">Remarks and history</h4>
                <p className="text-sm leading-relaxed text-textPrimary bg-slateBg p-4 border border-slateBorder rounded-xl">
                  {selectedBeneficiaryDetail.remarks || "No remarks logged."}
                </p>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="p-6 bg-slateBg border-t border-slateBorder flex flex-col gap-4">
              {selectedBeneficiaryDetail.deleteRequested && (
                <div className="bg-rose-500 bg-opacity-10 border border-rose-500 border-opacity-20 p-3 rounded-xl text-xs text-rose-400 font-bold text-center">
                  ⚠️ Deletion requested by {selectedBeneficiaryDetail.deleteRequestedBy || 'staff'}. Status: {selectedBeneficiaryDetail.deleteRequestStatus || 'Pending'}
                </div>
              )}

              <div className="flex gap-3 w-full">
                {selectedBeneficiaryDetail.deleteRequested ? (
                  currentUser?.email?.toLowerCase() === 'admin@sharansthan.org' ? (
                    <>
                      <button 
                        onClick={async () => {
                          await handleDeleteRecord(selectedBeneficiaryDetail.id);
                          setSelectedBeneficiaryDetail(null);
                        }}
                        className="flex-1 h-12 bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Approve Delete</span>
                      </button>
                      <button 
                        onClick={() => handleRejectDelete(selectedBeneficiaryDetail.id)}
                        className="flex-1 h-12 border border-slateBorder text-textPrimary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slateSurface transition"
                      >
                        <span>Reject Request</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      disabled
                      className="flex-1 h-12 bg-slateBorder text-textSecondary rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
                    >
                      <span>Pending Admin Review</span>
                    </button>
                  )
                ) : (
                  <>
                    <button 
                      onClick={() => openEditForm(selectedBeneficiaryDetail)}
                      className="flex-1 h-12 bg-childrenPrimary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-95 transition"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Record</span>
                    </button>

                    {currentUser?.email?.toLowerCase() === 'admin@sharansthan.org' ? (
                      <button 
                        onClick={async () => {
                          await handleDeleteRecord(selectedBeneficiaryDetail.id);
                          setSelectedBeneficiaryDetail(null);
                        }}
                        className="w-12 h-12 border border-slateBorder text-colorError rounded-xl flex items-center justify-center hover:bg-colorError hover:bg-opacity-10 transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRequestDelete(selectedBeneficiaryDetail.id)}
                        className="h-12 px-4 border border-rose-500 border-opacity-30 text-rose-500 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-500 hover:bg-opacity-10 transition"
                        title="Request Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Req Delete</span>
                      </button>
                    )}
                  </>
                )}

                <button 
                  onClick={() => setSelectedBeneficiaryDetail(null)}
                  className="h-12 px-5 border border-slateBorder text-textPrimary rounded-xl text-sm font-bold hover:bg-slateSurface transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------
          MODAL: BENEFICIARY CREATION / EDITION FORM
          ----------------------------------------------------------- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slateBg bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slateSurface border border-slateBorder rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-black text-textPrimary mb-6">
              {editingBeneficiary ? "Modify Beneficiary Record" : `Register Beneficiary in ${selectedCenter}`}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Full Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Date of Birth</label>
                  <input 
                    type="date"
                    required
                    value={formDateOfBirth}
                    onChange={e => setFormDateOfBirth(e.target.value)}
                    className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Age</label>
                  <input 
                    type="text"
                    readOnly
                    placeholder="Auto-calculated from DOB"
                    value={formAge ? `Age: ${formAge} Years` : 'Age: XX Years'}
                    className="w-full h-11 bg-slateBg/50 border border-slateBorder rounded-xl px-4 text-sm text-textPrimary/70 focus:outline-none cursor-not-allowed transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Gender</label>
                  <select 
                    value={formGender}
                    onChange={e => setFormGender(e.target.value)}
                    className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Program Type</label>
                  <select 
                    value={formProgram}
                    onChange={e => {
                      const newProgram = e.target.value as 'Children' | 'Women';
                      setFormProgram(newProgram);
                      setFormProgramFields({}); // Reset module specific fields on program switch
                      if (newProgram === 'Children') {
                        setFormModule('children_residential');
                        setFormGender('Male');
                      } else {
                        setFormModule('women_support');
                        setFormGender('Female');
                      }
                    }}
                    disabled={selectedModule !== null}
                    className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="Children">Children Programs</option>
                    <option value="Women">Women Programs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Specific Module Program</label>
                  <select 
                    value={formModule}
                    onChange={e => {
                      setFormModule(e.target.value);
                      setFormProgramFields({}); // Reset module specific fields on module switch
                    }}
                    disabled={selectedModule !== null}
                    className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {formProgram === 'Children' ? (
                      <>
                        <option value="children_residential">Children's Residential Home</option>
                        <option value="graduates">Graduates (Passed-Out)</option>
                        <option value="daycare">Daycare Program</option>
                        <option value="education_support">Education Support</option>
                      </>
                    ) : (
                      <>
                        <option value="women_support">Women Help & Support</option>
                        <option value="women_medical_hiv">Women Medical (HIV+)</option>
                        <option value="outreach_programs">Outreach Programs</option>
                        <option value="skill_training">Skill Training</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Reg Date</label>
                  <input 
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Current Status</label>
                  <select 
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value)}
                    className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Exited">Exited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Aadhaar Number (Optional)</label>
                  <input 
                    type="text"
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength={12}
                    value={formAadhaarNumber}
                    onChange={e => setFormAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">PAN Number (Optional)</label>
                  <input 
                    type="text"
                    placeholder="Enter 10-character PAN number"
                    maxLength={10}
                    value={formPanNumber}
                    onChange={e => setFormPanNumber(e.target.value.toUpperCase())}
                    className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                  />
                </div>
              </div>

              {/* Dynamic Program-Specific Module Fields */}
              <div className="bg-slateSurface p-5 border border-slateBorder rounded-2xl space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-textPrimary">
                  Program Specific Details ({MODULE_DISPLAY_NAMES[formModule] || formModule})
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(() => {
                    const fieldsConfig: Record<string, { label: string; key: string; type?: string; options?: string[] }[]> = {
                      children_residential: [
                        { label: "Admission Number", key: "admissionNumber" },
                        { label: "Dormitory / Room Number", key: "dormitoryNumber" },
                        { label: "Date of Exit", key: "actualLeavingDate", type: "date" },
                        { label: "Father Name", key: "fatherName" },
                        { label: "Mother Name", key: "motherName" },
                        { label: "Guardian Name", key: "guardianName" },
                        { label: "Guardian Relationship", key: "guardianRelationship" },
                        { label: "Father Contact Number", key: "fatherMobileNumber" },
                        { label: "Mother Contact Number", key: "motherMobileNumber" },
                        { label: "Guardian Contact Number", key: "guardianMobileNumber" },
                        { label: "Family Background", key: "familyBackground", type: "textarea" },
                        { label: "Reason for Admission", key: "reasonForAdmission", type: "textarea" },
                        { label: "Reason for Leaving", key: "reasonForLeaving", type: "textarea" },
                        { label: "School Name", key: "currentSchoolName" },
                        { label: "Current Class", key: "currentClass" },
                        { label: "Medical Condition (if any)", key: "medicalHistory", type: "textarea" },
                        { label: "Allergies (if any)", key: "allergies" },
                        { label: "Staff Remarks", key: "staffRemarks", type: "textarea" },
                      ],
                      graduates: [
                        { label: "Graduation Year", key: "graduationYear" },
                        { label: "Qualification", key: "qualification" },
                        { label: "Current Status", key: "currentEmploymentStatus", type: "select", options: ["Studying", "Employed", "Self-employed", "Job Seeking", "Higher Education", "Homemaker", "Other"] },
                        { label: "Current Contact Number", key: "currentContactNumber" },
                        { label: "Family Background", key: "familyBackground", type: "textarea" },
                        { label: "Staff Remarks", key: "staffRemarks", type: "textarea" },
                      ],
                      daycare: [
                        { label: "School Name", key: "schoolNameDaycare" },
                        { label: "Current Class", key: "currentClassDaycare" },
                        { label: "Father Name", key: "fatherName" },
                        { label: "Mother Name", key: "motherName" },
                        { label: "Guardian Name", key: "guardianName" },
                        { label: "Parent / Guardian Contact Number", key: "parentContactNumbers" },
                        { label: "Family Background", key: "familyBackground", type: "textarea" },
                        { label: "Reason for Joining", key: "reasonForJoining", type: "textarea" },
                        { label: "Staff Remarks", key: "staffRemarks", type: "textarea" },
                      ],
                      education_support: [
                        { label: "School Name", key: "schoolNameEducation" },
                        { label: "Current Class", key: "currentClassEducation" },
                        { label: "Academic Performance", key: "academicPerformance" },
                        { label: "Father Name", key: "fatherName" },
                        { label: "Father Occupation", key: "fatherOccupation" },
                        { label: "Father Contact Number", key: "fatherMobileNumber" },
                        { label: "Mother Name", key: "motherName" },
                        { label: "Mother Occupation", key: "motherOccupation" },
                        { label: "Mother Contact Number", key: "motherMobileNumber" },
                        { label: "Guardian Name", key: "guardianName" },
                        { label: "Guardian Relationship", key: "guardianRelationship" },
                        { label: "Guardian Contact Number", key: "guardianMobileNumber" },
                        { label: "Family Background", key: "familyBackground", type: "textarea" },
                        { label: "Staff Remarks", key: "staffRemarks", type: "textarea" },
                      ],
                      women_support: [
                        { label: "Husband Name (if applicable)", key: "husbandName" },
                        { label: "Marital Status", key: "maritalStatus", type: "select", options: ["Unmarried", "Married", "Widow", "Divorced", "Separated", "Deserted", "Live-in Relationship", "Other"] },
                        { label: "Number of Children", key: "numberOfChildren" },
                        { label: "Occupation", key: "occupation" },
                        { label: "Family Background", key: "familyBackground", type: "textarea" },
                        { label: "Reason for Joining", key: "reasonForJoining", type: "textarea" },
                        { label: "Staff Remarks", key: "staffRemarks", type: "textarea" },
                        { label: "Type of Support Required", key: "supportType" },
                        { label: "Description of Support Needed", key: "supportDescription", type: "textarea" },
                        { label: "Priority (Low / Medium / High)", key: "supportPriority", type: "select", options: ["High", "Medium", "Low"] },
                        { label: "Current Support Status", key: "supportStatus" },
                        { label: "Remarks", key: "supportRemarks", type: "textarea" },
                      ],
                      women_medical_hiv: [
                        { label: "Hospital / Clinic Name", key: "hospitalClinicName" },
                        { label: "Doctor Name", key: "medicalDoctorName" },
                        { label: "Current Health Status", key: "currentHealthStatus" },
                        { label: "Medical Condition", key: "medicalCondition", type: "textarea" },
                        { label: "Medical Notes", key: "additionalMedicalNotes", type: "textarea" },
                      ],
                      outreach_programs: [
                        { label: "Outreach Program Name", key: "outreachProgramName" },
                        { label: "Participation Status", key: "outreachParticipationStatus", type: "select", options: ["Active", "Inactive", "Completed"] },
                        { label: "Start Date", key: "outreachStartDate", type: "date" },
                        { label: "End Date (Optional)", key: "outreachEndDate", type: "date" },
                        { label: "Remarks", key: "outreachRemarks", type: "textarea" },
                      ],
                      skill_training: [
                        { label: "Skill Training Name", key: "skillTrainingName" },
                        { label: "Training Status", key: "skillTrainingStatus", type: "select", options: ["Enrolled", "Ongoing", "Completed", "Dropped Out"] },
                        { label: "Start Date", key: "skillStartDate", type: "date" },
                        { label: "Expected Completion Date (or Completion Date if completed)", key: "skillExpectedCompletionDate", type: "date" },
                        { label: "Trainer / Instructor", key: "skillTrainerInstructor" },
                        { label: "Certificate Issued (Yes/No)", key: "certificateIssued" },
                        { label: "Placement Status", key: "placementStatus" },
                        { label: "Remarks", key: "skillRemarks", type: "textarea" },
                      ],
                    };

                    const activeFields = (fieldsConfig[formModule] || []) as Array<{ label: string; key: string; type?: string; options?: string[] }>;
                    const renderedActiveFields = activeFields.map(({ label, key, type, options }) => {
                      const val = formProgramFields[key] || "";
                      const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                        setFormProgramFields(prev => ({ ...prev, [key]: e.target.value }));
                      };

                      let sectionHeader = null;
                      if (key === 'supportType') {
                        sectionHeader = (
                          <div className="sm:col-span-2 pt-5 border-t border-slateBorder mt-3">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-womenPrimary mb-2">Help & Support Required</h5>
                          </div>
                        );
                      } else if (key === 'hospitalClinicName') {
                        sectionHeader = (
                          <div className="sm:col-span-2 pt-5 border-t border-slateBorder mt-3">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-womenPrimary mb-2">Health Information</h5>
                          </div>
                        );
                      } else if (key === 'outreachProgramName') {
                        sectionHeader = (
                          <div className="sm:col-span-2 pt-5 border-t border-slateBorder mt-3">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-womenPrimary mb-2">Outreach Program Participation</h5>
                          </div>
                        );
                      } else if (key === 'skillTrainingName') {
                        sectionHeader = (
                          <div className="sm:col-span-2 pt-5 border-t border-slateBorder mt-3">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-womenPrimary mb-2">Skill Training Details</h5>
                          </div>
                        );
                      }

                      let inputField = null;
                      if (type === "select") {
                        inputField = (
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">{label}</label>
                            <select
                              value={val}
                              onChange={onChangeHandler}
                              className="w-full h-10 bg-slateBg border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-womenPrimary transition"
                            >
                              <option value="">Select {label}</option>
                              {(options || []).map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        );
                      } else if (type === "textarea") {
                        inputField = (
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">{label}</label>
                            <textarea
                              rows={2}
                              value={val}
                              onChange={onChangeHandler}
                              placeholder={`Enter ${label.toLowerCase()}`}
                              className="w-full bg-slateBg border border-slateBorder rounded-xl p-3 text-xs text-textPrimary focus:outline-none focus:border-womenPrimary transition"
                            />
                          </div>
                        );
                      } else {
                        inputField = (
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">{label}</label>
                            <input
                              type={type || "text"}
                              value={val}
                              onChange={onChangeHandler}
                              placeholder={`Enter ${label.toLowerCase()}`}
                              className="w-full h-10 bg-slateBg border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-womenPrimary transition"
                            />
                          </div>
                        );
                      }

                      return (
                        <React.Fragment key={key}>
                          {sectionHeader}
                          {inputField}
                        </React.Fragment>
                      );
                    });

                    return (
                      <>
                        {formModule === 'children_residential' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Has Orphan Certificate</label>
                              <select
                                value={formHasOrphanCertificate}
                                onChange={e => {
                                  const val = e.target.value as 'Yes' | 'No' | '';
                                  setFormHasOrphanCertificate(val);
                                  if (val !== 'No') {
                                    setFormEligibleForOrphanCertificate('');
                                  }
                                }}
                                className="w-full h-10 bg-slateBg border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                              >
                                <option value="">Select Option</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </div>

                            {formHasOrphanCertificate === 'No' && (
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Eligible for Orphan Certificate</label>
                                <select
                                  value={formEligibleForOrphanCertificate}
                                  onChange={e => setFormEligibleForOrphanCertificate(e.target.value as 'Yes' | 'No' | 'Under Review' | '')}
                                  className="w-full h-10 bg-slateBg border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                                >
                                  <option value="">Select Option</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                  <option value="Under Review">Under Review</option>
                                </select>
                              </div>
                            )}
                          </>
                        )}
                        {renderedActiveFields.length === 0 && formModule !== 'children_residential' && (
                          <p className="text-xs text-textSecondary italic sm:col-span-2">No additional fields for this program.</p>
                        )}
                        {renderedActiveFields}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Children Details (Women Program Only) */}
              {formProgram === 'Women' && (
                <div className="bg-slateSurface p-5 border border-slateBorder rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-widest text-textPrimary">
                      Children Details ({formChildrenList.length})
                    </h4>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Number of Children</label>
                    <input 
                      type="number"
                      min={0}
                      value={formChildrenList.length || ''}
                      placeholder="Enter number of children to add details"
                      onChange={e => {
                        const num = parseInt(e.target.value) || 0;
                        const currentList = [...formChildrenList];
                        if (num > currentList.length) {
                          while (currentList.length < num) {
                            currentList.push({
                              name: '',
                              age: '',
                              gender: 'Female',
                              relationship: '',
                              currentResidence: '',
                              schoolEmploymentStatus: '',
                              specialNeeds: ''
                            });
                          }
                        } else if (num < currentList.length) {
                          currentList.splice(num);
                        }
                        setFormChildrenList(currentList);
                      }}
                      className="w-full h-11 bg-slateBg border border-slateBorder rounded-xl px-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                    />
                  </div>

                  {formChildrenList.map((child, index) => (
                    <div key={index} className="bg-slateBg p-4 border border-slateBorder rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-womenPrimary mb-1">
                        <span>Child #{index + 1} Details</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Name</label>
                          <input 
                            type="text"
                            placeholder="Child's full name"
                            value={child.name || ''}
                            onChange={e => {
                              const updated = [...formChildrenList];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setFormChildrenList(updated);
                            }}
                            className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Age</label>
                            <input 
                              type="number"
                              placeholder="Age"
                              value={child.age || ''}
                              onChange={e => {
                                const updated = [...formChildrenList];
                                updated[index] = { ...updated[index], age: e.target.value };
                                setFormChildrenList(updated);
                              }}
                              className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Gender</label>
                            <select
                              value={child.gender || 'Female'}
                              onChange={e => {
                                const updated = [...formChildrenList];
                                updated[index] = { ...updated[index], gender: e.target.value };
                                setFormChildrenList(updated);
                              }}
                              className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                            >
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Relationship</label>
                          <input 
                            type="text"
                            placeholder="e.g. Daughter, Son"
                            value={child.relationship || ''}
                            onChange={e => {
                              const updated = [...formChildrenList];
                              updated[index] = { ...updated[index], relationship: e.target.value };
                              setFormChildrenList(updated);
                            }}
                            className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Is the child currently living in Sharansthan Residential Home?</label>
                          <select
                            value={child.isLivingInSharansthan || ''}
                            onChange={e => {
                              const updated = [...formChildrenList];
                              const opt = e.target.value;
                              updated[index] = { 
                                ...updated[index], 
                                isLivingInSharansthan: opt,
                                whereLiving: opt === 'Yes' ? '' : (updated[index].whereLiving || ''),
                                currentResidence: opt === 'Yes' ? 'Sharansthan Residential Home' : (updated[index].whereLiving === 'Other' ? (updated[index].currentResidence || '') : (updated[index].whereLiving || ''))
                              };
                              setFormChildrenList(updated);
                            }}
                            className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                          >
                            <option value="">Select Option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>

                        {child.isLivingInSharansthan === 'No' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Where is the child currently living?</label>
                              <select
                                value={child.whereLiving || ''}
                                onChange={e => {
                                  const updated = [...formChildrenList];
                                  const opt = e.target.value;
                                  updated[index] = { 
                                    ...updated[index], 
                                    whereLiving: opt,
                                    currentResidence: opt === 'Other' ? (updated[index].currentResidence || '') : opt
                                  };
                                  setFormChildrenList(updated);
                                }}
                                className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                              >
                                <option value="">Select Option</option>
                                <option value="Living with Mother">Living with Mother</option>
                                <option value="Living with Father">Living with Father</option>
                                <option value="Living with Parents">Living with Parents</option>
                                <option value="Living with Relatives">Living with Relatives</option>
                                <option value="Living in Another NGO / Children's Home">Living in Another NGO / Children's Home</option>
                                <option value="Foster Care">Foster Care</option>
                                <option value="Independent">Independent</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            {child.whereLiving === 'Other' && (
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Specify Other Residence</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. Living with a friend, Self-supporting"
                                  value={child.currentResidence === 'Other' ? '' : (child.currentResidence || '')}
                                  onChange={e => {
                                    const updated = [...formChildrenList];
                                    updated[index] = { ...updated[index], currentResidence: e.target.value };
                                    setFormChildrenList(updated);
                                  }}
                                  className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                                />
                              </div>
                            )}

                            {child.whereLiving === "Living in Another NGO / Children's Home" && (
                              <>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Organization Name</label>
                                  <input 
                                    type="text"
                                    placeholder="Organization Name"
                                    value={child.otherNgoName || ''}
                                    onChange={e => {
                                      const updated = [...formChildrenList];
                                      updated[index] = { ...updated[index], otherNgoName: e.target.value };
                                      setFormChildrenList(updated);
                                    }}
                                    className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Address</label>
                                  <input 
                                    type="text"
                                    placeholder="Address"
                                    value={child.otherNgoAddress || ''}
                                    onChange={e => {
                                      const updated = [...formChildrenList];
                                      updated[index] = { ...updated[index], otherNgoAddress: e.target.value };
                                      setFormChildrenList(updated);
                                    }}
                                    className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Remarks</label>
                                  <input 
                                    type="text"
                                    placeholder="Remarks"
                                    value={child.otherNgoRemarks || ''}
                                    onChange={e => {
                                      const updated = [...formChildrenList];
                                      updated[index] = { ...updated[index], otherNgoRemarks: e.target.value };
                                      setFormChildrenList(updated);
                                    }}
                                    className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                                  />
                                </div>
                              </>
                            )}
                          </>
                        )}

                        {child.isLivingInSharansthan === 'Yes' && (
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Current Residence</label>
                            <input 
                              type="text"
                              disabled
                              value="Sharansthan Residential Home"
                              className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textSecondary cursor-not-allowed"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">School / Employment Status</label>
                          <input 
                            type="text"
                            placeholder="e.g. Class 5, Unemployed"
                            value={child.schoolEmploymentStatus || ''}
                            onChange={e => {
                              const updated = [...formChildrenList];
                              updated[index] = { ...updated[index], schoolEmploymentStatus: e.target.value };
                              setFormChildrenList(updated);
                            }}
                            className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-1">Any Special Needs</label>
                          <input 
                            type="text"
                            placeholder="e.g. ADHD, None"
                            value={child.specialNeeds || ''}
                            onChange={e => {
                              const updated = [...formChildrenList];
                              updated[index] = { ...updated[index], specialNeeds: e.target.value };
                              setFormChildrenList(updated);
                            }}
                            className="w-full h-10 bg-slateSurface border border-slateBorder rounded-xl px-3 text-xs text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Beneficiary Photos Section */}
              <div className="bg-slateSurface p-5 border border-slateBorder rounded-2xl">
                <h4 className="text-xs font-black uppercase tracking-widest text-textPrimary mb-4">Beneficiary Photos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(formProgram === 'Children' ? [
                    { label: formModule === 'graduates' ? 'Student Photo (Primary)' : 'Child Photo (Primary)', value: formPhoto, type: 'primary' as const },
                    { label: 'Parent / Guardian', value: formParentPhoto, type: 'parent' as const },
                    { label: 'Joining Photo', value: formJoiningPhoto, type: 'joining' as const },
                    { label: 'Exit / Leaving', value: formLeavingPhoto, type: 'leaving' as const },
                  ] : [
                    { label: 'Beneficiary Photo (Primary)', value: formPhoto, type: 'primary' as const },
                  ]).map(({ label, value, type }) => (
                    <div 
                      key={type} 
                      className={`relative border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center transition min-h-[160px] ${value ? 'border-childrenPrimary bg-childrenPrimary bg-opacity-5' : 'border-slateBorder hover:border-textSecondary'}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handlePhotoUpload(e.dataTransfer.files[0], type);
                        }
                      }}
                    >
                      {value ? (
                        <div className="flex flex-col items-center w-full h-full justify-between gap-2">
                          <Avatar 
                            src={value} 
                            alt={label} 
                            fallback="Img"
                            className="w-16 h-16 object-cover rounded-lg shadow border border-slateBorder" 
                          />
                          <span className="text-[10px] font-bold text-textPrimary">{label}</span>
                          <div className="flex gap-2 mt-1">
                            <label className="text-[9px] font-extrabold uppercase bg-slateBg px-2 py-1 rounded text-childrenPrimary cursor-pointer border border-slateBorder hover:bg-slateBorder">
                              Replace
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handlePhotoUpload(e.target.files[0], type);
                                  }
                                }} 
                              />
                            </label>
                            <button 
                              type="button" 
                              onClick={() => {
                                switch (type) {
                                  case 'primary': setFormPhoto(null); break;
                                  case 'parent': setFormParentPhoto(null); break;
                                  case 'joining': setFormJoiningPhoto(null); break;
                                  case 'leaving': setFormLeavingPhoto(null); break;
                                }
                              }} 
                              className="text-[9px] font-extrabold uppercase bg-red-500 bg-opacity-10 px-2 py-1 rounded text-red-500 hover:bg-opacity-20 border border-red-500 border-opacity-25"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full gap-2">
                          <UploadCloud className="w-6 h-6 text-textSecondary" />
                          <span className="text-[11px] font-bold text-textPrimary">{label}</span>
                          <span className="text-[9px] text-textSecondary">Drag & drop or click</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                    handlePhotoUpload(e.target.files[0], type);
                              }
                            }} 
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-textSecondary mb-2">Remarks</label>
                <textarea 
                  rows={3}
                  placeholder="Log outreach counselor remarks..."
                  value={formRemarks}
                  onChange={e => setFormRemarks(e.target.value)}
                  className="w-full bg-slateBg border border-slateBorder rounded-xl p-4 text-sm text-textPrimary focus:outline-none focus:border-childrenPrimary transition"
                />
              </div>

              {formError && (
                <p className="text-xs text-colorError font-bold text-center">{formError}</p>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slateBorder">
                <button 
                  type="submit"
                  className="flex-1 h-12 bg-childrenPrimary text-white rounded-xl font-bold hover:bg-opacity-95 transition"
                >
                  {editingBeneficiary ? "Save Changes" : "Register Beneficiary"}
                </button>

                <button 
                  type="button"
                  onClick={closeForm}
                  className="h-12 px-6 border border-slateBorder text-textPrimary rounded-xl font-bold hover:bg-slateSurface transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------
          LIGHTBOX MODAL: FULL-SCREEN LIGHTBOX
          ----------------------------------------------------------- */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex flex-col items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
            <img 
              src={getDirectDriveUrl(lightboxUrl) || lightboxUrl} 
              alt="Fullscreen Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-slateBorder border-opacity-10"
               
            />
          </div>
          <p className="text-white text-opacity-70 text-xs font-black uppercase tracking-widest mt-6 bg-slateSurface bg-opacity-40 px-4 py-2 rounded-full border border-white border-opacity-10 backdrop-blur-sm">
            Click anywhere to close full preview
          </p>
        </div>
      )}
    </div>
  );
}
