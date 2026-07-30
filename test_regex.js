const url = "https://drive.google.com/uc?export=view&id=1FYc0v451L2TNLiGV-7XKZZPPaBoemw5X";
let match = null;
if (url.includes('drive.google.com') && url.includes('id=')) {
  match = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    console.log(`https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`);
  }
}
