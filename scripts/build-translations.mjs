import fs from 'node:fs';
const locales=['pt-br','es','fr'];
const rows=fs.readFileSync(new URL('../src/i18n/translations.tsv',import.meta.url),'utf8').trimEnd().split('\n').map((line,i)=>{
 const row=line.split('\t'); if(row.length!==4||row.some(s=>!s))throw new Error(`Invalid translation row ${i+1}`);return row;
});
const messages=Object.fromEntries(locales.map(l=>[l,{}]));
for(const [key,...values] of rows)for(let i=0;i<3;i++){
 if(messages[locales[i]][key])throw new Error(`Duplicate translation: ${key}`);
 messages[locales[i]][key]=values[i];
}
const titles=[
 ['BSA Legal: corporate website','BSA Legal: site institucional','BSA Legal: sitio corporativo','BSA Legal : site institutionnel'],
 ['Green Nation Collective: campaign launch','Green Nation Collective: lançamento da campanha','Green Nation Collective: lanzamiento de campaña','Green Nation Collective : lancement de campagne'],
 ['Lemmbra Olympiad: identity and registration','Lemmbra Olympiad: identidade e inscrições','Lemmbra Olympiad: identidad e inscripción','Lemmbra Olympiad : identité et inscriptions'],
 ['Molina Chambô: law firm website','Molina Chambô: site de advocacia','Molina Chambô: sitio de abogados',"Molina Chambô : site de cabinet d'avocats"],
 ['PineLake Broken Bow: luxury cabin rentals','PineLake Broken Bow: aluguel de cabanas de luxo','PineLake Broken Bow: alquiler de cabañas de lujo','PineLake Broken Bow : location de chalets de luxe'],
 ['Waipono Farms: brand and website','Waipono Farms: marca e site','Waipono Farms: marca y sitio web','Waipono Farms : marque et site web'],
];
const altWebsite=['site','sitio web','site web'];const altPreview=['prévia do site','vista previa de la web','aperçu du site web'];
for(const [en,...tr]of titles)for(let i=0;i<3;i++){
 const d=messages[locales[i]];d[en]=tr[i];d[en+' website']=tr[i]+' · '+altWebsite[i];d[en+' website preview']=tr[i]+' · '+altPreview[i];d[en+' | Pedro Nogueira']=tr[i]+' | Pedro Nogueira';d['View case study: '+en]=d['View case study']+': '+tr[i];
}
for(const locale of locales){const d=messages[locale];for(const en of ['About','Contact','Projects','Services','How to structure a design system without overdoing it','Motion design for corporate websites','What I learned working with agencies in the US']) d[en+' | Pedro Nogueira']=d[en]+' | Pedro Nogueira';
 for(const en of ['How to structure a design system without overdoing it','Motion design for corporate websites','What I learned working with agencies in the US'])d['Read '+en]=d.Read+' '+d[en];
 for(const en of ['"Our agency has more work than senior hands."','"Our site is slow and a pain to update."','"People visit, but nobody books."'])d['Services for: '+en]=d.Services+': '+d[en];
 fs.writeFileSync(new URL(`../src/i18n/${locale}.json`,import.meta.url),JSON.stringify(d,null,2)+'\n');
}
console.log(`Generated ${Object.keys(messages.fr).length} translations per locale.`);
