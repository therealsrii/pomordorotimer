/* ==========================================================================
   MET Art Focus Timer - Application Logic (Fullscreen & Dynamic Reveal)
   ========================================================================== */

// Configuration
const FOCUS_DURATION_DEFAULT = 25 * 60; // 25 minutes
const BREAK_DURATION_DEFAULT = 5 * 60;  // 5 minutes

// Query param debug option (?debug=true sets timer to 15s focus, 5s break)
const urlParams = new URLSearchParams(window.location.search);
const IS_DEBUG = (urlParams.get('debug') === 'true') || (window.IS_DEBUG_PAGE === true);

const FOCUS_DURATION = IS_DEBUG ? 15 : FOCUS_DURATION_DEFAULT;
const BREAK_DURATION = IS_DEBUG ? 5 : BREAK_DURATION_DEFAULT;

// Curated list of high-quality Met Open Access painting IDs (Fallback dataset)
const CURATED_ARTWORKS = [
  { id: 436535, title: "Wheat Field with Cypresses", artist: "Vincent van Gogh", date: "1889", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-42549-001.jpg" },
  { id: 436529, title: "L'Arl\u00e9sienne: Madame Joseph-Michel Ginoux (Marie Julien, 1848\u20131911)", artist: "Vincent van Gogh", date: "1888\u201389", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT1396.jpg" },
  { id: 436528, title: "Irises", artist: "Vincent van Gogh", date: "1890", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP346474.jpg" },
  { id: 437133, title: "Garden at Sainte-Adresse", artist: "Claude Monet", date: "1867", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT48.jpg" },
  { id: 437127, title: "Bridge over a Pond of Water Lilies", artist: "Claude Monet", date: "1899", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT1854.jpg" },
  { id: 437131, title: "The Bodmer Oak, Fontainebleau Forest", artist: "Claude Monet", date: "1865", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT1560.jpg" },
  { id: 437397, title: "Self-Portrait", artist: "Rembrandt (Rembrandt van Rijn)", date: "1660", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-16323-001.jpg" },
  { id: 437396, title: "Hendrickje Stoffels (1626\u20131663)", artist: "Rembrandt (Rembrandt van Rijn)", date: "mid-1650s", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP145920.jpg" },
  { id: 437879, title: "Study of a Young Woman", artist: "Johannes Vermeer", date: "ca. 1665\u201367", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP353256.jpg" },
  { id: 437877, title: "Allegory of the Catholic Faith", artist: "Johannes Vermeer", date: "ca. 1670\u201372", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP145924.jpg" },
  { id: 437430, title: "By the Seashore", artist: "Auguste Renoir", date: "1883", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14936-039.jpg" },
  { id: 437434, title: "In the Meadow", artist: "Auguste Renoir", date: "1888\u201392", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT1398.jpg" },
  { id: 436253, title: "Lucas van Uffel (died 1637)", artist: "Anthony van Dyck", date: "ca. 1622", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-27908-001.jpg" },
  { id: 437658, title: "Study for \"A Sunday on La Grande Jatte\"", artist: "Georges Seurat", date: "1884", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP259921.jpg" },
  { id: 436819, title: "M\u00e4da Primavesi (1903\u20132000)", artist: "Gustav Klimt", date: "1912\u201313", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP243354.jpg" },
  { id: 45434, title: "Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave, from the series Thirty-six Views of Mount Fuji (Fugaku sanj\u016brokkei)", artist: "Katsushika Hokusai", date: "ca. 1830\u201332", imageUrl: "https://images.metmuseum.org/CRDImages/as/original/DP130155.jpg" },
  { id: 435868, title: "The Card Players", artist: "Paul C\u00e9zanne", date: "1890\u201392", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP231550.jpg" },
  { id: 435882, title: "Still Life with Apples and a Pot of Primroses", artist: "Paul C\u00e9zanne", date: "ca. 1890", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT47.jpg" },
  { id: 438015, title: "Gray Weather, Grande Jatte", artist: "Georges Seurat", date: "ca. 1886\u201388", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT1945.jpg" },
  { id: 438023, title: "The Antechamber of the Sala del Maggior Consiglio", artist: "Francesco Guardi", date: "ca. 1765\u201368", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT4167.jpg" },
  { id: 436139, title: "Dancers Practicing at the Barre", artist: "Edgar Degas", date: "1877", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DT840.jpg" },
  { id: 436151, title: "The Milliner", artist: "Edgar Degas", date: "ca. 1882", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP289328.jpg" },
  { id: 437508, title: "Self-Portrait", artist: "Salvator Rosa", date: "ca. 1647", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP323414.jpg" },
  { id: 437310, title: "The Boulevard Montmartre on a Winter Morning", artist: "Camille Pissarro", date: "1897", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-21959-001.jpg" },
  { id: 435848, title: "The Birth of the Virgin", artist: "Fra Carnevale (Bartolomeo di Giovanni Corradini)", date: "1467", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP109484.jpg" },
  { id: 436947, title: "Boating", artist: "Edouard Manet", date: "1874", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-25466-001.jpg" },
  { id: 437654, title: "Circus Sideshow (Parade de cirque)", artist: "Georges Seurat", date: "1887\u201388", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP375450_cropped.jpg" },
  { id: 436252, title: "James Stuart (1612\u20131655), Duke of Richmond and Lennox", artist: "Anthony van Dyck", date: "ca. 1633\u201335", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-25646-001.jpg" },
  { id: 335805, title: "Design for a frame with Eagles and Trophies", artist: "Johann Oktavian Salver", date: "1750\u201388", imageUrl: "https://images.metmuseum.org/CRDImages/dp/original/DP804385.jpg" },
  { id: 341857, title: "Saint John the Baptist before Herod and Herodias", artist: "Morazzone (Pier Francesco Mazzucchelli)", date: "16th century", imageUrl: "https://images.metmuseum.org/CRDImages/dp/original/DP330306.jpg" },
  { id: 435826, title: "The Love Song", artist: "Sir Edward Burne-Jones", date: "1868\u201377", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP323394.jpg" },
  { id: 435728, title: "The Last Communion of Saint Jerome", artist: "Botticelli (Alessandro di Mariano Filipepi)", date: "early 1490s", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-24049-001.jpg" },
  { id: 436838, title: "The Fortune-Teller", artist: "Georges de La Tour", date: "probably 1630s", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14286-015.jpg" },
  { id: 437869, title: "Juan de Pareja (ca. 1608\u20131670)", artist: "Vel\u00e1zquez (Diego Rodr\u00edguez de Silva y Vel\u00e1zquez)", date: "1650", imageUrl: "https://images.metmuseum.org/CRDImages/ep/original/DP-14286-001.jpg" },
  { id: 10497, title: "View from Mount Holyoke, Northampton, Massachusetts, after a Thunderstorm\u2014The Oxbow", artist: "Thomas Cole", date: "1836", imageUrl: "https://images.metmuseum.org/CRDImages/ad/original/DP-12550-001.jpg" }
];

// App State
let state = {
  mode: 'idle', // 'idle', 'focus', 'break', 'paused'
  totalDuration: FOCUS_DURATION,
  remainingSeconds: FOCUS_DURATION,
  timerInterval: null,
  currentArt: null,
  artworkBuffer: [], // Pre-fetched and cached artwork objects
  isRefillingBuffer: false, // Mutex flag for refilling buffer
  artChoiceNextSession: 'change', // 'change' or 'keep'
  snappedCorner: 'corner-top-left', // Snapped corner position
  snappedReflectionCorner: 'corner-center-bottom', // Snapped reflection corner position
  seenArtworkIds: [], // Track already seen painting IDs to prevent repetition
  artPool: [], // Pool of all Met painting object IDs
  user: null, // Firebase authenticated user
  firebaseActive: false, // Flag indicating if Firebase initialized successfully
  db: null // Firestore database instance
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
const btnLogin = document.getElementById('btnLogin');
let loginText = document.getElementById('loginText');



const galleryDrawer = document.getElementById('galleryDrawer');
const btnGalleryToggle = document.getElementById('btnGalleryToggle');
const btnGalleryClose = document.getElementById('btnGalleryClose');
const galleryContent = document.getElementById('galleryContent');

/* ==========================================================================
   Initialisation
   ========================================================================== */
async function init() {
  setupEventListeners();
  setupDragAndDrop();
  updateTimerDisplay();
  setProgress(100);
  
  // Set default local seen list
  state.seenArtworkIds = JSON.parse(localStorage.getItem('seenArtworkIds') || '[]');
  
  // Load pre-fetched artwork buffer from local storage
  state.artworkBuffer = JSON.parse(localStorage.getItem('artwork_buffer') || '[]');
  
  // Initialise Firebase Auth & DB (falls back gracefully to LocalStorage mode)
  setupFirebase();
  
  // Display first artwork instantly. Check buffer first, then fall back to curated random.
  if (state.artworkBuffer.length > 0) {
    state.currentArt = state.artworkBuffer.shift();
    saveBufferToLocalStorage();
  } else {
    state.currentArt = getCuratedFallbackArtwork();
  }
  displayArtwork(state.currentArt);
  
  // Load the Met paintings ID pool and refill buffer in background
  state.artPool = await loadArtPool();
  refillArtworkBuffer();
}

function setupEventListeners() {
  btnPlayPause.addEventListener('click', togglePlayPause);
  btnReset.addEventListener('click', resetTimer);
  btnSkip.addEventListener('click', handleSkip);
  btnSubmitReflection.addEventListener('click', submitReflection);
  btnLogin.addEventListener('click', handleAuthAction);
  
  btnGalleryToggle.addEventListener('click', toggleGallery);
  btnGalleryClose.addEventListener('click', toggleGallery);
}

/* ==========================================================================
   MET API & Art Curating
   ========================================================================== */

async function fetchNextArtwork() {
  const artObj = await popArtworkFromBuffer();
  if (artObj) {
    displayArtwork(artObj);
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

async function loadArtPool() {
  let pool = localStorage.getItem('art_pool');
  if (pool) {
    return JSON.parse(pool);
  }
  
  try {
    // Pull the 2,179 European oil painting IDs
    const response = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=11&q=oil");
    if (response.ok) {
      const data = await response.json();
      if (data && data.objectIDs && data.objectIDs.length > 0) {
        localStorage.setItem('art_pool', JSON.stringify(data.objectIDs));
        return data.objectIDs;
      }
    }
  } catch (e) {
    console.error("Failed to load Met search IDs:", e);
  }
  
  // Fallback to our curated 35 IDs if offline
  return CURATED_ARTWORKS.map(a => a.id);
}

async function getNextUnseenArtwork() {
  const pool = state.artPool.length > 0 ? state.artPool : CURATED_ARTWORKS.map(a => a.id);
  let unseenIds = pool.filter(id => !state.seenArtworkIds.includes(id));
  
  // Reset history if they have seen everything
  if (unseenIds.length === 0) {
    state.seenArtworkIds = [];
    localStorage.setItem('seenArtworkIds', '[]');
    if (state.user && state.db) {
      state.db.collection('users').doc(state.user.uid).collection('metadata').doc('user_data').set({
        seenArtworkIds: []
      }).catch(e => console.error(e));
    }
    unseenIds = [...pool];
  }
  
  // Try up to 10 random unseen IDs to find a valid public domain painting with an image
  for (let attempt = 0; attempt < 10; attempt++) {
    if (unseenIds.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * unseenIds.length);
    const selectedId = unseenIds[randomIndex];
    
    unseenIds.splice(randomIndex, 1);
    
    const details = await fetchArtworkDetails(selectedId);
    if (details && details.imageUrl) {
      return details;
    } else {
      // Mark as seen so we don't attempt this invalid ID again
      state.seenArtworkIds.push(selectedId);
      localStorage.setItem('seenArtworkIds', JSON.stringify(state.seenArtworkIds));
      if (state.user && state.db) {
        state.db.collection('users').doc(state.user.uid).collection('metadata').doc('user_data').set({
          seenArtworkIds: state.seenArtworkIds
        }).catch(e => console.error(e));
      }
    }
  }
  
  // Return a random local curated item as fallback
  return CURATED_ARTWORKS[Math.floor(Math.random() * CURATED_ARTWORKS.length)];
}

/* ==========================================================================
   Firebase Sync & Authentication
   ========================================================================== */

function setupFirebase() {
  const isValidConfig = typeof firebaseConfig !== 'undefined' && 
                        firebaseConfig.apiKey && 
                        !firebaseConfig.apiKey.includes('PLACEHOLDER') && 
                        !firebaseConfig.apiKey.includes('YOUR_API_KEY');
                        
  if (!isValidConfig) {
    console.log("Firebase is not configured. Falling back to LocalStorage Mode.");
    btnLogin.title = "Configure Firebase in config.js to sync cloud history";
    btnLogin.style.opacity = 0.5;
    state.firebaseActive = false;
    return;
  }
  
  try {
    firebase.initializeApp(firebaseConfig);
    state.db = firebase.firestore();
    state.firebaseActive = true;
    
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        state.user = user;
        loginText.textContent = user.displayName ? user.displayName.split(' ')[0] : 'Signed In';
        if (user.photoURL) {
          btnLogin.innerHTML = `<img src="${user.photoURL}" referrerpolicy="no-referrer" alt="${user.displayName}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;"><span>${loginText.textContent}</span>`;
        }
        btnLogin.title = `Signed in as ${user.email}. Click to Sign Out.`;
        
        await syncUserDataOnLogin(user.uid);
      } else {
        state.user = null;
        btnLogin.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.431 0-6.224-2.793-6.224-6.224 0-3.431 2.793-6.224 6.224-6.224 1.566 0 2.99.58 4.095 1.528l3.056-3.056C19.23 2.85 16.5 1.5 13.5 1.5c-5.799 0-10.5 4.701-10.5 10.5s4.701 10.5 10.5 10.5c5.03 0 9.5-3.56 9.5-9.3 0-.6-.05-1.2-.16-1.715H12.24z"/>
          </svg>
          <span id="loginText">Sign In</span>
        `;
        loginText = document.getElementById('loginText');
        btnLogin.title = "Sign In with Google";
        
        state.seenArtworkIds = JSON.parse(localStorage.getItem('seenArtworkIds') || '[]');
        loadGallery();
      }
    });
  } catch (err) {
    console.error("Firebase initialization failed:", err);
    state.firebaseActive = false;
  }
}

async function syncUserDataOnLogin(uid) {
  try {
    const metaDoc = await state.db.collection('users').doc(uid).collection('metadata').doc('user_data').get();
    let cloudSeen = [];
    if (metaDoc.exists) {
      cloudSeen = metaDoc.data().seenArtworkIds || [];
    }
    
    const localSeen = JSON.parse(localStorage.getItem('seenArtworkIds') || '[]');
    const mergedSeen = Array.from(new Set([...cloudSeen, ...localSeen]));
    state.seenArtworkIds = mergedSeen;
    
    await state.db.collection('users').doc(uid).collection('metadata').doc('user_data').set({
      seenArtworkIds: mergedSeen
    });
    localStorage.setItem('seenArtworkIds', JSON.stringify(mergedSeen));
    
    const reflectionsSnap = await state.db.collection('users').doc(uid).collection('reflections').orderBy('timestamp', 'desc').get();
    let cloudReflections = [];
    reflectionsSnap.forEach(doc => {
      cloudReflections.push(doc.data());
    });
    
    const localReflections = JSON.parse(localStorage.getItem('met_timer_history') || '[]');
    if (localReflections.length > 0) {
      for (const localRef of localReflections) {
        const alreadyInCloud = cloudReflections.some(cr => cr.imageUrl === localRef.imageUrl && cr.timestamp === localRef.timestamp);
        if (!alreadyInCloud) {
          await state.db.collection('users').doc(uid).collection('reflections').add(localRef);
          cloudReflections.push(localRef);
        }
      }
      cloudReflections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      localStorage.setItem('met_timer_history', '[]');
    }
    
    localStorage.setItem('cloud_reflections_cache', JSON.stringify(cloudReflections));
    
    loadGallery();
  } catch (err) {
    console.error("Error syncing user data on login:", err);
  }
}

function handleAuthAction() {
  if (!state.firebaseActive) {
    alert("Firebase is not configured. Please paste your credentials into config.js to enable cloud database sync!");
    return;
  }
  
  if (state.user) {
    firebase.auth().signOut().catch(err => console.error("Sign out error:", err));
  } else {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(error => {
      console.error("Sign in failed:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("Popup blocked! Please enable popups for this site in your browser to sign in with Google.");
      } else {
        alert("Sign in failed. This can happen if third-party cookies or cross-site tracking are blocked in your browser settings (common in Brave or Safari's private tabs). Please try a standard Chrome window or enable cookies for this site.");
      }
    });
  }
}

/* ==========================================================================
   Display and Commentary Logic
   ========================================================================== */

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
    435868: "Cezanne strips away the traditional drama of tavern card games. He paints the peasants as quiet, solid forms, concentrated on their cards. This focus on geometric structure and quiet dignity laid the groundwork for Cubism.",
    435882: "Cezanne uses deliberate patches of color to build a sense of solid permanence in everyday objects. His apples look heavy and structural, turning a simple still life into a monument of form and spatial relationships.",
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

function saveBufferToLocalStorage() {
  localStorage.setItem('artwork_buffer', JSON.stringify(state.artworkBuffer));
}

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

async function refillArtworkBuffer() {
  if (state.isRefillingBuffer) return;
  state.isRefillingBuffer = true;
  
  try {
    const maxBufferSize = 3;
    while (state.artworkBuffer.length < maxBufferSize) {
      const art = await getNextUnseenArtwork();
      if (art && art.imageUrl) {
        try {
          await preloadImage(art.imageUrl);
          state.artworkBuffer.push(art);
          saveBufferToLocalStorage();
        } catch (e) {
          console.warn("Failed to preload image for buffer item:", art.title, e);
        }
      } else {
        break; // Either offline or no more artwork
      }
    }
  } catch (error) {
    console.warn("Error refilling artwork buffer:", error);
  } finally {
    state.isRefillingBuffer = false;
  }
}

function getCuratedFallbackArtwork() {
  let unseenCurated = CURATED_ARTWORKS.filter(a => !state.seenArtworkIds.includes(a.id));
  if (unseenCurated.length === 0) {
    unseenCurated = CURATED_ARTWORKS;
  }
  return unseenCurated[Math.floor(Math.random() * unseenCurated.length)];
}

async function popArtworkFromBuffer() {
  if (state.artworkBuffer.length > 0) {
    const art = state.artworkBuffer.shift();
    saveBufferToLocalStorage();
    // Asynchronously refill buffer in background
    refillArtworkBuffer();
    return art;
  }
  refillArtworkBuffer();
  return getCuratedFallbackArtwork();
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
    
    // Focus on the artwork currently displayed on the screen.
    // If no artwork is set yet (safety fallback), load one.
    if (!state.currentArt) {
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
  if (state.mode === 'idle') {
    // If idle, skipping changes the current artwork to a new random one from the buffer
    fetchNextArtwork();
  } else {
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
    fetchNextArtwork();
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
    id: state.currentArt.id || 0,
    title: state.currentArt.title,
    artist: state.currentArt.artist,
    date: state.currentArt.date,
    medium: state.currentArt.medium || "Oil on canvas",
    imageUrl: state.currentArt.imageUrl,
    comment: commentText,
    timestamp: new Date().toISOString()
  };
  
  // Save current art ID to seen history so it is never repeated
  if (state.currentArt.id) {
    if (!state.seenArtworkIds.includes(state.currentArt.id)) {
      state.seenArtworkIds.push(state.currentArt.id);
      localStorage.setItem('seenArtworkIds', JSON.stringify(state.seenArtworkIds));
      
      if (state.user && state.db) {
        state.db.collection('users').doc(state.user.uid).collection('metadata').doc('user_data').set({
          seenArtworkIds: state.seenArtworkIds
        }).catch(err => console.error("Error saving seen list:", err));
      }
    }
  }
  
  // Save reflection comment to Cloud DB or local storage
  if (state.user && state.db) {
    state.db.collection('users').doc(state.user.uid).collection('reflections').add(historyItem)
      .then(() => {
        let cloudCache = JSON.parse(localStorage.getItem('cloud_reflections_cache') || '[]');
        cloudCache.unshift(historyItem);
        localStorage.setItem('cloud_reflections_cache', JSON.stringify(cloudCache));
        loadGallery();
      })
      .catch(err => {
        console.error("Firestore write failed. Falling back to local storage.", err);
        saveReflectionLocally(historyItem);
      });
  } else {
    saveReflectionLocally(historyItem);
  }
  
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

function saveReflectionLocally(historyItem) {
  const history = JSON.parse(localStorage.getItem('met_timer_history') || '[]');
  history.unshift(historyItem);
  localStorage.setItem('met_timer_history', JSON.stringify(history));
  loadGallery();
}

function loadGallery() {
  let history = [];
  if (state.user) {
    history = JSON.parse(localStorage.getItem('cloud_reflections_cache') || '[]');
  } else {
    history = JSON.parse(localStorage.getItem('met_timer_history') || '[]');
  }
  
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
