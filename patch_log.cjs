const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    if (selectedBeneficiaryDetail) {
      console.log("profilePhoto", selectedBeneficiaryDetail.profilePhoto);
      console.log("profilePhoto.originalUrl", selectedBeneficiaryDetail.profilePhoto?.originalUrl);
      console.log("profilePhoto.thumbnailUrl", selectedBeneficiaryDetail.profilePhoto?.thumbnailUrl);
      console.log("photoUrl", selectedBeneficiaryDetail.photoUrl);
    }
  }, [selectedBeneficiaryDetail]);
`;

if (!code.includes('console.log("profilePhoto"')) {
  code = code.replace(/const \[selectedBeneficiaryDetail, setSelectedBeneficiaryDetail\] = useState<Beneficiary \| null>\(null\);/, 
    'const [selectedBeneficiaryDetail, setSelectedBeneficiaryDetail] = useState<Beneficiary | null>(null);\n' + effectCode);
  fs.writeFileSync('src/App.tsx', code);
}
