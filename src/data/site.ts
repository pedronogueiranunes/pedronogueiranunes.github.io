// Fill these later. Empty URLs render as unavailable text, never as fake destinations.
export const site = {
  // Blog off until real posts exist: hides nav, footer and home links and stops
  // building /thoughts pages. Set to true to bring it all back.
  blogEnabled: false,
  email: "pedronogueiranunes@gmail.com",
  bookingUrl: "",
  cvUrl: "/assets/Pedro_Nogueira_CV_2026_EN.pdf",
  sampleProposalUrl: "",
  socials: {
    dribbble: "https://dribbble.com/pedronogueira",
    linkedin: "https://www.linkedin.com/in/pedronogueiranunes/",
    vimeo: "https://vimeo.com/suprfluidmotion",
    youtube: "https://www.youtube.com/@PedroNogueiranunes",
    email: "mailto:pedronogueiranunes@gmail.com",
  },
  legal: { notice: "", privacy: "", cookies: "" },
  projectUrls: {
    "pinelake-broken-bow": "",
    "green-nation-collective": "https://greennationcollective.webflow.io/",
    "molina-chambo": "",
    "bsa-legal": "",
    "waipono-farms": "",
    "lemmbra-olympiad": "",
  } as Record<string, string>,
  availability: "Booking projects for November", // TODO: confirm current availability before publishing.
};
