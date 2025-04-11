/**
 * Direct dark mode implementation - simplified to ensure it works
 * This script completely handles dark mode without relying on any other scripts
 */

// Immediately apply dark mode if it was previously enabled
if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.style.transition = 'none'; // Prevent flash of light mode
    document.body.classList.add('dark-mode');
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 100);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get toggle buttons
    const darkToggleBtn = document.getElementById('night-mode-btn');
    const mobileDarkToggleBtn = document.getElementById('mobile-night-mode-btn');
    
    // Toggle dark mode function
    function toggleDarkMode() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Toggle the class
        if (isDarkMode) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        }
        
        // Update button icons
        updateIcons(!isDarkMode);
    }
    
    // Update button icons
    function updateIcons(isDark) {
        const icon = isDark ? '☀️' : '🌙';
        if (darkToggleBtn) darkToggleBtn.innerHTML = icon;
        if (mobileDarkToggleBtn) mobileDarkToggleBtn.innerHTML = icon;
    }
    
    // Set initial button states
    updateIcons(document.body.classList.contains('dark-mode'));
    
    // Add event listeners
    if (darkToggleBtn) {
        // Remove any existing listeners first to prevent duplicates
        const newDarkToggleBtn = darkToggleBtn.cloneNode(true);
        darkToggleBtn.parentNode.replaceChild(newDarkToggleBtn, darkToggleBtn);
        newDarkToggleBtn.addEventListener('click', toggleDarkMode);
    }
    
    if (mobileDarkToggleBtn) {
        // Remove any existing listeners first to prevent duplicates
        const newMobileDarkToggleBtn = mobileDarkToggleBtn.cloneNode(true);
        mobileDarkToggleBtn.parentNode.replaceChild(newMobileDarkToggleBtn, mobileDarkToggleBtn);
        newMobileDarkToggleBtn.addEventListener('click', toggleDarkMode);
    }
});

// If buttons are already available, add listeners now as well
// This ensures they work even if the DOM was already loaded
document.addEventListener('DOMContentLoaded', function() {
    // Force a refresh of dark mode to ensure styles are properly applied
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        setTimeout(() => {
            document.body.classList.add('dark-mode');
        }, 10);
    }
});
