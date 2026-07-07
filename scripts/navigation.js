// Navigation handler for the FSG Generator

// Create audio objects for chest sounds
const chestOpenSound = new Audio('./sounds/chest_open.ogg');
const chestCloseSound = new Audio('./sounds/chest_close.ogg');

// Create audio object for menu clicks
const menuClickSound = new Audio('./sounds/menu_click.ogg');

// Set volume for chest sounds (lower volume)
chestOpenSound.volume = 0.33;
chestCloseSound.volume = 0.33;

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupMiscToggle();
  setupVersionToggles();
  setupModalHandlers();
  setupModalButtons(); 
});

function setupNavigation() {
  // Internal navigation now uses real <a href> links (crawlable by search
  // engines without JS). Nothing left to wire up here for page navigation.
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

function setupVersionToggles() {
  // Generic accordion handler for the "1.16" and "Latest" version dropdowns
  // on the homepage. Any button with class "version-toggle-btn" and a
  // "data-target" attribute pointing to the id of the panel it controls
  // will work with this automatically.
  const toggles = document.querySelectorAll('.version-toggle-btn');

  toggles.forEach(toggle => {
    const targetId = toggle.getAttribute('data-target');
    const expanded = targetId ? document.getElementById(targetId) : null;

    if (!expanded) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggle.classList.toggle('active');
      expanded.classList.toggle('show');

      // Play the appropriate chest sound based on the new state
      if (expanded.classList.contains('show')) {
        chestOpenSound.currentTime = 0;
        chestOpenSound.play();
      } else {
        chestCloseSound.currentTime = 0;
        chestCloseSound.play();
      }
    });
  });
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

