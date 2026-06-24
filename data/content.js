/* ============================================================
   Vivartam — all editable content & sample data.
   Edit copy, dates, people, affirmations, etc. here.
   Loaded before the app; exposed as window.VIVARTAM.
   (network-data.js provides window.VIVARTAM_NETWORK, used below.)
   ============================================================ */
window.VIVARTAM = window.VIVARTAM || {};

/* Milestones tab — timeline, planned future events, meetings, contacts */
window.VIVARTAM.data = {
      timeline: [
        { id: 't1', title: 'Vivartam crosses 1,000 users', date: '2026-06-18', type: 'major', desc: 'First real traction milestone — organic growth from building in public on LinkedIn.' },
        { id: 't2', title: 'Closed pre-seed angel round', date: '2026-05-30', type: 'major', desc: 'Raised ₹40L from three angels in Bengaluru.' },
        { id: 't3', title: 'Launched the public beta', date: '2026-05-12', type: 'minor', desc: 'Opened the waitlist to 300 early users.' },
        { id: 't4', title: 'Hired first engineer', date: '2026-04-28', type: 'minor', desc: '' },
        { id: 't5', title: 'Incorporated Vivartam Tech Private Limited', date: '2026-03-15', type: 'major', desc: 'Registered as a private limited in Bengaluru.' },
        { id: 't6', title: 'First line of code', date: '2026-02-02', type: 'minor', desc: '' },
      ],
      future: [
        { id: 'f1', title: 'Investor call — Blume Ventures', date: '2026-06-27', priority: 'high', location: 'Bengaluru', owner: 'both', prep: 'Send the updated metrics one-pager beforehand and rehearse the ask.' },
        { id: 'f2', title: 'Demo Day — Antler cohort', date: '2026-06-30', priority: 'high', location: 'Bengaluru', owner: 'vivek', prep: 'Finalize the 8-slide deck and rehearse the 3-minute pitch.' },
        { id: 'f3', title: 'Product Hunt launch', date: '2026-07-09', priority: 'medium', location: 'Online', owner: 'mirat', prep: 'Line up the hunter, prep the first comment and gallery assets.' },
        { id: 'f4', title: 'SaaSBoomi annual', date: '2026-07-22', priority: 'low', location: 'Chennai', owner: 'both', prep: 'Book travel to Chennai; shortlist 5 founders to meet.' },
      ],
      meetings: [
        { id: 'm1', title: '1:1 with mentor', person: 'Ananya Rao', date: '2026-06-26', notes: 'Review the GTM plan for Q3.', status: 'upcoming' },
        { id: 'm2', title: 'Design sync', person: 'Karthik Menon', date: '2026-06-25', notes: 'Finalize the dashboard v2 layout.', status: 'upcoming' },
        { id: 'm3', title: 'Angel intro call', person: 'Rohan Gupta', date: '2026-06-12', notes: 'Verbal commit of ₹15L.', status: 'completed' },
        { id: 'm4', title: 'Customer interview', person: 'Priya Sharma', date: '2026-06-08', notes: 'Feature request: Slack export.', status: 'completed' },
      ],
      contacts: (window.VIVARTAM_NETWORK || []),
    };

/* Future events — region rings (Ahmedabad → India) */
window.VIVARTAM.discoverRings = [
      { key: 'ahmedabad', label: 'Ahmedabad', sub: 'Your home base' },
      { key: 'gandhinagar', label: 'Gandhinagar', sub: 'GIFT City \u00b7 PDEU' },
      { key: 'nearby', label: 'Nearby cities', sub: 'Vadodara \u00b7 Anand \u00b7 Nadiad' },
      { key: 'gujarat', label: 'Gujarat', sub: 'Surat \u00b7 Rajkot' },
      { key: 'india', label: 'Across India', sub: 'Bengaluru \u00b7 Mumbai \u00b7 Delhi' },
    ];

/* Future events — curated discovery feed */
window.VIVARTAM.discoverEvents = [
      // Ahmedabad
      { id: 'd1', title: 'TiE Ahmedabad \u2014 Founder Connect', org: 'TiE Ahmedabad', city: 'Ahmedabad', ring: 'ahmedabad', date: '2026-06-27', type: 'Networking', desc: 'Monthly founder mixer with investors and operators across Gujarat.' },
      { id: 'd2', title: 'Startup Saturday Ahmedabad', org: 'Headstart Network', city: 'Ahmedabad', ring: 'ahmedabad', date: '2026-06-28', type: 'Meetup', desc: 'Open community meetup \u2014 pitch practice and peer feedback.' },
      { id: 'd3', title: 'SaaS founders roundtable', org: 'Cygnet.one + community', city: 'Ahmedabad', ring: 'ahmedabad', date: '2026-07-04', type: 'Roundtable', desc: 'Closed-room SaaS GTM discussion for early-stage founders.' },
      { id: 'd4', title: 'AI in HR \u2014 practitioner meetup', org: 'PeopleGeeks Ahmedabad', city: 'Ahmedabad', ring: 'ahmedabad', date: '2026-07-11', type: 'Meetup', desc: 'CHROs and HR-tech builders \u2014 directly relevant to your ICP.' },
      // Gandhinagar
      { id: 'd5', title: 'GIFT City FinTech & DeepTech Summit', org: 'GIFT City', city: 'Gandhinagar', ring: 'gandhinagar', date: '2026-07-02', type: 'Summit', desc: 'Flagship summit at GIFT City \u2014 your future office base.' },
      { id: 'd6', title: 'PDEU Innovation Demo Day', org: 'PDEU IIC', city: 'Gandhinagar', ring: 'gandhinagar', date: '2026-07-15', type: 'Demo Day', desc: 'Student & alumni startups demo \u2014 hiring and partnership pool.' },
      // Nearby
      { id: 'd7', title: 'Vadodara Startup Meetup', org: 'StartupVadodara', city: 'Vadodara', ring: 'nearby', date: '2026-07-05', type: 'Meetup', desc: 'Growing founder community an hour from Ahmedabad.' },
      { id: 'd8', title: 'Anand Agri-tech founders mixer', org: 'AAU incubation', city: 'Anand', ring: 'nearby', date: '2026-07-18', type: 'Networking', desc: 'Agri & rural-tech founders \u2014 adjacent HR/workforce problems.' },
      // Gujarat
      { id: 'd9', title: 'Surat Startup Summit', org: 'SSIP Gujarat', city: 'Surat', ring: 'gujarat', date: '2026-07-12', type: 'Summit', desc: 'State-backed summit \u2014 diamond & textile industry HR scale.' },
      { id: 'd10', title: 'Rajkot Entrepreneurs Forum', org: 'GESIA', city: 'Rajkot', ring: 'gujarat', date: '2026-07-26', type: 'Forum', desc: 'Manufacturing-heavy SME forum \u2014 factory-HR buyers.' },
      { id: 'd11', title: 'Vibrant Gujarat \u2014 Startup track (preview)', org: 'Govt. of Gujarat', city: 'Gandhinagar', ring: 'gujarat', date: '2026-08-05', type: 'Conference', desc: 'Pre-event for the flagship investment summit.' },
      // India
      { id: 'd12', title: 'SaaSBoomi Annual', org: 'SaaSBoomi', city: 'Chennai', ring: 'india', date: '2026-07-22', type: 'Conference', desc: "India's largest SaaS founder community event." },
      { id: 'd13', title: 'Nasscom Product Conclave', org: 'Nasscom', city: 'Bengaluru', ring: 'india', date: '2026-08-12', type: 'Conference', desc: 'Product & enterprise-buyer access at national scale.' },
      { id: 'd14', title: 'People Matters TechHR India', org: 'People Matters', city: 'Gurugram', ring: 'india', date: '2026-08-20', type: 'Expo', desc: "India's biggest HR-tech expo \u2014 every CHRO under one roof." },
    ];

/* Future events — Ahmedabad incubation centres */
window.VIVARTAM.incubators = [
      { id: 'i1', name: 'CIIE.CO', org: 'IIM Ahmedabad', focus: 'Seed funding \u00b7 accelerators', next: { title: 'Bharat Inclusion seed cohort \u2014 applications', date: '2026-07-10' } },
      { id: 'i2', name: 'iCreate', org: 'Intl. Centre for Entrepreneurship & Tech', focus: 'Deeptech \u00b7 hardware \u00b7 SaaS', next: { title: 'iAccelerate demo day', date: '2026-07-17' } },
      { id: 'i3', name: 'CrAdLE', org: 'EDII Ahmedabad', focus: 'Early-stage \u00b7 incubation', next: { title: 'Founder office hours', date: '2026-06-30' } },
      { id: 'i4', name: 'GUSEC', org: 'Gujarat University', focus: 'Student & early founders', next: { title: 'Open house + pitch night', date: '2026-07-08' } },
      { id: 'i5', name: 'AIC Ahmedabad University', org: 'Atal Innovation Mission', focus: 'Pre-seed \u00b7 grants', next: { title: 'Cohort 6 info session', date: '2026-07-14' } },
      { id: 'i6', name: 'Venture Studio', org: 'Ahmedabad University', focus: 'Design-led ventures', next: { title: 'Studio mixer', date: '2026-07-21' } },
    ];

/* Meetings — anchor mentor */
window.VIVARTAM.mentor = { name: 'Rohan Shah', role: 'Startup mentor', cadence: 'Every alternate Saturday', location: 'Ahmedabad', anchor: '2026-06-20' };

/* Meetings — seeded mentor session notes */
window.VIVARTAM.mentorSeeds = {
      '2026-06-20': { notes: 'Walked through the CHRO outreach funnel and our pricing thinking. Reviewed the 52-contact tracker.', learning: 'Anchor pricing to the outcome (hours of HR time saved), not features. Always ask for the pilot, never the sale.' },
      '2026-06-06': { notes: 'Discussed fundraising readiness and what a clean pre-seed story looks like.', learning: 'Raise on traction, not on the deck. Sign 5 design partners before opening the seed conversation.' },
      '2026-05-23': { notes: 'Co-founder operating cadence and how to divide ownership cleanly.', learning: 'Split owner areas sharply — Vivek on product, Mirat on growth — and keep one weekly written review.' },
      '2026-05-09': { notes: 'Positioning against ATS incumbents and where not to compete.', learning: "Own the 'company brain for people leaders' wedge. Don't get dragged into feature parity on ATS basics." },
      '2026-04-25': { notes: 'First mentorship session — set the relationship and goals.', learning: 'Pick the one metric that matters this quarter. For now it is design partners signed.' },
    };

/* Habits — founders, habit lists, Rule of 3 */
window.VIVARTAM.habitsData = [
      { key: 'vivek', name: 'Vivek Dagur', role: 'Product & Engineering', color: 'var(--steel)', streak: 24, week: [1, 1, 1, 0, 1, 1, 1],
        rule3: ['Finalize the Blume metrics one-pager', 'Ship dashboard v2 to the beta group', 'Follow up with 2 angels'],
        habits: [
          { id: 'workout', name: '1 hour workout / yoga', icon: 'workout', cat: 'rule', streak: 12 },
          { id: 'meditation', name: '1 hour meditation', icon: 'meditation', cat: 'rule', streak: 24 },
          { id: 'reading', name: '1 hour reading', icon: 'reading', cat: 'rule', streak: 9 },
          { id: 'pranayama', name: 'Pranayama', icon: 'breathe', cat: 'personal', streak: 30 },
          { id: 'diary', name: 'Write daily diary', icon: 'edit', cat: 'personal', streak: 18 },
          { id: 'newspaper', name: 'Read newspaper in the library', icon: 'news', cat: 'personal', streak: 6 },
          { id: 'flute', name: 'Play flute \u00b7 10 min', icon: 'music', cat: 'personal', streak: 4 },
          { id: 'cad', name: 'Read a CAD / CAE article', icon: 'gear', cat: 'entre', streak: 11 },
          { id: 'nvidia', name: 'Read an NVIDIA blog post', icon: 'monitor', cat: 'entre', streak: 15 },
          { id: 'events', name: 'Check startup events', icon: 'calendar', cat: 'entre', streak: 22 },
        ] },
      { key: 'mirat', name: 'Mirat Soni', role: 'Growth & Operations', color: '#8A5CC4', streak: 18, week: [1, 0, 1, 1, 1, 1, 0],
        rule3: ['Draft the Product Hunt launch copy', 'Reply to 5 user interviews', 'Book SaaSBoomi travel'],
        habits: [
          { id: 'workout', name: '1 hour workout / yoga', icon: 'workout', cat: 'rule', streak: 8 },
          { id: 'meditation', name: '1 hour meditation', icon: 'meditation', cat: 'rule', streak: 14 },
          { id: 'reading', name: '1 hour reading', icon: 'reading', cat: 'rule', streak: 18 },
          { id: 'diary', name: 'Write daily diary', icon: 'edit', cat: 'personal', streak: 10 },
          { id: 'newspaper', name: 'Read newspaper in the library', icon: 'news', cat: 'personal', streak: 5 },
          { id: 'nvidia', name: 'Read an NVIDIA blog post', icon: 'monitor', cat: 'entre', streak: 9 },
          { id: 'events', name: 'Check startup events', icon: 'calendar', cat: 'entre', streak: 16 },
        ] },
    ];

/* Affirmations — default content (3 sections) */
window.VIVARTAM.affirmDefaults = {
      guidelines: [
        { title: 'Spend 30 min in library', subs: ['Discover new ideas', 'Stay updated on latest happenings'] },
        { title: 'Focus on Government Schemes for Grants', subs: ['Build knowledge about available schemes', 'Track due dates and deadlines'] },
        { title: 'Watch Shark Tank videos', subs: ['Study pitches, investor questions, and business models'] },
        { title: 'Study business case studies', subs: ['Learn from both successes and failures'] },
        { title: 'Maintain a learning notebook', subs: ['Startup learnings & insights', 'AI tools & Design Thinking frameworks'] },
        { title: 'Maintain a networking notebook', subs: ['Record contacts, conversations, and follow-ups'] },
        { title: "The 3 Factors of Success \u2014 3M's", subs: ['Money \u2014 financial fuel and resource management', 'Market \u2014 know your customer and competition', 'Mindset \u2014 the foundation everything else is built on'] },
        { title: 'Use TRIZ & LEAN model effectively', subs: ['Systematic innovation and waste elimination'] },
        { title: 'If a product fails during testing', subs: ['Empathize deeply with users, then iterate fast'] },
      ],
      mindset: [
        { title: 'Everything happens twice', subs: ['First in the mind', 'Then in reality', 'Power of visualization \u2014 see it before you build it'] },
        { title: 'Apart from what you want to achieve, everything else is noise', subs: ['Guard your attention ruthlessly', 'Say no to distractions, say yes to priorities'] },
        { title: 'Watch your thoughts', subs: ['Keep what matters \u2014 nurture growth-oriented thinking', 'Remove noise \u2014 let go of fear, doubt, and distraction'] },
      ],
      execution: [
        { title: 'Read one CAD/CAE article daily', subs: ['Stay sharp on engineering tools and industry trends'] },
        { title: 'Post one article weekly on LinkedIn', subs: ['Build your professional brand and share your expertise'] },
        { title: 'Explore guest lecture opportunities', subs: ['Teach, connect, and establish authority'] },
        { title: 'Read NVIDIA blogs', subs: ['blogs.nvidia.com', 'Stay ahead of AI, GPU, and computing breakthroughs'] },
      ],
    };

/* Vision board — 13 shared manifestations */
window.VIVARTAM.visions = [
      { id: 1, tag: 'Career', hint: 'Office in GIFT City', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', text: 'Vivartam Tech Private Limited has a thriving office in GIFT City', affirmation: 'Our base of innovation is established in India\u2019s smartest city.' },
      { id: 2, tag: 'Career', hint: 'Our own cabins', img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', text: 'Vivek & Mirat have dedicated cabins in our own office', affirmation: 'Our team has the space to think, create, and lead.' },
      { id: 3, tag: 'Global', hint: 'Customer visits', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', text: 'Vivek & Mirat travel internationally for customer visits', affirmation: 'Our solutions are valued across borders.' },
      { id: 4, tag: 'Global', hint: 'Global customers', img: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=800&q=80', text: 'Vivartam Tech Private Limited has a growing base of international customers', affirmation: 'Vivartam Tech Private Limited serves clients across the globe.' },
      { id: 5, tag: 'Lifestyle', hint: 'Trekking trip', img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80', text: 'Vivek & Mirat go on trekking adventures together', affirmation: 'We celebrate life and success beyond the office walls.' },
      { id: 6, tag: 'Lifestyle', hint: 'Morning meditation', img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80', text: 'Vivek & Mirat meditate together every morning', affirmation: 'A grounded team builds a grounded company.' },
      { id: 7, tag: 'Lifestyle', hint: 'Gym together', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', text: 'Vivek & Mirat work out at the gym together regularly', affirmation: 'Strong bodies fuel sharp minds and bold ideas.' },
      { id: 8, tag: 'Achievement', hint: 'Flagship product', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', text: 'Vivek & Mirat stand proudly beside our flagship products', affirmation: 'Our products are beautiful, powerful, and loved by millions.' },
      { id: 9, tag: 'Achievement', hint: 'IIM Ahmedabad', img: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80', text: 'Vivartam Tech Private Limited is incubated at IIM Ahmedabad', affirmation: 'India\u2019s premier institution backs our vision.' },
      { id: 10, tag: 'Inspiration', hint: 'On the TED stage', img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80', text: 'Vivek & Mirat give TED talks on innovation and entrepreneurship', affirmation: 'Our ideas are spreading and inspiring the world.' },
      { id: 11, tag: 'Achievement', hint: 'Harvard lecture', img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80', text: 'Vivek & Mirat deliver a guest lecture at Harvard', affirmation: 'We share our journey with the brightest minds in the world.' },
      { id: 12, tag: 'Achievement', hint: 'National stage', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', text: 'Vivek & Mirat are recognised at a national innovation event', affirmation: 'Our work earns recognition at the highest levels.' },
      { id: 13, tag: 'Inspiration', hint: 'On Shark Tank', img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80', text: 'Vivek & Mirat present Vivartam Tech Private Limited on Shark Tank', affirmation: 'The world sees our vision and believes in our mission.' },
    ];

