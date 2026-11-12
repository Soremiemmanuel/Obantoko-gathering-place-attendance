export const UNITS = [
  "Apete Branch",
  "Abiola way Ward",
  "Apena Branch",
  "Alabata Branch",
  "Camp ward",
  "Obantoko Ward",
  "Odeda Ward",
  "kugba ward",
  "Other",
];

export const EVENTS = [
  {
    id: "driving-class",
    title: "Driving Class",
    subtitle: "ROAD SAFETY & SKILLS",
    description: "Practical driving instruction and road safety training for young adults.",
    badge: "SPECIAL TRAINING",
    image: "/assets/driving.jpg",
    icon: "car",
    date: "2026-10-02",
  },
  {
    id: "movie-night",
    title: "Movie Night",
    subtitle: "ENTERTAINMENT & FELLOWSHIP",
    description: "A fun evening of watching uplifting movies with friends.",
    badge: "SOCIAL EVENT",
    image: "/assets/movie.jpg",
    icon: "film",
    date: "2026-10-03",
  },
  {
    id: "devotional",
    title: "Devotional",
    subtitle: "STAKE GATHERING",
    description: "A special time for spiritual instruction and edification.",
    badge: "SPECIAL EVENT",
    image: "/assets/devotional.jpg",
    icon: "book",
    date: "2026-10-04",
  },
  {
    id: "missionary-departure",
    title: "Missionary Departure",
    subtitle: "DEPARTING & RETURNING",
    description: "Check-in for missionaries departing for or returning from the field.",
    badge: "SPECIAL EVENT",
    image: "/assets/missionary-departure.jpg",
    icon: "plane",
    date: "2026-10-05",
  },
  {
    id: "missionary-prep",
    title: "Missionary Prep",
    subtitle: "PROSPECTIVE MISSIONARIES",
    description: "Specialized preparation class for future full-time missionaries.",
    badge: "SATURDAY",
    image: "/assets/missionary-prep.jpg",
    icon: "globe",
  date: "2026-10-06",
  },
  {
    id: "institute-religion",
    title: "Institute of Religion",
    subtitle: "GENERAL ASSEMBLY",
    description: "Weekly spiritual instruction and social gathering for all YSAs.",
    badge: "FRIDAY",
    image: "/assets/institute-religion.jpg",
    icon: "book",
    //date: "2026-10-09",
  },
  {
    id: "institute-cluster",
    title: "Institute Cluster",
    //subtitle: "ODEDA, OBANTOKO & KUTO",
    description: "Localized institute gatherings for brethren and sisters in cluster areas.",
    badge: "THURSDAY",
    image: "/assets/institute-cluster.jpg",
    icon: "users",
  date: "2026-10-08",
  },
  {
    id: "skills-acquisition",
    title: "Skills Acquisition",
    subtitle: "VOCATIONAL TRAINING",
    description: "Hands-on workshops including Barbing, ICT, Catering, and more.",
    badge: "WEEKLY",
    image: "/assets/institute-cluster.jpg",
    icon: "users",
    date: "2026-10-07",
  },
];

export function getEvent(id) {
  return EVENTS.find((event) => event.id === id) || EVENTS[0];
}

export function formatDate(value) {
  const d = new Date(`${value}T12:00:00`);
  return d.toLocaleDateString("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
