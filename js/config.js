/* ============ CONFIG — yahin se sab settings badlo ============ */

// 1) Firebase (OPTIONAL). Khali chhodoge to app "Local mode" me chalega
//    (same browser ke tabs ke beech data share hota hai — demo ke liye theek).
//    Alag-alag phones/laptops par live tracking chahiye to Firebase config paste karo (README dekho).
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};

window.APP_CONFIG = {
  appName: "CampusBus",
  collegeName: "Your College",                 // <- apne college ka naam
  college: { lat: 18.4527, lng: 73.8582 },     // <- map ka default center
  staleAfterSec: 30,        // itne second se purani location "outdated" maani jayegi
  defaultSpeedKmh: 25,      // jab bus ki speed pata na ho to ETA ke liye
  // Demo logins (class project). Real product me Firebase Auth use karte.
  users: [
    { username: "student", password: "student123", role: "student", name: "Student" },
    { username: "driver",  password: "driver123",  role: "driver",  name: "Bus Driver" },
    { username: "admin",   password: "admin123",   role: "admin",   name: "Transport Admin" }
  ]
};
