/**
 * Modern 3D Particle Effect
 * Inspired by modern portfolio designs
 */

// Initialize the particles effect on window load
window.addEventListener('load', () => {
    initParticles();
});

function initParticles() {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Get canvas context
    const ctx = canvas.getContext('2d');

    // Configuration - adjusted to complement network background
    const config = {
        particleCount: 80, // Reduced count to avoid overwhelming with network background
        particleColor: '#4a89dc', // Blue hue to complement orange network
        lineColor: 'rgba(74, 137, 220, 0.2)', // Reduced opacity
        particleRadius: 1.2, // Slightly smaller particles
        lineWidth: 0.4, // Thinner lines
        mouseRadius: 180, // Increased interaction radius
        speed: 0.4, // Slightly slower
        direction: {
            x: 0.25,
            y: 0.4
        },
        interactive: true
    };

    // Particle array
    let particles = [];

    // Mouse position
    let mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        active: false
    };

    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    // Handle mouse movement
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    // Handle mouse leave
    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    // Initialize particles
    function init() {
        particles = [];

        // Create particles
        for (let i = 0; i < config.particleCount; i++) {
            const radius = Math.random() * config.particleRadius + 0.5;
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * config.speed,
                vy: (Math.random() - 0.5) * config.speed,
                radius: radius,
                color: config.particleColor,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }

    // Draw particles
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'screen'; // Changed to 'screen' for better blending with network

        // Draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = `rgba(74, 137, 220, ${p.opacity})`;
            ctx.fill();
        }

        // Draw connections
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const distance = Math.sqrt(
                    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
                );
                
                if (distance < 100) {
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(74, 137, 220, ${0.2 * (1 - distance/100)})`;
                    ctx.lineWidth = config.lineWidth;
                }
            }
        }
        ctx.stroke();

        // Draw mouse connections
        if (mouse.active && config.interactive) {
            ctx.beginPath();
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const distance = Math.sqrt(
                    Math.pow(p.x - mouse.x, 2) + Math.pow(p.y - mouse.y, 2)
                );
                
                if (distance < config.mouseRadius) {
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    const opacity = 1 - distance / config.mouseRadius;
                    ctx.strokeStyle = `rgba(74, 137, 220, ${opacity * 0.5})`;
                    ctx.lineWidth = config.lineWidth * 1.5;
                }
            }
            ctx.stroke();
        }

        // Draw a glowing mouse dot
        if (mouse.active && config.interactive) {
            const gradient = ctx.createRadialGradient(
                mouse.x, mouse.y, 0,
                mouse.x, mouse.y, 20
            );
            gradient.addColorStop(0, 'rgba(74, 137, 220, 0.3)');
            gradient.addColorStop(1, 'rgba(74, 137, 220, 0)');
            
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    // Update particles
    function update() {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Apply global direction
            p.vx += config.direction.x * 0.01;
            p.vy += config.direction.y * 0.01;

            // Mouse interaction
            if (mouse.active && config.interactive) {
                const distance = Math.sqrt(
                    Math.pow(p.x - mouse.x, 2) + Math.pow(p.y - mouse.y, 2)
                );
                
                if (distance < config.mouseRadius) {
                    const force = (config.mouseRadius - distance) / config.mouseRadius;
                    const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x);
                    p.vx += Math.cos(angle) * force * 0.2;
                    p.vy += Math.sin(angle) * force * 0.2;
                }
            }

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Limit speed
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > config.speed) {
                p.vx = (p.vx / speed) * config.speed;
                p.vy = (p.vy / speed) * config.speed;
            }

            // Add friction
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Bounce off edges or wrap around
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
        }
    }

    // Animation loop
    function animate() {
        update();
        draw();
        requestAnimationFrame(animate);
    }

    // Start animation
    init();
    animate();
}
