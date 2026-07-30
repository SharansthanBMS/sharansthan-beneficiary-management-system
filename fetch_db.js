import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDiVoG9FmFRC0VDTDmke-FIr5PMDQ0pCyA",
  authDomain: "sharansthan-student-management.firebaseapp.com",
  projectId: "sharansthan-student-management",
  storageBucket: "sharansthan-student-management.firebasestorage.app",
  messagingSenderId: "301574856280",
  appId: "1:301574856280:web:cf00c7497efbfeb922f42d",
  measurementId: "G-JERVJ2CPLJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collectionGroup(db, 'children_residential'), limit(5));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const data = doc.data();
    if (data.profilePhoto || data.photoUrl) {
       console.log('ID:', doc.id);
       console.log('profilePhoto:', JSON.stringify(data.profilePhoto));
       console.log('photoUrl:', data.photoUrl);
    }
  });
  
  process.exit(0);
}
run();
