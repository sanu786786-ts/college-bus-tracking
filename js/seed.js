/* Starting data. Coordinates Pune ke aas-paas ke approx hain —
   admin panel se apne college ke asli routes/stops edit kar sakte ho. */
window.SEED_ROUTES = [
  {
    id: "r1", order: 1, name: "Route 1 — Swargate → College", color: "#f59e0b", active: true,
    timings: ["07:30", "08:30", "16:30", "17:30"],
    stops: [
      { name: "Swargate",     lat: 18.5018, lng: 73.8636, time: "07:30" },
      { name: "Mukund Nagar", lat: 18.4925, lng: 73.8620, time: "07:38" },
      { name: "Bibwewadi",    lat: 18.4767, lng: 73.8627, time: "07:46" },
      { name: "Katraj",       lat: 18.4575, lng: 73.8650, time: "07:55" },
      { name: "College Gate", lat: 18.4527, lng: 73.8582, time: "08:05" }
    ]
  },
  {
    id: "r2", order: 2, name: "Route 2 — Hadapsar → College", color: "#10b981", active: true,
    timings: ["07:15", "08:15", "16:45"],
    stops: [
      { name: "Hadapsar",     lat: 18.5089, lng: 73.9259, time: "07:15" },
      { name: "Wanowrie",     lat: 18.4950, lng: 73.8970, time: "07:28" },
      { name: "Kondhwa",      lat: 18.4730, lng: 73.8890, time: "07:42" },
      { name: "College Gate", lat: 18.4527, lng: 73.8582, time: "08:00" }
    ]
  },
  {
    id: "r3", order: 3, name: "Route 3 — Kothrud → College", color: "#6366f1", active: true,
    timings: ["07:00", "08:00", "17:00"],
    stops: [
      { name: "Kothrud Depot", lat: 18.5074, lng: 73.8077, time: "07:00" },
      { name: "Navi Peth",     lat: 18.5060, lng: 73.8470, time: "07:15" },
      { name: "Sahakar Nagar", lat: 18.4830, lng: 73.8590, time: "07:32" },
      { name: "College Gate",  lat: 18.4527, lng: 73.8582, time: "07:50" }
    ]
  }
];
