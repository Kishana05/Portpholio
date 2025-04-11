/**
 * Particle animation system for the portfolio
 * Creates an attractive background effect with interactive particles
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create canvas element for particles
    const particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'particle-canvas';
    document.body.appendChild(particleCanvas);
    
    // Style the canvas
    particleCanvas.style.position = 'fixed';
    particleCanvas.style.top = '0';
    particleCanvas.style.left = '0';
    particleCanvas.style.width = '100%';
    particleCanvas.style.height = '100%';
    particleCanvas.style.pointerEvents = 'none';
    particleCanvas.style.zIndex = '0';
    
    // Get the canvas context
    const ctx = particleCanvas.getContext('2d');
    
    // Set canvas size to match window
    function resizeCanvas() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }
    
    // Call resize initially and on window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            // Get theme colors from CSS variables
            const primaryColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--primary-color')
                .trim();
            const secondaryColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--secondary-color')
                .trim();
                
            // Random position
            this.x = Math.random() * particleCanvas.width;
            this.y = Math.random() * particleCanvas.height;
            
            // Random size between 1 and 3
            this.size = Math.random() * 2 + 1;
            
            // Random velocity
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            
            // Random color based on theme
            this.color = Math.random() > 0.5 ? primaryColor : secondaryColor;
            
            // Random opacity
            this.alpha = Math.random() * 0.6 + 0.2;
            
            // For connection lines
            this.connections = [];
        }
        
        update() {
            // Move particle
            this.x += this.vx;
            this.y += this.vy;
            
            // Reset if out of bounds
            if (this.x < 0 || this.x > particleCanvas.width || 
                this.y < 0 || this.y > particleCanvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    // Create particles
    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 100); // Limit based on screen size
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Mouse position for interactive effect
    let mouse = {
        x: null,
        y: null,
        radius: 150
    };
    
    window.addEventListener('mousemove', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    
    // Animation loop
    function animate() {
        // Check if dark mode is active
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Clear canvas with very faint background
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            // Connect particles that are close to each other
            particles[i].connections = [];
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    particles[i].connections.push(j);
                    
                    // Draw connection line
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = isDarkMode ? 'rgba(100, 180, 255, 0.1)' : 'rgba(44, 62, 80, 0.1)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
            
            // Interactive effect with mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    // Calculate push effect
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    
                    // Apply force to particle
                    particles[i].x += forceDirectionX * force * 2;
                    particles[i].y += forceDirectionY * force * 2;
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Add event listener to disable animation when page is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Stop intensive animations
            particleCanvas.style.display = 'none';
        } else {
            // Resume animations
            particleCanvas.style.display = 'block';
        }
    });
});
