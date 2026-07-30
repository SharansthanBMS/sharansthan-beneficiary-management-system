fetch("https://drive.google.com/uc?export=view&id=1FYc0v451L2TNLiGV-7XKZZPPaBoemw5X", {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  }
}).then(res => {
  console.log(res.status, res.headers.get("content-type"));
}).catch(console.error);
