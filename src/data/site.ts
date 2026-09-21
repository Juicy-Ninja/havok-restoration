export const site = {
  name: 'Havok Restoration of Central PA',
  shortName: 'Havok Restoration',
  legalName: 'Havok Restoration Of Central PA',
  url: 'https://centralpa.havokrestoration.com',
  phone: '(814) 809-9833',
  phoneHref: 'tel:+18148099833',
  email: 'CentralPA@HavokRestoration.com',
  // TODO: add the street address once confirmed. It is omitted from schema while blank.
  address: {
    street: '',
    city: 'Johnstown',
    region: 'PA',
    postal: '15901',
    country: 'US',
  },
  geo: { lat: 40.3267, lng: -78.922 },
  hours: '24/7 emergency response',
  serviceRadiusMiles: 75,
  tagline: 'Fast. Clean. Local. Fair.',
  description:
    '24/7 water, fire, flood, storm, mold and biohazard damage restoration in Johnstown and all of Central Pennsylvania. IICRC-certified, insurance-approved, locally owned.',
  social: {
    facebook: 'https://www.facebook.com/',
    google: 'https://www.google.com/maps',
  },
  // Point this at your form handler (Formspree, Netlify, Basin, a CRM webhook...).
  // Leave blank and the form falls back to a pre-filled email.
  formEndpoint: '',
  founded: '2021',
};

export type Service = {
  slug: string;
  name: string;
  short: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  icon: string;
  pair?: string;
  intro: string;
  emergency: string[];
  steps: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
};

export const services: Service[] = [
  {
    slug: 'water-damage-restoration',
    name: 'Water Damage Restoration',
    short: 'Burst pipes, appliance leaks, sewage backups and roof leaks. Extracted, dried and rebuilt.',
    h1: 'Water Damage Restoration in Johnstown & Central PA',
    metaTitle: 'Water Damage Restoration Johnstown PA | 24/7 | Havok Restoration',
    metaDescription:
      '24/7 water damage restoration in Johnstown and Central PA. Burst pipes, leaks, sewage backups. IICRC-certified drying, insurance-approved, free estimates. Call (814) 809-9833.',
    icon: 'droplet',
    pair: 'pipe',
    intro:
      'Water moves fast. Within an hour it is under the flooring. Within a day it is in the drywall. Within two days mold is starting. Our crews arrive with truck-mounted extraction, commercial air movers and dehumidifiers, and thermal imaging so we find every wet pocket, not just the ones you can see.',
    emergency: [
      'Shut off the water at the main if the source is a pipe or appliance.',
      'Turn off electricity to affected rooms at the breaker if water is near outlets.',
      'Move furniture and valuables to dry areas. Slide foil or plastic under furniture legs.',
      'Photograph everything before moving it. Your adjuster will want it.',
      'Do not use a household vacuum on standing water.',
    ],
    steps: [
      { title: 'Emergency response', body: 'A technician is on the phone with you immediately and a crew is dispatched around the clock across our 75-mile service area.' },
      { title: 'Inspection & moisture mapping', body: 'We use pin and non-invasive moisture meters plus thermal cameras to document the true extent of the water migration.' },
      { title: 'Extraction & removal', body: 'Standing water is extracted. Unsalvageable materials like soaked carpet pad and drywall are removed and documented for your claim.' },
      { title: 'Drying & dehumidification', body: 'Air movers and LGR dehumidifiers are placed using IICRC S500 calculations. We monitor daily until readings hit dry standard.' },
      { title: 'Cleaning & antimicrobial', body: 'Affected surfaces are cleaned and treated to prevent mold growth and odor.' },
      { title: 'Reconstruction', body: 'Drywall, flooring, trim, paint and cabinetry are rebuilt by our in-house team so you never have to hire a second contractor.' },
    ],
    faqs: [
      { q: 'How fast do you respond to water damage in Johnstown?', a: 'We answer 24/7 and dispatch immediately. Most Johnstown, Altoona and Indiana calls see a crew on site within about 60 to 90 minutes.' },
      { q: 'Does homeowners insurance cover water damage?', a: 'Sudden and accidental water damage such as a burst pipe or appliance failure is usually covered. Gradual leaks and flooding from outside water typically are not. We document everything and bill your carrier directly when possible.' },
      { q: 'Can I dry it out myself with fans?', a: 'Household fans move air but do not remove moisture from the structure. Without dehumidification and moisture monitoring, water trapped in subfloor and wall cavities leads to mold within 48 to 72 hours.' },
    ],
    related: ['flood-damage-restoration', 'mold-remediation', 'reconstruction'],
  },
  {
    slug: 'fire-damage-restoration',
    name: 'Fire & Smoke Damage Restoration',
    short: 'Board-up, soot and smoke removal, odor elimination and full rebuild after a fire.',
    h1: 'Fire & Smoke Damage Restoration in Central Pennsylvania',
    metaTitle: 'Fire Damage Restoration Johnstown PA | Smoke & Soot Cleanup | Havok',
    metaDescription:
      'Fire and smoke damage restoration in Johnstown, Altoona, State College and Central PA. Emergency board-up, soot removal, odor elimination and rebuild. Insurance-approved. (814) 809-9833.',
    icon: 'flame',
    pair: 'fire',
    intro:
      'After the fire department leaves, the damage keeps happening. Acidic soot etches metal and glass within hours, and smoke odor soaks into everything porous. We secure the home the same day, then work room by room to clean what can be saved, remove what cannot, and rebuild it all under one roof.',
    emergency: [
      'Do not re-enter until the fire marshal clears the structure.',
      'Do not turn on utilities until they have been inspected.',
      'Avoid touching soot-covered surfaces. Skin oils set the stain.',
      'Do not attempt to wash walls or wipe soot. It smears and drives it deeper.',
      'Call us for emergency board-up and tarping to keep out weather and intruders.',
    ],
    steps: [
      { title: 'Board-up & tarping', body: 'We secure openings, tarp the roof and stabilize the structure so your insurance claim is not complicated by secondary damage.' },
      { title: 'Damage assessment', body: 'We identify what is restorable versus what needs replacement and build a line-item scope your adjuster can approve quickly.' },
      { title: 'Water removal', body: 'Firefighting water is extracted and the structure dried before soot cleanup begins.' },
      { title: 'Soot & smoke cleaning', body: 'Dry sponging, HEPA vacuuming, chemical cleaning and media blasting for framing depending on the residue type.' },
      { title: 'Odor elimination', body: 'Thermal fogging, hydroxyl generators and ozone treatment remove odor from the structure rather than masking it.' },
      { title: 'Contents & rebuild', body: 'Contents are packed out, cleaned and stored. Then our reconstruction crew rebuilds the home to pre-loss condition or better.' },
    ],
    faqs: [
      { q: 'How long does fire damage restoration take?', a: 'A small kitchen fire may take one to two weeks. A major structural fire with a full rebuild can take several months. We give you a written timeline after the assessment.' },
      { q: 'Can smoke smell be completely removed?', a: 'Yes, when the source is removed and the structure is treated with professional deodorization equipment. Masking sprays and painting over soot do not work long term.' },
      { q: 'Will you work directly with my insurance company?', a: 'Yes. We use the same estimating software as the carriers, submit documentation directly, and meet the adjuster on site.' },
    ],
    related: ['water-damage-restoration', 'reconstruction', 'storm-damage-restoration'],
  },
  {
    slug: 'flood-damage-restoration',
    name: 'Flood Damage Restoration',
    short: 'Basement flooding, river and flash flooding. Pump-out, sanitizing, drying and rebuild.',
    h1: 'Flood Damage Cleanup & Restoration in Johnstown, PA',
    metaTitle: 'Flood Damage Restoration Johnstown PA | Basement Flood Cleanup | Havok',
    metaDescription:
      'Flood cleanup in Johnstown and Central PA. Basement pump-out, contaminated water removal, sanitizing, drying and rebuild. 24/7 response. Call (814) 809-9833.',
    icon: 'waves',
    pair: 'flood',
    intro:
      'Johnstown knows floods. The Conemaugh, Stonycreek and Little Conemaugh have shaped this valley, and every spring thaw and summer storm reminds us. Flood water is Category 3 contaminated water carrying silt, sewage and chemicals, so the cleanup is different from a clean pipe break. We treat it that way.',
    emergency: [
      'Stay out of floodwater. It may be electrically charged or contaminated.',
      'Do not run the furnace or electrical systems that were submerged.',
      'Open windows if weather allows to begin ventilation.',
      'Photograph water lines on walls and any damaged belongings.',
      'Contact your insurance and ask specifically about flood coverage or an NFIP policy.',
    ],
    steps: [
      { title: 'Pump-out & extraction', body: 'Submersible pumps and truck-mount extractors remove standing water quickly and safely.' },
      { title: 'Contaminated material removal', body: 'Porous materials that touched floodwater, such as carpet, pad, drywall and insulation, are removed and disposed of properly.' },
      { title: 'Sanitizing', body: 'All remaining surfaces are cleaned and treated with EPA-registered antimicrobials.' },
      { title: 'Structural drying', body: 'Commercial drying equipment runs until the framing and slab reach dry standard, verified with moisture readings.' },
      { title: 'Mold prevention', body: 'We inspect for early growth and treat before reconstruction closes up walls.' },
      { title: 'Rebuild', body: 'Finished basements, mechanicals and living spaces are rebuilt with flood-resilient materials where you want them.' },
    ],
    faqs: [
      { q: 'Is flood damage covered by homeowners insurance?', a: 'Standard homeowners policies exclude flooding from outside water. Coverage usually requires a separate NFIP or private flood policy. Sewer backup riders can cover some basement events. We help you figure out which applies.' },
      { q: 'How soon does mold start after a flood?', a: 'Mold can begin growing within 24 to 48 hours. Fast extraction and drying is the single biggest factor in keeping the cost of a flood loss down.' },
    ],
    related: ['water-damage-restoration', 'mold-remediation', 'biohazard-cleanup'],
  },
  {
    slug: 'storm-damage-restoration',
    name: 'Storm, Wind & Ice Damage',
    short: 'Ice dams, roof leaks, fallen trees, wind and hail. Emergency tarping through full repair.',
    h1: 'Storm, Wind & Ice Dam Damage Restoration in Central PA',
    metaTitle: 'Storm & Ice Dam Damage Repair Johnstown PA | Weather Damage | Havok',
    metaDescription:
      'Storm damage restoration in Central PA. Ice dams, roof leaks, wind and tree damage, hail. Emergency tarping, water mitigation and full repair. Insurance-approved. (814) 809-9833.',
    icon: 'cloud',
    pair: 'ice',
    intro:
      'Laurel Highlands winters and Allegheny thunderstorms are hard on homes. Ice dams push meltwater under shingles and into ceilings. Wind peels roofing and drops trees. We handle the emergency tarp, the interior water damage and the permanent repair, so you are not coordinating three contractors while the ceiling drips.',
    emergency: [
      'Stay away from downed power lines and damaged trees.',
      'Place buckets and move belongings away from active leaks.',
      'Do not climb on an icy or storm-damaged roof.',
      'Photograph exterior damage from the ground and interior staining.',
      'Call us for same-day tarping and board-up to stop further water intrusion.',
    ],
    steps: [
      { title: 'Emergency tarping & board-up', body: 'We stop the water intrusion first, day or night.' },
      { title: 'Interior water mitigation', body: 'Wet insulation, ceilings and walls are dried or removed before mold sets in.' },
      { title: 'Damage documentation', body: 'Roof, siding, gutter and interior damage is photographed and scoped for your insurance claim.' },
      { title: 'Permanent repair', body: 'Roofing, siding, gutters, soffit, drywall and paint are repaired by our reconstruction team.' },
    ],
    faqs: [
      { q: 'What causes ice dams and are they covered?', a: 'Heat escaping into the attic melts snow that refreezes at the cold eave, backing water up under shingles. Resulting interior water damage is usually covered as sudden damage. We also advise on attic insulation and ventilation to prevent repeats.' },
      { q: 'Do you remove fallen trees?', a: 'We coordinate tree removal from the structure and handle every step of the building repair and interior cleanup afterward.' },
    ],
    related: ['water-damage-restoration', 'reconstruction', 'mold-remediation'],
  },
  {
    slug: 'mold-remediation',
    name: 'Mold Remediation',
    short: 'Containment, HEPA filtration, safe removal and moisture correction so it does not come back.',
    h1: 'Mold Remediation & Removal in Johnstown & Central PA',
    metaTitle: 'Mold Remediation Johnstown PA | Certified Mold Removal | Havok',
    metaDescription:
      'Certified mold remediation in Johnstown, Altoona, State College and Central PA. Containment, HEPA air scrubbing, safe removal and moisture correction. Free inspection. (814) 809-9833.',
    icon: 'shield',
    intro:
      'Mold is a moisture problem first. Our IICRC-trained technicians set up containment, run HEPA air scrubbers under negative pressure, remove affected materials and correct the moisture source so remediation is permanent.',
    emergency: [
      'Do not disturb visible mold or try to scrub large areas. This spreads spores.',
      'Turn off HVAC if mold is near returns or ducts.',
      'Keep children and anyone with respiratory conditions out of the affected area.',
      'Address the water source if you can identify it.',
    ],
    steps: [
      { title: 'Inspection & moisture source', body: 'We find where the water is coming from. Without that, mold returns.' },
      { title: 'Containment', body: 'Plastic barriers and negative air keep spores from spreading to clean rooms.' },
      { title: 'Removal', body: 'Affected drywall, insulation and finishes are bagged and removed. Framing is cleaned and treated.' },
      { title: 'Air scrubbing', body: 'HEPA filtration runs throughout to capture airborne spores.' },
      { title: 'Verification & rebuild', body: 'Post-remediation testing is available on request, then we rebuild the space.' },
    ],
    faqs: [
      { q: 'Does insurance cover mold?', a: 'Often yes when the mold resulted from a covered water event, sometimes with a sub-limit. Long-term neglect or humidity is usually excluded. We document the cause to support your claim.' },
      { q: 'Do I need mold testing?', a: 'If you can see it, you generally do not need to test before removing it. Testing is useful for hidden mold, health concerns or post-remediation clearance.' },
    ],
    related: ['water-damage-restoration', 'flood-damage-restoration', 'reconstruction'],
  },
  {
    slug: 'biohazard-cleanup',
    name: 'Biohazard & Trauma Cleanup',
    short: 'Sewage, blood and bodily fluids, crime scene and infectious contamination. Discreet and certified.',
    h1: 'Biohazard, Sewage & Trauma Scene Cleanup in Central PA',
    metaTitle: 'Biohazard Cleanup Johnstown PA | Sewage & Trauma Scene Cleaning | Havok',
    metaDescription:
      'Discreet, certified biohazard cleanup in Johnstown and Central PA. Sewage backups, blood and bodily fluids, trauma and crime scene cleaning. 24/7. Call (814) 809-9833.',
    icon: 'biohazard',
    pair: 'biohazard',
    intro:
      'Some jobs should never fall to a family. Our biohazard team arrives in unmarked vehicles when requested, works in full PPE under OSHA bloodborne pathogen protocols, and restores the space to safe, sanitary condition with dignity and discretion.',
    emergency: [
      'Do not enter or attempt to clean the area yourself.',
      'Keep pets and family members away.',
      'If law enforcement is involved, wait for the scene to be released.',
      'Call us. We will explain exactly what happens next.',
    ],
    steps: [
      { title: 'Confidential assessment', body: 'We assess the scope discreetly and explain the process in plain language.' },
      { title: 'Containment & PPE', body: 'Work zones are isolated and technicians work in full protective equipment.' },
      { title: 'Removal & disposal', body: 'Contaminated materials are removed and disposed of as regulated medical waste.' },
      { title: 'Cleaning & disinfection', body: 'Hospital-grade disinfectants are applied and verified with ATP testing.' },
      { title: 'Deodorization & rebuild', body: 'Odor is eliminated at the source and any removed structure is rebuilt.' },
    ],
    faqs: [
      { q: 'Is biohazard cleanup covered by insurance?', a: 'Most homeowners policies cover trauma scene and sewage cleanup. We bill the carrier directly whenever possible so the family does not have to manage it.' },
      { q: 'Are your technicians certified?', a: 'Yes. Our team holds IICRC and bloodborne pathogen training and follows OSHA and Pennsylvania DEP disposal regulations.' },
    ],
    related: ['unattended-death-cleanup', 'hoarding-cleanup', 'flood-damage-restoration'],
  },
  {
    slug: 'unattended-death-cleanup',
    name: 'Unattended Death Cleanup',
    short: 'Compassionate, discreet remediation after an unattended death. We handle everything.',
    h1: 'Unattended Death Cleanup in Johnstown & Central Pennsylvania',
    metaTitle: 'Unattended Death Cleanup Johnstown PA | Compassionate & Discreet | Havok',
    metaDescription:
      'Compassionate, discreet unattended death cleanup in Johnstown and Central PA. Certified technicians, unmarked vehicles, direct insurance billing. Available 24/7 at (814) 809-9833.',
    icon: 'heart',
    intro:
      'Losing someone is hard enough. When a loved one passes and is not found right away, the home needs specialized remediation that goes far beyond cleaning. We handle it quietly and completely, so the family can focus on each other.',
    emergency: [
      'Do not enter the room or attempt to clean.',
      'Wait until the coroner or law enforcement releases the scene.',
      'Call us any time. We will guide you through the next steps and the insurance process.',
    ],
    steps: [
      { title: 'Private consultation', body: 'One point of contact walks you through everything. No pressure, no jargon.' },
      { title: 'Certified remediation', body: 'Biological material is removed, affected flooring and subfloor are replaced as needed, and the area is disinfected.' },
      { title: 'Odor removal', body: 'Professional deodorization eliminates odor from the structure and contents.' },
      { title: 'Restoration', body: 'The space is rebuilt so no trace of the event remains.' },
    ],
    faqs: [
      { q: 'Will neighbors know?', a: 'We arrive in unmarked vehicles on request and our team never discusses the job. Discretion is part of the service.' },
      { q: 'Who pays for this?', a: 'Homeowners insurance typically covers it. We work directly with the carrier and the estate or family.' },
    ],
    related: ['biohazard-cleanup', 'hoarding-cleanup', 'reconstruction'],
  },
  {
    slug: 'hoarding-cleanup',
    name: 'Hoarding Cleanup',
    short: 'Respectful, judgment-free cleanouts with sorting, hauling, sanitizing and repairs.',
    h1: 'Hoarding Cleanup & Cleanout Services in Central PA',
    metaTitle: 'Hoarding Cleanup Johnstown PA | Respectful Cleanout Services | Havok',
    metaDescription:
      'Respectful hoarding cleanup in Johnstown and Central PA. Sorting, hauling, deep cleaning, biohazard removal and repairs. We work with families and social services. (814) 809-9833.',
    icon: 'home',
    pair: 'hoarding',
    intro:
      'Hoarding is a health and safety issue, not a character flaw. We work with families, caregivers, property managers and social service agencies to restore homes safely, keep what matters, and treat the resident with respect throughout.',
    emergency: [
      'Do not force a cleanout on a resident without support. We can coordinate with counselors and family.',
      'Watch for structural, fire and pest hazards before entering.',
      'Call us for a free, no-judgment walk-through.',
    ],
    steps: [
      { title: 'Compassionate planning', body: 'We meet the family and resident, set goals and identify items to keep, donate or discard.' },
      { title: 'Sorting & removal', body: 'Our team sorts and removes with the resident involved as much as they want to be.' },
      { title: 'Biohazard & pest cleanup', body: 'Animal waste, mold, sharps and pests are handled under proper protocols.' },
      { title: 'Deep clean & repair', body: 'Sanitizing, odor removal, and repair of floors, walls and plumbing damaged over time.' },
    ],
    faqs: [
      { q: 'How long does a hoarding cleanout take?', a: 'Most homes take two to five days depending on volume and any biohazard conditions.' },
      { q: 'Do you help with the resident?', a: 'We coordinate with family and mental health professionals and never shame or rush the resident.' },
    ],
    related: ['biohazard-cleanup', 'mold-remediation', 'reconstruction'],
  },
  {
    slug: 'reconstruction',
    name: 'Reconstruction & Rebuild',
    short: 'Licensed in-house rebuild after any loss. Drywall, flooring, roofing, kitchens, full rebuilds.',
    h1: 'Restoration Reconstruction & Rebuild Services in Central PA',
    metaTitle: 'Restoration Reconstruction Johnstown PA | Rebuild After Damage | Havok',
    metaDescription:
      'Full-service reconstruction after water, fire and storm damage in Johnstown and Central PA. One contractor from cleanup to final coat of paint. Insurance-approved. (814) 809-9833.',
    icon: 'hammer',
    intro:
      'Mitigation stops the damage. Reconstruction gives you your home back. Because our rebuild team is in-house, there is no gap between drying and rebuilding, no second estimate to fight over with your adjuster, and one person accountable for the whole job.',
    emergency: [],
    steps: [
      { title: 'Scope & estimate', body: 'Line-item estimate in the same format your carrier uses, so approval is fast.' },
      { title: 'Material selection', body: 'We help you choose finishes that match or upgrade what you had.' },
      { title: 'Construction', body: 'Framing, drywall, insulation, flooring, cabinetry, roofing, siding, paint and trim.' },
      { title: 'Final walk-through', body: 'We walk every room with you and close out the claim with the carrier.' },
    ],
    faqs: [
      { q: 'Can I upgrade during the rebuild?', a: 'Yes. Insurance pays to restore what you had. Many homeowners add upgrades at that time and pay only the difference.' },
      { q: 'Are you licensed and insured?', a: 'Yes. We are a registered Pennsylvania home improvement contractor and carry full liability and workers compensation coverage.' },
    ],
    related: ['water-damage-restoration', 'fire-damage-restoration', 'storm-damage-restoration'],
  },
];

export type Pair = {
  label: string;
  title: string;
  blurb: string;
  before: string;
  after: string;
  altBefore: string;
  altAfter: string;
  service: string;
};

export const pairs: Record<string, Pair> = {
  fire: {
    label: 'Fire & Smoke',
    title: 'Living room after a house fire',
    blurb: 'Soot on every surface, charred ceiling, smoke in the studs. Cleaned, deodorized and rebuilt.',
    before: '/images/before-after/fire-before.jpg',
    after: '/images/before-after/fire-after.jpg',
    altBefore: 'Living room with heavy soot and fire damage before restoration',
    altAfter: 'Same living room fully restored with fresh paint and refinished floors',
    service: 'fire-damage-restoration',
  },
  flood: {
    label: 'Flood',
    title: 'Finished basement after a flash flood',
    blurb: 'Six inches of contaminated water. Pumped out, sanitized, dried to standard and refinished.',
    before: '/images/before-after/flood-before.jpg',
    after: '/images/before-after/flood-after.jpg',
    altBefore: 'Flooded finished basement with standing water before cleanup',
    altAfter: 'Same basement dried and rebuilt with new flooring and walls',
    service: 'flood-damage-restoration',
  },
  pipe: {
    label: 'Burst Pipe',
    title: 'Kitchen after a burst supply line',
    blurb: 'Collapsed ceiling, buckled floors, saturated cabinets. Dried, rebuilt and back in service.',
    before: '/images/before-after/pipe-before.jpg',
    after: '/images/before-after/pipe-after.jpg',
    altBefore: 'Kitchen with collapsed ceiling and water damage from a burst pipe',
    altAfter: 'Same kitchen restored with repaired ceiling and new flooring',
    service: 'water-damage-restoration',
  },
  ice: {
    label: 'Ice Dam & Storm',
    title: 'Home after severe ice dam damage',
    blurb: 'Ice backed under the shingles and into the ceilings. Tarped, dried, roof and gutters repaired.',
    before: '/images/before-after/ice-before.jpg',
    after: '/images/before-after/ice-after.jpg',
    altBefore: 'House exterior with ice dam, icicles and sagging gutter before repair',
    altAfter: 'Same house with repaired roofline, new gutters and clean soffit',
    service: 'storm-damage-restoration',
  },
  biohazard: {
    label: 'Biohazard',
    title: 'Bathroom after a sewage backup',
    blurb: 'Category 3 contamination. Removed, disinfected, verified clean and rebuilt.',
    before: '/images/before-after/biohazard-before.jpg',
    after: '/images/before-after/biohazard-after.jpg',
    altBefore: 'Bathroom with sewage contamination and biohazard tape before cleanup',
    altAfter: 'Same bathroom sanitized and restored with new fixtures',
    service: 'biohazard-cleanup',
  },
  hoarding: {
    label: 'Hoarding',
    title: 'Bedroom after a hoarding cleanout',
    blurb: 'Years of accumulation cleared with the family involved. Cleaned, repaired and livable again.',
    before: '/images/before-after/hoarding-before.jpg',
    after: '/images/before-after/hoarding-after.jpg',
    altBefore: 'Bedroom filled with hoarded items before cleanout',
    altAfter: 'Same bedroom cleared, cleaned and restored',
    service: 'hoarding-cleanup',
  },
};

export type Area = {
  slug: string;
  name: string;
  county: string;
  zip: string;
  driveTime: string;
  lat: number;
  lng: number;
  blurb: string;
  local: string;
  neighborhoods: string[];
};

export const areas: Area[] = [
  {
    slug: 'johnstown', name: 'Johnstown', county: 'Cambria County', zip: '15901', driveTime: 'Headquarters', lat: 40.3267, lng: -78.922,
    blurb: 'Our home base. Fastest response in the region for Johnstown, Westmont, Richland and the surrounding boroughs.',
    local: "Johnstown sits at the confluence of the Stonycreek and Little Conemaugh rivers, and the valley has a long memory of high water. Older housing stock in Cambria City, Moxham and Kernville means aging plumbing, slate roofs and stone foundations that take on water in spring thaw. Our crews are based here, so we are often on site in under an hour.",
    neighborhoods: ['Westmont', 'Richland Township', 'Moxham', 'Cambria City', 'Kernville', 'Southmont', 'Geistown', 'Ferndale', 'Windber', 'Ebensburg'],
  },
  {
    slug: 'altoona', name: 'Altoona', county: 'Blair County', zip: '16601', driveTime: '~50 min', lat: 40.5187, lng: -78.3947,
    blurb: 'Water, fire and storm restoration across Altoona, Hollidaysburg, Duncansville and Blair County.',
    local: "Altoona's railroad-era neighborhoods are full of brick doubles and balloon-framed homes where a small kitchen fire or upstairs leak travels fast through open wall cavities. Heavy upslope snow on the Allegheny Front makes ice dams a yearly problem in Logan Township and Hollidaysburg.",
    neighborhoods: ['Hollidaysburg', 'Duncansville', 'Logan Township', 'Bellwood', 'Tyrone', 'Roaring Spring'],
  },
  {
    slug: 'state-college', name: 'State College', county: 'Centre County', zip: '16801', driveTime: '~1 hr 30 min', lat: 40.7934, lng: -77.86,
    blurb: 'Restoration for homeowners, landlords and student housing in State College and Centre County.',
    local: "Between rental turnover, high-density student housing and Centre County's newer subdivisions, State College sees a lot of appliance and supply-line water losses plus sewage backups in older borough properties. We work with property managers on fast turnarounds between leases.",
    neighborhoods: ['Bellefonte', 'Boalsburg', 'Lemont', 'Park Forest', 'Pine Grove Mills', 'Port Matilda'],
  },
  {
    slug: 'indiana', name: 'Indiana', county: 'Indiana County', zip: '15701', driveTime: '~1 hr', lat: 40.6215, lng: -79.1525,
    blurb: 'Water, mold and fire damage restoration in Indiana, PA and surrounding Indiana County communities.',
    local: "Indiana borough's mix of century-old homes near IUP and rural properties on well and septic brings frequent basement flooding, sump pump failures and sewage backups. We also serve the mining-era communities of Homer City, Blairsville and Clymer.",
    neighborhoods: ['White Township', 'Homer City', 'Blairsville', 'Clymer', 'Saltsburg', 'Marion Center'],
  },
  {
    slug: 'greensburg', name: 'Greensburg', county: 'Westmoreland County', zip: '15601', driveTime: '~1 hr', lat: 40.3015, lng: -79.5389,
    blurb: 'Full-service damage restoration for Greensburg, Hempfield and eastern Westmoreland County.',
    local: "Greensburg and Hempfield Township have everything from 1900s brick homes downtown to 1970s ranches with finished basements that flood when summer storms overwhelm storm drains. We also handle a large share of Westmoreland County fire and smoke losses.",
    neighborhoods: ['Hempfield Township', 'Latrobe', 'Youngwood', 'Mount Pleasant', 'Irwin', 'Ligonier'],
  },
  {
    slug: 'jeannette', name: 'Jeannette', county: 'Westmoreland County', zip: '15644', driveTime: '~1 hr', lat: 40.328, lng: -79.6156,
    blurb: 'Water and fire damage restoration in Jeannette and the Penn-Trafford area.',
    local: "The Glass City's tight rows of early-1900s homes share walls and roofs, so a fire or roof leak on one property often affects the neighbor. We respond fast and coordinate with multiple owners and carriers when needed.",
    neighborhoods: ['Penn Township', 'Harrison City', 'Manor', 'Adamsburg', 'Grapeville'],
  },
  {
    slug: 'new-kensington', name: 'New Kensington', county: 'Westmoreland County', zip: '15068', driveTime: '~1 hr 20 min', lat: 40.5698, lng: -79.7648,
    blurb: 'Restoration and cleanup services for New Kensington, Arnold, Lower Burrell and the Alle-Kiski Valley.',
    local: "Along the Allegheny River, New Kensington and Arnold see river-driven basement flooding and aging combined sewer backups. Our team handles Category 3 water cleanup and full rebuilds throughout the Alle-Kiski Valley.",
    neighborhoods: ['Arnold', 'Lower Burrell', 'Vandergrift', 'Tarentum', 'Plum'],
  },
  {
    slug: 'butler', name: 'Butler', county: 'Butler County', zip: '16001', driveTime: '~1 hr 45 min', lat: 40.8612, lng: -79.8953,
    blurb: 'Storm, water and fire damage restoration for Butler and Butler County homeowners.',
    local: "Butler County's rapid growth in Cranberry and Mars means newer construction with finished basements, while Butler city itself has older housing stock. Wind and hail storms coming across the Ohio border hit this area hard every summer.",
    neighborhoods: ['Butler Township', 'Saxonburg', 'Cranberry Township', 'Mars', 'Zelienople', 'Slippery Rock'],
  },
  {
    slug: 'uniontown', name: 'Uniontown', county: 'Fayette County', zip: '15401', driveTime: '~1 hr 20 min', lat: 39.9001, lng: -79.7164,
    blurb: 'Water, mold, biohazard and fire damage restoration in Uniontown and Fayette County.',
    local: "Fayette County's coal-patch towns and Uniontown's historic districts have older homes with cellar foundations that wick moisture and slate roofs that fail at the flashing. We see a lot of long-term water intrusion turning into mold, and handle full remediation and rebuild.",
    neighborhoods: ['Connellsville', 'Brownsville', 'Masontown', 'Hopwood', 'Fairchance', 'Perryopolis'],
  },
];

export const testimonials = [
  { name: 'Emily J.', town: 'Westmont', service: 'Water damage', quote: 'A pipe let go upstairs on a Sunday night and water was pouring through the dining room ceiling. Havok had a crew here in under an hour. They dealt with our insurance adjuster directly and I honestly never had to argue about anything. The rebuild looks better than before.' },
  { name: 'Mark T.', town: 'Altoona', service: 'Property manager', quote: "I manage 40 units across Blair County. When a tenant's dishwasher flooded three apartments, they had drying equipment in every unit the same afternoon and had us back in service in nine days. They are my only call now." },
  { name: 'James R.', town: 'Indiana', service: 'Mold remediation', quote: 'We found mold behind the basement paneling after buying an old house. They set up containment so nothing spread, showed me the moisture readings every step, and fixed the drainage issue that caused it. Zero smell, zero regrowth two years later.' },
  { name: 'Diane S.', town: 'Greensburg', service: 'Fire damage', quote: 'After our kitchen fire I thought we would lose everything to the smoke smell. They boarded up the same night, packed out our belongings, and the odor is completely gone. They treated our home like it was theirs.' },
];

export const insurers = ['State Farm', 'Erie Insurance', 'Allstate', 'Nationwide', 'Farmers', 'Liberty Mutual', 'Travelers', 'USAA', 'Chubb', 'American Family', 'Progressive', 'Penn National'];
