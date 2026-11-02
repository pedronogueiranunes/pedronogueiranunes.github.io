const recordedProjects = new Set(["green-nation-collective", "pinelake-broken-bow", "molina-chambo", "bsa-legal", "waipono-farms", "lemmbra-olympiad", "fertili-product-web"]);
export const videoFor = (slug: string) => recordedProjects.has(slug) ? `/assets/project-videos/${slug}` : undefined;
