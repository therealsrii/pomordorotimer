/* ==========================================================================
   MET Art Focus Timer - Application Logic (Fullscreen & Dynamic Reveal)
   ========================================================================== */

// Configuration
const FOCUS_DURATION_DEFAULT = 25 * 60; // 25 minutes
const BREAK_DURATION_DEFAULT = 5 * 60;  // 5 minutes

// Query param debug option (?debug=true sets timer to 15s focus, 5s break)
const urlParams = new URLSearchParams(window.location.search);
const IS_DEBUG = urlParams.get('debug') === 'true';

const FOCUS_DURATION = IS_DEBUG ? 15 : FOCUS_DURATION_DEFAULT;
const BREAK_DURATION = IS_DEBUG ? 5 : BREAK_DURATION_DEFAULT;

// Curated list of high-quality Met Open Access painting IDs (Fallback dataset)
const CURATED_ARTWORKS = [
  { id: 436535, title: "Wheat Field with Cypresses", artist: "Vincent van Gogh", date: "1889", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-42549-001.jpg" },
  { id: 436529, title: "Self-Portrait with a Straw Hat", artist: "Vincent van Gogh", date: "1887", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP130961.jpg" },
  { id: 436528, title: "Irises", artist: "Vincent van Gogh", date: "1890", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-20082-001.jpg" },
  { id: 437133, title: "Water Lilies", artist: "Claude Monet", date: "1919", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-15003-001.jpg" },
  { id: 437127, title: "Bridge over a Pond of Water Lilies", artist: "Claude Monet", date: "1899", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-15001-001.jpg" },
  { id: 437131, title: "The Parc Monceau", artist: "Claude Monet", date: "1878", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP318843.jpg" },
  { id: 437397, title: "Aristotle with a Bust of Homer", artist: "Rembrandt van Rijn", date: "1653", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-24151-001.jpg" },
  { id: 437396, title: "Self-Portrait", artist: "Rembrandt van Rijn", date: "1660", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14350-001.jpg" },
  { id: 437879, title: "Study of a Young Woman", artist: "Johannes Vermeer", date: "ca. 1665–67", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-1454-001.jpg" },
  { id: 437877, title: "Allegory of the Catholic Faith", artist: "Johannes Vermeer", date: "ca. 1670–72", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-1451-001.jpg" },
  { id: 437430, title: "By the Seashore", artist: "Auguste Renoir", date: "1883", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14815-001.jpg" },
  { id: 437434, title: "Madame Georges Charpentier and Her Children", artist: "Auguste Renoir", date: "1878", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14822-001.jpg" },
  { id: 436253, title: "View of Toledo", artist: "El Greco", date: "ca. 1599–1600", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-13139-001.jpg" },
  { id: 437658, title: "Circus Sideshow (Parade de cirque)", artist: "Georges Seurat", date: "1887–88", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-17117-001.jpg" },
  { id: 436819, title: "Mada Primavesi", artist: "Gustav Klimt", date: "1912", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-12501-001.jpg" },
  { id: 45434,  title: "Under the Wave off Kanagawa (The Great Wave)", artist: "Katsushika Hokusai", date: "ca. 1830–32", imageUrl: "https://images.metmuseum.org/CRDImages/as/original/DP130155.jpg" },
  { id: 435882, title: "The Card Players", artist: "Paul Cézanne", date: "1890–92", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP312322.jpg" },
  { id: 435883, title: "Still Life with Apples and a Pot of Primroses", artist: "Paul Cézanne", date: "ca. 1890", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP312323.jpg" },
  { id: 438015, title: "Madame X (Madame Pierre Gautreau)", artist: "John Singer Sargent", date: "1883–84", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14286-001.jpg" },
  { id: 438023, title: "The Wyndham Sisters", artist: "John Singer Sargent", date: "1899", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14289-001.jpg" },
  { id: 436139, title: "The Dance Class", artist: "Edgar Degas", date: "1874", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP312000.jpg" },
  { id: 436151, title: "Woman in a Tub", artist: "Edgar Degas", date: "1886", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14979-001.jpg" },
  { id: 437508, title: "The Repast of the Lion", artist: "Henri Rousseau", date: "ca. 1907", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-15822-001.jpg" },
  { id: 437310, title: "The Boulevard Montmartre on a Winter Morning", artist: "Camille Pissarro", date: "1897", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14571-001.jpg" },
  { id: 435848, title: "The Cup of Tea", artist: "Mary Cassatt", date: "1879", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-15332-001.jpg" },
  { id: 436947, title: "Boating", artist: "Édouard Manet", date: "1874", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-16982-001.jpg" },
  { id: 437654, title: "The Channel at Gravelines, Evening", artist: "Georges Seurat", date: "1890", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-17120-001.jpg" },
  { id: 436252, title: "The Opening of the Fifth Seal", artist: "El Greco", date: "1608–14", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-13137-001.jpg" },
  { id: 335805, title: "Studies for the Libyan Sibyl", artist: "Michelangelo Buonarroti", date: "ca. 1510–11", imageUrl: "https://images.metmuseum.org/CRDImages/dp/original/DP375081.jpg" },
  { id: 341857, title: "Head of a Muse", artist: "Raphael (Raffaello Sanzio)", date: "ca. 1508", imageUrl: "https://images.metmuseum.org/CRDImages/dp/original/DP810777.jpg" },
  { id: 435826, title: "The Musicians", artist: "Caravaggio (Michelangelo Merisi)", date: "1595", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-13350-001.jpg" },
  { id: 435728, title: "Madonna Adoring the Child with Two Angels", artist: "Sandro Botticelli", date: "ca. 1490", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-15814-001.jpg" },
  { id: 436838, title: "The Fortune Teller", artist: "Georges de La Tour", date: "ca. 1630", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-19600-001.jpg" },
  { id: 437869, title: "Juan de Pareja", artist: "Diego Velázquez", date: "1650", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-20516-001.jpg" },
  { id: 10497,  title: "The Oxbow", artist: "Thomas Cole", date: "1836", imageUrl: "https://images.metmuseum.org/CRDImages/lh/original/DP-23214-001.jpg" }
];

// App State
let state = {
  mode: 'idle', // 'idle', 'focus', 'break', 'paused'
  totalDuration: FOCUS_DURATION,
  remainingSeconds: FOCUS_DURATION,
  timerInterval: null,
  currentArt: null,
  pendingArt: null, // Preloaded next art details
  artChoiceNextSession: 'change', // 'change' or 'keep'
  snappedCorner: 'corner-top-left', // Snapped corner position
  snappedReflectionCorner: 'corner-center-bottom' // Snapped reflection corner position
};

// DOM Elements
const fullscreenBgBlur = document.getElementById('fullscreenBgBlur');
const fullscreenBgContain = document.getElementById('fullscreenBgContain');
const whiteOverlay = document.getElementById('whiteOverlay');
const darkOverlay = document.getElementById('darkOverlay');

const timerCard = document.getElementById('timerCard');
const timerModeBadge = document.getElementById('timerModeBadge');
const timerDisplay = document.getElementById('timerDisplay');
const progressRing = document.getElementById('progressRing');

const btnPlayPause = document.getElementById('btnPlayPause');
const btnReset = document.getElementById('btnReset');
const btnSkip = document.getElementById('btnSkip');

const reflectionCard = document.getElementById('reflectionCard');
const reflectionInput = document.getElementById('reflectionInput');
const btnSubmitReflection = document.getElementById('btnSubmitReflection');

const artworkDetailsCapsule = document.getElementById('artworkDetailsCapsule');
const artworkPlaceholderMini = document.getElementById('artworkPlaceholderMini');
const artworkDetailsContent = document.getElementById('artworkDetailsContent');
const artTitle = document.getElementById('artTitle');
const artMeta = document.getElementById('artMeta');

const appHeaderFloating = document.querySelector('.app-header-floating');

const galleryDrawer = document.getElementById('galleryDrawer');
const btnGalleryToggle = document.getElementById('btnGalleryToggle');
const btnGalleryClose = document.getElementById('btnGalleryClose');
const galleryContent = document.getElementById('galleryContent');

/* ==========================================================================
   Initialisation
   ========================================================================== */
function init() {
  setupEventListeners();
  setupDragAndDrop();
  updateTimerDisplay();
  setProgress(100);
  loadGallery();
  
  // Select a random masterpiece locally for instant welcome load on reload!
  const randomItem = CURATED_ARTWORKS[Math.floor(Math.random() * CURATED_ARTWORKS.length)];
  state.currentArt = randomItem;
  
  // Display it immediately without blocking on network queries
  displayArtwork(state.currentArt);
}

function setupEventListeners() {
  btnPlayPause.addEventListener('click', togglePlayPause);
  btnReset.addEventListener('click', resetTimer);
  btnSkip.addEventListener('click', handleSkip);
  btnSubmitReflection.addEventListener('click', submitReflection);
  
  btnGalleryToggle.addEventListener('click', toggleGallery);
  btnGalleryClose.addEventListener('click', toggleGallery);
}

/* ==========================================================================
   MET API & Art Curating
   ========================================================================== */

async function fetchNextArtwork() {
  showArtLoading();
  try {
    const randomItem = CURATED_ARTWORKS[Math.floor(Math.random() * CURATED_ARTWORKS.length)];
    const artObj = await fetchArtworkDetails(randomItem.id);
    if (artObj && artObj.imageUrl) {
      displayArtwork(artObj);
    } else {
      throw new Error("Curated fetch returned empty");
    }
  } catch (error) {
    console.warn("Met API error. Loading curated fallback.", error);
    loadCuratedFallback();
  }
}

async function fetchArtworkDetails(objectId) {
  const objectUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`;
  try {
    const response = await fetch(objectUrl);
    if (!response.ok) return null;
    const data = await response.json();
    
    const imageUrl = data.primaryImage || data.primaryImageSmall;
    if (!imageUrl) return null;
    
    return {
      id: objectId,
      title: data.title || "Untitled",
      artist: data.artistDisplayName || "Unknown Artist",
      date: data.objectDate || "Unknown Date",
      medium: data.medium || "Unknown Medium",
      imageUrl: imageUrl,
      culture: data.culture || "Unknown Culture",
      dimensions: data.dimensions || "Unknown Dimensions",
      department: data.department || "Unknown Department",
      creditLine: data.creditLine || "Curated Met Collection",
      objectURL: data.objectURL || ""
    };
  } catch {
    return null;
  }
}

async function loadCuratedFallback() {
  const item = CURATED_ARTWORKS[Math.floor(Math.random() * CURATED_ARTWORKS.length)];
  const artObj = await fetchArtworkDetails(item.id);
  if (artObj) {
    displayArtwork(artObj);
  } else {
    displayArtwork({
      title: item.title,
      artist: item.artist,
      date: item.date,
      medium: "Oil on canvas",
      imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-42549-001.jpg",
      culture: "European",
      dimensions: "Not specified",
      department: "European Paintings",
      creditLine: "Curated Met Collection Fallback",
      objectURL: `https://www.metmuseum.org/art/collection/search/${item.id}`
    });
  }
}

function displayArtwork(artObj) {
  state.currentArt = artObj;
  
  // Set fullscreen background image instantly (let browser load it progressively!)
  fullscreenBgBlur.style.backgroundImage = `url('${artObj.imageUrl}')`;
  fullscreenBgContain.style.backgroundImage = `url('${artObj.imageUrl}')`;
  
  // Reveal text details and commentary bubble instantly (0ms delay)
  artworkPlaceholderMini.style.display = 'none';
  artworkDetailsContent.style.display = 'block';
  
  artTitle.textContent = artObj.title;
  artMeta.textContent = `${artObj.artist} (${artObj.date})`;
  
  // Set poetic hover commentary text instantly from local masterpieces database
  const commentary = getCreativeCommentary(artObj);
  const bubble = document.getElementById('artContextBubble');
  if (commentary) {
    document.getElementById('artContextText').textContent = commentary;
    bubble.style.display = 'block';
  } else {
    bubble.style.display = 'none';
  }
  
  preloadNextArtCache();
}

function getCreativeCommentary(artObj) {
  if (!artObj) return "";
  
  const id = Number(artObj.id);

  // High-fidelity curated database mapping Met Object ID to poetic commentaries
  const commentaryDatabase = {
    436535: "Painted from his asylum window in Saint-Rémy, Van Gogh saw this landscape as a symbol of life's eternal cycles. His heavy, spiraling brushwork makes the wheat feel like a golden sea and the cypresses like dark green flames reaching for the sky.",
    436529: "Van Gogh painted this self-portrait in Paris using intense, radiating brushstrokes of orange, blue, and yellow to capture his mental state. The straw hat represents his rural painter identity, contrasting with his piercing, turbulent gaze.",
    436528: "Painted in the hospital garden at Saint-Rémy, Van Gogh's Irises burst with fluid, Japanese-woodblock-inspired contours. He called it 'the lightning conductor for my illness,' finding sanity in the wild, expressive growth of nature.",
    437133: "Monet's late Water Lilies reject classical perspective. By focusing entirely on the water's surface, he merges sky, cloud reflections, and lily pads into an infinite tapestry of color, inviting a weightless, meditative trance.",
    437127: "Monet's iconic wooden footbridge arching over his Giverny lily pond shows his obsession with light and water reflections. The lush, weeping willows and floating colors dissolve into a sensory dream of quiet nature.",
    437131: "Monet captures the dappled sunlight filtering through the trees of a Parisian park. The soft, feathered strokes of green and gold create a liquid atmosphere, celebrating the light-hearted leisure of modern French life.",
    437397: "Rembrandt uses deep, golden chiaroscuro to dramatize a silent dialogue between the philosopher Aristotle and the ancient poet Homer. The philosopher's hand rests on the bust, reflecting on the tension between worldly wealth and spiritual genius.",
    437396: "Painted in 1660, this self-portrait shows Rembrandt in his fifties—weathered, bankrupt, yet intensely dignified. His deep, honest gaze and thick, textured skin paint a moving portrait of human resilience and artistic pride.",
    437879: "Vermeer's subject turns to face us with a quiet, enigmatic gaze. Her light, pearlescent shawl reflects a domestic window glow, transforming a simple portrait into a mysterious, frozen moment of human consciousness.",
    437877: "A rare, complex allegory by Vermeer. He places a woman in a quiet Delft interior, surrounded by religious symbols. The scene glows with his signature soft daylight, rendering mystical theological concepts with domestic intimacy.",
    437430: "Renoir captures a serene, breezy moment on the coast. He blends the subject with the soft, impressionistic sea and sky behind her. Art lovers are often struck by the warmth in her face, embodying Renoir's celebration of quiet leisure and human beauty.",
    437434: "This grand portrait established Renoir's success. He paints a wealthy Parisian salon filled with Japanese screens, soft fabrics, and children. The glowing faces and fluid brushwork exude a warm, happy sense of domestic luxury.",
    436253: "El Greco rejects realistic color to paint Toledo under a dark, apocalyptic sky. The city glows with a spectral, mystical light, expressing a spiritual state rather than a physical place.",
    437658: "Seurat's pointillist masterpiece is made of millions of tiny color dots. He arranges the musicians in a strict, geometric layout under artificial gaslight, creating a surreal, silent atmosphere that makes a noisy street circus feel like a solemn ritual.",
    436819: "Klimt surrounds nine-year-old Mada with vibrant floral patterns and active colors. Her confident, hands-on-hips stance radiates a youthful, defiant energy that jumps off the canvas.",
    45434: "Hokusai's iconic woodblock print pits a giant, claw-like wave of Prussian Blue against the sacred, stationary Mount Fuji. It captures the sublime, terrifying power of nature and the vulnerability of the fishermen, a central theme in Edo art.",
    435882: "Cezanne strips away the traditional drama of tavern card games. He paints the peasants as quiet, solid forms, concentrated on their cards. This focus on geometric structure and quiet dignity laid the groundwork for Cubism.",
    435883: "Cezanne uses deliberate patches of color to build a sense of solid permanence in everyday objects. His apples look heavy and structural, turning a simple still life into a monument of form and spatial relationships.",
    438015: "Sargent's portrait of Madame Gautreau shocked Parisian society with its bold, aristocratic poise and pale skin. The contrast of the dark dress against the warm background creates a statuesque silhouette that defines high-society allure and tension.",
    438023: "Dubbed 'The Three Graces' by the Prince of Wales, Sargent paints three wealthy sisters in a glowing white silk interior. His fluid, sweeping brushstrokes capture the pinnacle of late-Victorian elegance and wealth.",
    436139: "Degas takes us behind the scenes of a ballet rehearsal under the watchful eye of Jules Perrot. He focuses on the dancers' natural, un-poised movements—stretching, adjusting dresses, and resting—capturing the exhausting reality of beauty.",
    436151: "A pastel masterpiece showing Degas's revolutionary view from above. He captures a private, everyday moment of bathing with remarkable intimacy. The warm colors and active strokes focus on form and physical weight.",
    437508: "Rousseau never left France, creating his lush jungles from botanical gardens and travel books. This naive masterpiece combines dreamlike foliage, a dramatic lion feed, and a strange, quiet peace, making it feel like a surreal myth.",
    437310: "Pissarro painted this bustling Parisian street from a hotel window. His rapid, impressionistic strokes capture the damp pavement, carriages, and crowds in the winter light, conveying the dynamic energy of modern city life.",
    435848: "Mary Cassatt portrays the quiet, ritualistic life of middle-class women. Her sister Lydia is shown taking a sip of tea in a glowing pink dress. The soft, luminous lighting celebrates the intellectual and emotional life of women.",
    436947: "Manet paints in broad, bold patches of bright blue and white to capture a summer day on the Seine. The composition reflects Japanese art influences, creating a fresh, modern snapshot of Parisian leisure.",
    437654: "This peaceful harbor scene displays Seurat's divisionism. By placing tiny dots of opposing colors next to each other, the quiet evening light vibrates with optical intensity, giving the dry docks a silent, mathematical perfection.",
    436252: "El Greco's wild, expressive style shines in this biblical scene. The elongated, twisting bodies and cold, dramatic colors create an intense spiritual ecstasy that directly inspired Picasso's early Cubist works.",
    335805: "A rare look at Michelangelo's drawing process for the Sistine Chapel ceiling. These red chalk drawings of a male model show his obsession with muscular anatomy, translating physical strength into divine grace.",
    341857: "Rafael's exquisite black chalk drawing is a study for his Parnassus fresco. The soft shading and elegant contours capture a classical ideal of human beauty, conveying a divine, intellectual grace.",
    435826: "An early allegory of music and love. Caravaggio paints a group of boys dressed in classical robes, tuning their instruments. His realistic details and soft, dramatic lighting create an intimate, sensory-filled atmosphere.",
    435728: "Botticelli's elegant, linear style creates a deeply tender scene. The transparent, golden halo and delicate folds of fabric glow with a quiet divinity, capturing a gentle, maternal melancholy.",
    436838: "La Tour's theatrical masterpiece showing a young man being robbed while his fortune is told. The dramatic side-lighting and rich detail in the costumes highlight a tense comedy of deceit, caution, and youth.",
    437869: "Velázquez painted this portrait of his assistant to practice for his portrait of the Pope. The proud stance, realistic collar, and lifelike dignity forced Roman critics to declare it the only true painting in the city.",
    10497: "Cole's landscape showing the split between wild nature (the storm-ravaged hill) and civilized agriculture. It stands as a powerful reflection on early American expansion and destiny."
  };

  return commentaryDatabase[id] || "";
}

async function preloadNextArtCache() {
  try {
    const randomItem = CURATED_ARTWORKS[Math.floor(Math.random() * CURATED_ARTWORKS.length)];
    if (state.currentArt && randomItem.id === state.currentArt.id) return;
    
    state.pendingArt = randomItem;
    
    // Warm up the browser cache by downloading the image in the background during focus session
    const img = new Image();
    img.src = randomItem.imageUrl;
  } catch (e) {
    // Ignore cache errors
  }
}

function showArtLoading() {
  artworkDetailsContent.style.display = 'none';
  artworkPlaceholderMini.style.display = 'flex';
}

/* ==========================================================================
   Timer Mechanics & State Machine
   ========================================================================== */

function togglePlayPause() {
  if (state.mode === 'idle' || state.mode === 'paused') {
    startTimer();
  } else if (state.mode === 'focus' || state.mode === 'break') {
    pauseTimer();
  }
}

function startTimer() {
  if (state.mode === 'idle') {
    state.mode = 'focus';
    state.totalDuration = FOCUS_DURATION;
    state.remainingSeconds = FOCUS_DURATION;
    
    // Request desktop notification permission on first user click to start focus
    requestNotificationPermission();
    
    // Instantly change the picture when starting a new focus session!
    if (state.pendingArt) {
      displayArtwork(state.pendingArt);
      state.pendingArt = null;
    } else {
      fetchNextArtwork();
    }
  } else if (state.mode === 'paused') {
    state.mode = timerModeBadge.textContent.includes('Break') ? 'break' : 'focus';
  }
  
  timerModeBadge.textContent = state.mode === 'focus' ? 'Focus Session' : 'Break Time';
  btnPlayPause.textContent = 'Pause';
  
  // Set UI theme based on focus vs break
  const root = document.documentElement;
  if (state.mode === 'focus') {
    root.style.setProperty('--accent-color', 'var(--focus-accent)');
    root.style.setProperty('--accent-glow', 'rgba(245, 158, 11, 0.35)');
    
    // Move timer card to snapped corner!
    timerCard.classList.add('active');
    timerCard.classList.remove('corner-top-left', 'corner-top-right', 'corner-bottom-left', 'corner-bottom-right');
    timerCard.classList.add(state.snappedCorner);
    appHeaderFloating.classList.add('active-focus');
    artworkDetailsCapsule.classList.add('active-focus');
    
    // Reduce dark dimming so the white reveal is bright & pure
    darkOverlay.style.opacity = 0.15;
  } else {
    root.style.setProperty('--accent-color', 'var(--break-accent)');
    root.style.setProperty('--accent-glow', 'rgba(16, 185, 129, 0.35)');
    
    // Break runs in the absolute center
    timerCard.classList.remove('active', 'corner-top-left', 'corner-top-right', 'corner-bottom-left', 'corner-bottom-right');
    appHeaderFloating.classList.remove('active-focus');
    artworkDetailsCapsule.classList.remove('active-focus');
    
    // Add dim overlay for comfortable break reading
    darkOverlay.style.opacity = 0.75;
    whiteOverlay.style.opacity = 0;
  }

  clearInterval(state.timerInterval);
  
  state.timerInterval = setInterval(() => {
    state.remainingSeconds--;
    updateTimerDisplay();
    
    if (state.mode === 'focus') {
      applyProgressReveal();
    }
    
    if (state.remainingSeconds <= 0) {
      handleTimerComplete();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(state.timerInterval);
  state.mode = 'paused';
  btnPlayPause.textContent = 'Resume';
}

function resetTimer() {
  clearInterval(state.timerInterval);
  state.mode = 'idle';
  state.remainingSeconds = FOCUS_DURATION;
  state.totalDuration = FOCUS_DURATION;
  
  updateTimerDisplay();
  setProgress(100);
  btnPlayPause.textContent = 'Start Focus';
  timerModeBadge.textContent = 'Focus Session';
  
  // Move timer card back to Center
  timerCard.classList.remove('active', 'corner-top-left', 'corner-top-right', 'corner-bottom-left', 'corner-bottom-right');
  timerCard.style.display = 'flex';
  appHeaderFloating.classList.remove('active-focus');
  artworkDetailsCapsule.classList.remove('active-focus');
  
  // Reset overlays
  whiteOverlay.style.opacity = 0;
  darkOverlay.style.opacity = 0.75;
  
  const root = document.documentElement;
  root.style.setProperty('--accent-color', 'var(--focus-accent)');
  root.style.setProperty('--accent-glow', 'rgba(245, 158, 11, 0.35)');
  
  reflectionCard.classList.remove('visible');
}

function handleSkip() {
  if (confirm("Are you sure you want to skip this session?")) {
    if (state.mode === 'focus') {
      clearInterval(state.timerInterval);
      state.remainingSeconds = 0;
      handleTimerComplete();
    } else if (state.mode === 'break') {
      clearInterval(state.timerInterval);
      state.remainingSeconds = 0;
      startNextFocusSession();
    } else {
      resetTimer();
    }
  }
}

/**
 * Dynamic artwork progressive reveal.
 * Starts pure white (opacity = 1) at remaining = total.
 * Slowly fades white overlay to 0 (fully visible image) as remaining = 0.
 */
function applyProgressReveal() {
  if (state.mode !== 'focus') {
    whiteOverlay.style.opacity = 0;
    return;
  }
  
  const ratio = state.remainingSeconds / state.totalDuration; // 1 at start, 0 at end
  
  // Ease the opacity transition slightly for better visual feedback
  const easedOpacity = Math.pow(ratio, 1.2);
  
  whiteOverlay.style.opacity = easedOpacity;
}

function handleTimerComplete() {
  clearInterval(state.timerInterval);
  playChime();
  
  // Clear any white overlay completely
  whiteOverlay.style.opacity = 0;
  darkOverlay.style.opacity = 0.85; // Dim the screen to draw focus to the controls
  
  if (state.mode === 'focus') {
    // Desktop system notification
    sendDesktopNotification("Focus Session Complete! 🔔", "Time to reflect on the artwork and take a short break.");

    // Hide the timer card completely during journaling
    timerCard.style.display = 'none';
    
    // Apply snapped corner preference for reflectionCard
    reflectionCard.classList.remove('corner-top-left', 'corner-top-right', 'corner-bottom-left', 'corner-bottom-right', 'corner-center-bottom');
    reflectionCard.classList.add(state.snappedReflectionCorner);
    
    // Show reflection card centered/snapped with smooth transition
    reflectionCard.classList.add('visible');
    reflectionInput.value = '';
    reflectionInput.focus();
    
    timerModeBadge.textContent = 'Reflection Phase';
  } else if (state.mode === 'break') {
    // Desktop system notification
    sendDesktopNotification("Break Complete! ⚡", "Ready to start your next focus session?");

    startNextFocusSession();
  }
}

function startNextFocusSession() {
  reflectionCard.classList.remove('visible');
  timerCard.style.display = 'flex';
  
  // Clean up reflection positions when switching back
  reflectionCard.classList.remove('corner-top-left', 'corner-top-right', 'corner-bottom-left', 'corner-bottom-right');
  reflectionCard.classList.add('corner-center-bottom');
  
  state.mode = 'idle';
  state.totalDuration = FOCUS_DURATION;
  state.remainingSeconds = FOCUS_DURATION;
  
  if (state.artChoiceNextSession === 'change') {
    if (state.pendingArt) {
      displayArtwork(state.pendingArt);
      state.pendingArt = null;
    } else {
      fetchNextArtwork();
    }
  } else {
    // Keep artwork. Will re-fade to white when started.
    whiteOverlay.style.opacity = 0;
  }
  
  startTimer();
}

/* ==========================================================================
   Reflection Journaling & Gallery History
   ========================================================================== */

function submitReflection() {
  const commentText = reflectionInput.value.trim() || "Focused with this piece.";
  
  const historyItem = {
    title: state.currentArt.title,
    artist: state.currentArt.artist,
    date: state.currentArt.date,
    medium: state.currentArt.medium,
    imageUrl: state.currentArt.imageUrl,
    comment: commentText,
    timestamp: new Date().toISOString()
  };
  
  const history = JSON.parse(localStorage.getItem('met_timer_history') || '[]');
  history.unshift(historyItem);
  localStorage.setItem('met_timer_history', JSON.stringify(history));
  
  loadGallery();
  
  const selectedOption = document.querySelector('input[name="artChoice"]:checked').value;
  state.artChoiceNextSession = selectedOption;
  
  // Enter Break Mode
  state.mode = 'break';
  state.totalDuration = BREAK_DURATION;
  state.remainingSeconds = BREAK_DURATION;
  
  reflectionCard.classList.remove('visible');
  timerCard.style.display = 'flex';
  
  startTimer();
}

function loadGallery() {
  const history = JSON.parse(localStorage.getItem('met_timer_history') || '[]');
  
  if (history.length === 0) {
    galleryContent.innerHTML = `
      <div class="empty-state">
        <p>No completed focus sessions yet.</p>
        <p class="subtitle">Complete a focus session and write down your reflections to build your gallery.</p>
      </div>`;
    return;
  }
  
  galleryContent.innerHTML = history.map(item => {
    const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="gallery-item">
        <img class="gallery-item-image" src="${item.imageUrl}" alt="${item.title}">
        <div class="gallery-item-details">
          <h4>${item.title}</h4>
          <p>${item.artist} (${item.date})</p>
          <div class="gallery-item-comment">"${item.comment}"</div>
          <div class="gallery-item-time">${formattedDate}</div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleGallery() {
  galleryDrawer.classList.toggle('open');
  if (galleryDrawer.classList.contains('open')) {
    loadGallery();
  }
}

/* ==========================================================================
   Timer View Updates & SVG Progress Control
   ========================================================================== */

function updateTimerDisplay() {
  const minutes = Math.floor(state.remainingSeconds / 60);
  const seconds = state.remainingSeconds % 60;
  
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  timerDisplay.textContent = formattedTime;
  
  let titlePrefix = "";
  if (state.mode === 'focus') titlePrefix = `[Focus ${formattedTime}] `;
  else if (state.mode === 'break') titlePrefix = `[Break ${formattedTime}] `;
  else if (state.mode === 'paused') titlePrefix = `[Paused] `;
  
  document.title = `${titlePrefix}MET Art Focus Timer`;
  
  // Circumference of radius 95 = 2 * PI * 95 = 596.90
  if (state.mode !== 'idle') {
    const progressRatio = state.remainingSeconds / state.totalDuration;
    setProgress(progressRatio * 100);
  } else {
    setProgress(100);
  }
}

function setProgress(percent) {
  const radius = 95;
  const circumference = 2 * Math.PI * radius; // 596.9
  const offset = circumference - (percent / 100) * circumference;
  progressRing.style.strokeDashoffset = offset;
}

/* ==========================================================================
   Chime Audio Synthesizer
   ========================================================================== */

function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const now = ctx.currentTime;
    if (state.mode === 'focus') {
      playTone(523.25, now, 1.2);       // C5
      playTone(659.25, now + 0.15, 1.2); // E5
    } else {
      playTone(659.25, now, 1.2);       // E5
      playTone(523.25, now + 0.15, 1.2); // C5
    }
  } catch (e) {
    console.warn("Chime error:", e);
  }
}

/* ==========================================================================
   Desktop System Notifications
   ========================================================================== */

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log("Notification permission:", permission);
    });
  }
}

function sendDesktopNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: body,
        icon: 'https://images.metmuseum.org/CRDImages/ad/web-large/DP-14161-002.jpg'
      });
    } catch (e) {
      console.warn("Desktop notification failed:", e);
    }
  }
}

/* ==========================================================================
   Generic Snapping Drag & Drop Logic (Timer & Reflection Cards)
   ========================================================================== */

let activeDragElement = null;
let drag = {
  isDragging: false,
  startX: 0,
  startY: 0,
  startLeft: 0,
  startTop: 0
};

function setupDragAndDrop() {
  // Bind timerCard
  timerCard.addEventListener('mousedown', (e) => dragStart(e, timerCard));
  timerCard.addEventListener('touchstart', (e) => dragStart(e, timerCard), { passive: true });

  // Bind reflectionCard
  reflectionCard.addEventListener('mousedown', (e) => dragStart(e, reflectionCard));
  reflectionCard.addEventListener('touchstart', (e) => dragStart(e, reflectionCard), { passive: true });

  window.addEventListener('mousemove', dragMove);
  window.addEventListener('touchmove', dragMove, { passive: false });

  window.addEventListener('mouseup', dragEnd);
  window.addEventListener('touchend', dragEnd);
}

function dragStart(e, element) {
  // Ignore drag if clicking inputs, buttons, or options
  if (e.target.closest('.reflection-input') || e.target.closest('.reflection-options') || e.target.closest('.btn') || e.target.closest('button')) {
    return;
  }

  // If timerCard is dragged when not active (e.g. on starting page), activate it instantly so it can snap and slide!
  if (element === timerCard && !element.classList.contains('active')) {
    element.style.transition = 'none';
    element.classList.add('active');
    element.offsetHeight; // Force instant browser layout reflow
  }

  activeDragElement = element;
  drag.isDragging = true;
  element.classList.add('dragging');

  // Support mouse & touch coordinates
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const rect = element.getBoundingClientRect();
  drag.startX = clientX;
  drag.startY = clientY;
  drag.startLeft = rect.left;
  drag.startTop = rect.top;
}

function dragMove(e) {
  if (!drag.isDragging || !activeDragElement) return;

  // Prevent default scrolling on mobile
  if (e.cancelable) e.preventDefault();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const dx = clientX - drag.startX;
  const dy = clientY - drag.startY;

  activeDragElement.style.transition = 'none';
  activeDragElement.style.left = `${drag.startLeft + dx}px`;
  activeDragElement.style.top = `${drag.startTop + dy}px`;
  activeDragElement.style.bottom = 'auto';
  activeDragElement.style.right = 'auto';
}

function dragEnd(e) {
  if (!drag.isDragging || !activeDragElement) return;
  
  const element = activeDragElement;
  drag.isDragging = false;
  activeDragElement = null;
  element.classList.remove('dragging');

  // Get screen snapping bounds
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  let nextCorner = 'corner-top-left';
  if (cx < screenWidth / 2 && cy < screenHeight / 2) {
    nextCorner = 'corner-top-left';
  } else if (cx >= screenWidth / 2 && cy < screenHeight / 2) {
    nextCorner = 'corner-top-right';
  } else if (cx < screenWidth / 2 && cy >= screenHeight / 2) {
    nextCorner = 'corner-bottom-left';
  } else {
    nextCorner = 'corner-bottom-right';
  }

  // Save the corner selection in state
  if (element === timerCard) {
    state.snappedCorner = nextCorner;
  } else if (element === reflectionCard) {
    state.snappedReflectionCorner = nextCorner;
  }

  // Remove old snapping classes and add the new one
  element.classList.remove('corner-top-left', 'corner-top-right', 'corner-bottom-left', 'corner-bottom-right', 'corner-center-bottom');
  element.classList.add(nextCorner);

  // Restore transition
  element.style.transition = '';
  
  // Force a browser reflow so the starting drag coordinates are registered for the slide transition
  element.offsetHeight;

  // Reset inline styling so the card slides smoothly to its snapping corner
  element.style.left = '';
  element.style.top = '';
  element.style.bottom = '';
  element.style.right = '';
}

// Start the app on load
window.addEventListener('DOMContentLoaded', init);
