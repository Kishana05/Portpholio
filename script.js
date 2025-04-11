// Configuration options
const config = {
    // Store API key safely or use a service that handles this server-side
    apiKey: '', // Don't store actual API keys in client-side code
    chatEndpoint: '/api/chat',
    maxMessageLength: 500,
    animationDuration: 1000,
    scrollOffset: 100
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive components
    initMobileMenu();
    initSkillsAnimation();
    initScrollSpy();
    initContactForm();
    initSidebarNavigation();
    updateCopyrightYear();
    addParticleBackground();
});

// Mobile sidebar toggle functionality with overlay support
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const sidebarNav = document.getElementById('sidebar-nav');
    
    if (mobileToggle && sidebarNav) {
        mobileToggle.addEventListener('click', function() {
            sidebarNav.classList.toggle('active');
            const isExpanded = sidebarNav.classList.contains('active');
            mobileToggle.setAttribute('aria-expanded', isExpanded);
            mobileToggle.setAttribute('aria-label', isExpanded ? 'Close navigation menu' : 'Open navigation menu');
            mobileToggle.innerHTML = isExpanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
}

// Enhanced sidebar navigation
function initSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('section');
    
    // Add hover animations for icons
    sidebarLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const icon = link.querySelector('i');
            if (icon) {
                icon.style.transform = 'translateY(-3px)';
            }
        });
        
        link.addEventListener('mouseleave', () => {
            const icon = link.querySelector('i');
            if (icon) {
                icon.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Handle smooth scrolling for sidebar links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 50,
                    behavior: 'smooth'
                });
                
                // Update active state
                sidebarLinks.forEach(link => {
                    if (link.parentElement) {
                        link.parentElement.classList.remove('active');
                    }
                });
                if (this.parentElement) {
                    this.parentElement.classList.add('active');
                }
                
                // Close mobile menu if open
                const sidebar = document.getElementById('sidebar-nav');
                const mobileToggle = document.querySelector('.mobile-toggle');
                if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    if (mobileToggle) {
                        mobileToggle.setAttribute('aria-expanded', 'false');
                        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            }
        });
    });
}

// Skills animation functionality
function initSkillsAnimation() {
    const skillBars = document.querySelectorAll('.progress-bar');
    const skillCategories = document.querySelectorAll('.skill-category');
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight && rect.bottom > 0
        );
    }
    
    // Function to animate skill bars
    function animateSkillBars() {
        skillBars.forEach(bar => {
            if (isInViewport(bar) && !bar.classList.contains('animated')) {
                const width = bar.getAttribute('data-width');
                if (width) {
                    bar.style.setProperty('--width', width);
                    bar.textContent = width;
                    bar.classList.add('animate', 'animated');
                }
            }
        });
    }
    
    // Function to animate skill categories
    function animateSkillCategories() {
        skillCategories.forEach(category => {
            if (isInViewport(category)) {
                category.classList.add('visible');
            }
        });
    }
    
    // Initial check
    animateSkillBars();
    animateSkillCategories();
    
    // Add scroll event listener with throttle
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                animateSkillBars();
                animateSkillCategories();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

// Scroll spy functionality
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.sidebar-nav li');
    
    // Function to update active navigation based on scroll position
    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100; // Add offset
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    const link = item.querySelector('a');
                    if (link && link.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Initial update
    updateActiveNav();
    
    // Update on scroll with throttle
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                updateActiveNav();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

// Add floating background elements to enhance visuals
function addParticleBackground() {
    const hero = document.querySelector('#hero');
    if (hero) {
        // Create decorative elements
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'hero-particle';
            
            // Random properties
            const size = Math.random() * 100 + 50;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random position
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            particle.style.top = `${top}%`;
            particle.style.left = `${left}%`;
            
            // Random animation delay
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            // Add to hero
            hero.appendChild(particle);
        }
    }
}

// Update copyright year
function updateCopyrightYear() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}

// Handle contact form submission
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const subject = document.getElementById('subject')?.value || '';
            const message = document.getElementById('message')?.value || '';
            
            // In a real application, you would send this data to a server
            console.log('Form submitted:', { name, email, subject, message });
            
            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }
}