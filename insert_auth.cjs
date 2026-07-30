const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const authCode = `
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
`;

const lines = code.split('\n');
const index = lines.findIndex(line => line.includes('}, [toastMessage]);'));

if (index !== -1) {
  lines.splice(index + 1, 0, authCode);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log('Inserted auth logic.');
} else {
  console.log('Could not find insert point.');
}
