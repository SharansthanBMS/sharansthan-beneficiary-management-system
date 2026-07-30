import { getDirectDriveUrl } from "./utils/imageUtils";
import jsPDF from 'jspdf';

const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/jpeg");
            resolve(dataURL);
        };
        img.onerror = error => reject(error);
        img.src = url;
        
        // Timeout after 5 seconds to prevent hanging
        setTimeout(() => reject(new Error("Timeout")), 5000);
    });
};

export const generatePdfReport = async (records: any[], center: string, module: string, program: string, fromDate: string, toDate: string) => {
    console.log('generatePdfReport');
    const doc = new jsPDF();
    
    if (!records || records.length === 0) {
        doc.text("No records found to generate report.", 20, 20);
        doc.save(`Sharansthan_Report_${Date.now()}.pdf`);
        return;
    }
    
    const dateStr = new Date().toLocaleString();
    let catStr = "All Categories";
    if (module) catStr = module;
    else if (program) catStr = `${program} Programs`;

    for (let i = 0; i < records.length; i++) {
        if (i > 0) {
            doc.addPage();
        }
        
        const b = records[i];
        
        // --- Header ---
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(33, 0, 93); // Dark purple
        doc.text("SHARANSTHAN", 105, 25, { align: "center" });
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Beneficiary Management System", 105, 33, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        let dateRangeStr = "";
        if (fromDate || toDate) {
            dateRangeStr = `   |   Date Range: ${fromDate || 'Any'} to ${toDate || 'Any'}`;
        }
        doc.text(`Generated: ${dateStr}   |   Center: ${b.center || center || 'N/A'}   |   Category: ${b.moduleType || catStr}${dateRangeStr}`, 105, 40, { align: "center" });
        
        // Line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, 190, 45);
        
        // --- 1. Personal Details ---
        let y = 55;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("1. Personal Details", 20, y);
        
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        
        const col1 = 20;
        const col2 = 110;
        const rowHeight = 8;
        
        const printField = (label: string, value: any, x: number, yPos: number) => {
            doc.setFont("helvetica", "bold");
            doc.text(`${label}:`, x, yPos);
            doc.setFont("helvetica", "normal");
            const textVal = (value || "N/A").toString();
            doc.text(textVal, x + 35, yPos);
        };
        
        printField("Full Name", b.name, col1, y);
        printField("Gender", b.gender, col2, y);
        y += rowHeight;
        
        printField("Date of Birth", b.dateOfBirth, col1, y);
        printField("Age", b.age, col2, y);
        y += rowHeight;
        
        printField("Joining Date", b.date, col1, y);
        printField("Center", b.center, col2, y);
        y += rowHeight;
        
        printField("Category", b.moduleType, col1, y);
        printField("Status", b.status, col2, y);
        y += rowHeight;
        
        printField("Phone Number", b.guardianMobileNumber || b.mobileNumber || b.contactNumber, col1, y);
        printField("Address", b.address, col2, y);
        y += rowHeight;
        
        // --- 2. Parent / Guardian Details ---
        y += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("2. Parent / Guardian Details", 20, y);
        
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        printField("Parent Name", b.guardianName || b.parentName, col1, y);
        printField("Parent Phone", b.guardianMobileNumber || b.parentPhone, col2, y);
        y += rowHeight;
        printField("Occupation", b.guardianOccupation || b.occupation || b.parentOccupation, col1, y);
        y += rowHeight;
        
        // --- 3. Additional Information ---
        y += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("3. Additional Information", 20, y);
        
        y += 10;
        doc.setFontSize(10);
        
        const printLongField = (label: string, value: any, yPos: number) => {
            doc.setFont("helvetica", "bold");
            doc.text(`${label}:`, 20, yPos);
            doc.setFont("helvetica", "normal");
            const lines = doc.splitTextToSize((value || "N/A").toString(), 140);
            doc.text(lines, 55, yPos);
            return yPos + (lines.length * 5) + 3;
        };
        
        y = printLongField("Education", b.education || b.schoolName || b.schoolEmploymentStatus, y);
        y = printLongField("Background", b.background || b.familyBackground || b.caseHistory, y);
        y = printLongField("Medical Details", b.medicalDetails || b.healthStatus || b.specialNeeds, y);
        y = printLongField("Remarks", b.remarks, y);
        
        // --- 4. Photos ---
        y += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("4. Photos", 20, y);
        
        y += 10;
        const photos = [
            { label: "Profile Photo", url: b.profilePhoto?.thumbnailUrl || b.photoUrl },
            { label: "Parent Photo", url: b.parentPhoto?.thumbnailUrl || b.parentPhotoUrl },
            { label: "Joining Photo", url: b.joiningPhoto?.thumbnailUrl || b.joiningPhotoUrl },
            { label: "Exit Photo", url: b.leavingPhoto?.thumbnailUrl || b.leavingPhotoUrl },
        ];
        
        let xOffset = 20;
        for (const p of photos) {
            if (p.url) {
                try {
                    let base64 = p.url;
                    if (!base64.startsWith("data:image")) {
                        const proxiedUrl = getDirectDriveUrl(p.url) || p.url;
                        base64 = await getBase64ImageFromURL(proxiedUrl);
                    }
                    doc.addImage(base64, "JPEG", xOffset, y, 35, 35);
                    doc.setFontSize(8);
                    doc.text(p.label, xOffset + 17.5, y + 40, { align: "center" });
                    xOffset += 40;
                } catch (e) {
                    console.log("Failed to load image", p.label, e);
                    // Placeholder for failed load
                    doc.setDrawColor(200, 200, 200);
                    doc.rect(xOffset, y, 35, 35);
                    doc.setFontSize(8);
                    doc.text("No Image", xOffset + 17.5, y + 17.5, { align: "center" });
                    doc.text(p.label, xOffset + 17.5, y + 40, { align: "center" });
                    xOffset += 40;
                }
            }
        }
        
        // Page number at bottom
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`SHARANSTHAN | Page ${i + 1} of ${records.length}`, 105, 285, { align: "center" });
    }
    
    console.log('before doc.save');
    doc.save(`Sharansthan_Report_${Date.now()}.pdf`);
};
