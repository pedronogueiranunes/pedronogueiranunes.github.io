const recordedProjects = new Set(["pemberton-personal-injury", "joshua-branch-law", "amanda-demanda-dreamers-scholarship", "issa-castro-atlanta", "green-nation-collective", "pinelake-broken-bow", "molina-chambo", "bsa-legal", "waipono-farms", "lemmbra-olympiad", "fertili-product-web", "dither-lab"]);
export const videoFor = (slug: string) => recordedProjects.has(slug) ? `/assets/project-videos/${slug}` : undefined;

// Scroll videos made from full-page screenshots (scripts/screenshot-to-webm.sh) are WebM; the screen recordings are MP4.
const webmProjects = new Set(["pemberton-personal-injury", "joshua-branch-law", "amanda-demanda-dreamers-scholarship", "issa-castro-atlanta"]);
export const videoExt = (base: string) => webmProjects.has(base.split("/").pop()!) ? "webm" : "mp4";
