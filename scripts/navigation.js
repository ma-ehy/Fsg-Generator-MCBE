// Navigation handler for the FSG Generator

// Page routing configuration
const pages = {
  'stronghold': 'pages/stronghold.html',
  'ruined-portal': 'pages/ruined-portal.html',
  'ranked': 'pages/ranked.html',
  'packless-stronghold': 'pages/packless-stronghold.html',
  'village': 'pages/village.html',
  'classic': 'pages/classic.html',
  'structureless': 'pages/structureless.html',
  'desert-temple': 'pages/desert-temple.html',
  'help': 'pages/help.html',
  'tutorials': 'pages/tutorials.html',
  'resources': 'pages/resources.html'
};

// Create audio objects for chest sounds
const chestOpenSound = new Audio('./chest_open.ogg');
const chestCloseSound = new Audio('./chest_close.ogg');

// Create audio object for menu clicks
const menuClickSound = new Audio('./menu_click.ogg');

// Set volume for chest sounds (lower volume)
chestOpenSound.volume = 0.33;
chestCloseSound.volume = 0.33;

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupMiscToggle();
  setupModalHandlers();
  setupModalButtons(); 
});

function setupNavigation() {
  // Add click handlers to all buttons with data-page attribute
  const navButtons = document.querySelectorAll('[data-page]');
  
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const page = button.getAttribute('data-page');
      
      // Check if it's a modal page
      if (page === 'stats') {
        menuClickSound.currentTime = 0;
        menuClickSound.play();
        document.getElementById('statsModal').classList.add('show');
        loadStats();
      } else if (page === 'credits') {
        menuClickSound.currentTime = 0;
        menuClickSound.play();
        document.getElementById('creditsModal').classList.add('show');
      } else {
        // Navigate to page
        navigateTo(page);
      }
    });
  });
}

function setupMiscToggle() {
  const miscToggle = document.getElementById('miscToggle');
  const miscExpanded = document.getElementById('miscExpanded');
  
  if (miscToggle && miscExpanded) {
    miscToggle.addEventListener('click', (e) => {
      e.preventDefault();
      miscToggle.classList.toggle('active');
      miscExpanded.classList.toggle('show');
      
      // Play appropriate sound based on state
      if (miscExpanded.classList.contains('show')) {
        chestOpenSound.currentTime = 0;
        chestOpenSound.play();
      } else {
        chestCloseSound.currentTime = 0;
        chestCloseSound.play();
      }
    });
  }
}

function setupModalHandlers() {
  // Close modal when clicking outside
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('show');
      }
    });
  });
}

function navigateTo(pageName) {
  const pageUrl = pages[pageName];
  
  if (pageUrl) {
    window.location.href = pageUrl;
  } else {
    console.error(`Page not found: ${pageName}`);
  }
}

// Modal functions
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

function loadStats() {
  document.getElementById('statsLoading').style.display = 'none';
  document.getElementById('statsContent').style.display = 'block';
}

function setupModalButtons() {
  const statsBtn = document.getElementById('statsBtn');
  const creditsBtn = document.getElementById('creditsBtn');
  
  if (statsBtn) {
    statsBtn.addEventListener('click', () => {
      menuClickSound.currentTime = 0;
      menuClickSound.play();
      document.getElementById('statsModal').classList.add('show');
      loadStats();
    });
  }
  
  if (creditsBtn) {
    creditsBtn.addEventListener('click', () => {
      menuClickSound.currentTime = 0;
      menuClickSound.play();
      document.getElementById('creditsModal').classList.add('show');
    });
  }
  
  // Close modal when clicking outside
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('show');
      }
    });
  });
}

// Wrench button handler
document.getElementById('wrenchBtn')?.addEventListener('click', function() {
  document.getElementById('helpModal').classList.add('show');
});
