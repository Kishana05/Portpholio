/**
 * Network visualization background
 * Creates an interactive network background similar to the example
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create canvas for network
    const canvas = document.createElement('canvas');
    canvas.id = 'network-canvas';
    document.body.appendChild(canvas);

    // Style the canvas
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    const ctx = canvas.getContext('2d');
    const nodes = [];
    const nodeCount = 200; // Maximum node count for ultra-dense network
    const connectionDistance = 280; // Extended connection distance for more connections
    const mouseInfluenceRadius = 300; // Mouse influence radius
    let particleEffect = true; // Particle burst effect enabled by default
    let mouseX = 0;
    let mouseY = 0;
    let animationFrame;

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createNodes();
    }

    // Create nodes
    function createNodes() {
        nodes.length = 0;
        // Create different sized nodes for more visual interest
        for (let i = 0; i < nodeCount; i++) {
            // Create some larger, brighter nodes as focal points
            const isFocalNode = Math.random() < 0.1; // 10% chance of being a focal node
            
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: isFocalNode ? Math.random() * 3 + 2 : Math.random() * 2 + 1,
                vx: Math.random() * 0.3 - 0.15,
                vy: Math.random() * 0.3 - 0.15,
                connected: [],
                color: isFocalNode ? '#FF7E45' : '#E25822', // Brighter orange for focal nodes
                glowSize: isFocalNode ? 4 : 2.5,
                opacity: isFocalNode ? 1 : 0.8,
                // Add slight pulsing effect
                pulse: {
                    active: Math.random() < 0.3, // 30% of nodes pulse
                    min: 0.7,
                    max: 1.0,
                    speed: 0.01 + (Math.random() * 0.02),
                    value: Math.random(),
                    direction: 1
                }
            });
        }
        
        // Create some clusters for more interesting formations
        createNodeClusters();
    }
    
    // Create clusters of nodes
    function createNodeClusters() {
        // Create 3-5 cluster centers
        const clusterCount = Math.floor(Math.random() * 3) + 3;
        const clusters = [];
        
        for (let i = 0; i < clusterCount; i++) {
            clusters.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                strength: Math.random() * 0.5 + 0.5
            });
        }
        
        // Add cluster influence to 40% of nodes
        const clusterNodeCount = Math.floor(nodeCount * 0.4);
        for (let i = 0; i < clusterNodeCount; i++) {
            // Select a random node
            const nodeIndex = Math.floor(Math.random() * nodes.length);
            const node = nodes[nodeIndex];
            
            // Assign it to a random cluster
            const clusterIndex = Math.floor(Math.random() * clusters.length);
            const cluster = clusters[clusterIndex];
            
            // Move node closer to cluster
            const distanceToCluster = 100 + Math.random() * 150;
            const angle = Math.random() * Math.PI * 2;
            
            node.x = cluster.x + Math.cos(angle) * distanceToCluster;
            node.y = cluster.y + Math.sin(angle) * distanceToCluster;
            
            // Ensure within bounds
            node.x = Math.max(0, Math.min(canvas.width, node.x));
            node.y = Math.max(0, Math.min(canvas.height, node.y));
            
            // Make it a bit brighter
            node.color = '#FF7E45';
            node.opacity = 0.9;
        }
    }

    // Draw the network
    function drawNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update node positions and connections
        updateNodes();
        
        // Draw connections first (lines between nodes)
        drawConnections();
        
        // Then draw nodes (circles)
        drawNodes();
        
        // Request next frame
        animationFrame = requestAnimationFrame(drawNetwork);
    }

    // Update node positions and handle lifecycle
    function updateNodes() {
        // Reset connections
        nodes.forEach(node => {
            node.connected = [];
        });

        // Filter out expired nodes
        nodes = nodes.filter(node => {
            if (node.lifespan !== undefined) {
                node.lifespan--;
                
                // Apply fade effect
                if (node.fade && node.fade.active) {
                    node.opacity = Math.max(0, node.opacity - node.fade.speed);
                }
                
                return node.lifespan > 0;
            }
            return true;
        });

        // Update positions and find connections
        nodes.forEach((node, i) => {
            // Mouse influence
            if (mouseX && mouseY) {
                const dx = mouseX - node.x;
                const dy = mouseY - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Repel nodes from mouse cursor
                if (distance < mouseInfluenceRadius) {
                    const force = (mouseInfluenceRadius - distance) / mouseInfluenceRadius;
                    const repelX = dx / distance * force * -0.5;
                    const repelY = dy / distance * force * -0.5;
                    
                    node.vx += repelX;
                    node.vy += repelY;
                    
                    // Add slight speed boost for more activity
                    node.vx *= 1.05;
                    node.vy *= 1.05;
                    
                    // Highlight nodes influenced by mouse
                    if (distance < mouseInfluenceRadius * 0.3) {
                        node.color = '#FF7E45'; // Briefly highlight closer nodes
                        node.glowSize = 3.5; // Temporarily increase glow
                    }
                }
            }
            
            // Move node
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off edges with energy loss
            if (node.x < 0 || node.x > canvas.width) {
                node.vx *= -0.8; // Lose some energy when bouncing
                node.x = node.x < 0 ? 0 : canvas.width;
            }
            if (node.y < 0 || node.y > canvas.height) {
                node.vy *= -0.8;
                node.y = node.y < 0 ? 0 : canvas.height;
            }
            
            // Limit velocity to prevent extreme speeds
            const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
            if (speed > 2) {
                node.vx = (node.vx / speed) * 2;
                node.vy = (node.vy / speed) * 2;
            }
            
            // Apply slight gravity effect to simulate more realistic movement
            node.vy += 0.003;
            
            // Apply very slight friction
            node.vx *= 0.99;
            node.vy *= 0.99;
            
            // Find connections to other nodes
            for (let j = i + 1; j < nodes.length; j++) {
                const otherNode = nodes[j];
                const dx = otherNode.x - node.x;
                const dy = otherNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Dynamic connection distance based on node size
                const effectiveDistance = connectionDistance * 
                    ((node.radius + otherNode.radius) / 3);
                    
                if (distance < effectiveDistance) {
                    node.connected.push(j);
                }
            }
        });
    }

    // Draw connections between nodes
    function drawConnections() {
        nodes.forEach((node, i) => {
            node.connected.forEach(j => {
                const otherNode = nodes[j];
                const dx = otherNode.x - node.x;
                const dy = otherNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate opacity based on distance
                const opacity = Math.pow(1 - (distance / connectionDistance), 1.8); // Steeper falloff for more dramatic effect
                
                // Use brighter colors for closer connections
                const startColor = distance < 100 ? '#FF7E45' : '#E25822';
                const endColor = distance < 100 ? '#E25822' : '#A73C12';
                
                // Gradient lines for better visibility
                const gradient = ctx.createLinearGradient(node.x, node.y, otherNode.x, otherNode.y);
                gradient.addColorStop(0, `rgba(${hexToRgb(startColor)}, ${opacity})`);
                gradient.addColorStop(1, `rgba(${hexToRgb(endColor)}, ${opacity * 0.7})`);
                
                // Vary line width based on node size and distance
                const lineWidth = Math.min(node.radius, otherNode.radius) * 0.3 + 0.3;
                ctx.lineWidth = distance < 100 ? lineWidth * 1.5 : lineWidth;
                
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(otherNode.x, otherNode.y);
                ctx.stroke();
            });
        });
    }
    
    // Convert hex color to rgb string
    function hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse components
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }

    // Draw nodes
    function drawNodes() {
        nodes.forEach(node => {
            // Update pulse effect
            if (node.pulse && node.pulse.active) {
                node.pulse.value += node.pulse.speed * node.pulse.direction;
                if (node.pulse.value >= 1) {
                    node.pulse.value = 1;
                    node.pulse.direction = -1;
                } else if (node.pulse.value <= 0) {
                    node.pulse.value = 0;
                    node.pulse.direction = 1;
                }
                
                // Calculate current opacity based on pulse with enhanced contrast
                const pulseOpacity = node.pulse.min + (node.pulse.max - node.pulse.min) * node.pulse.value;
                // Apply a quadratic curve to make the pulse more pronounced
                const enhancedPulse = Math.pow(pulseOpacity, 1.5);
                node.currentOpacity = node.opacity * enhancedPulse;
            } else {
                node.currentOpacity = node.opacity;
            }
            
            // Add enhanced glow effect to nodes
            const glowSize = node.glowSize || 3.5; // Larger default glow
            const glowRadius = node.radius * glowSize;
            // Add extra glow for nodes near mouse
            const isNearMouse = mouseX && mouseY && 
                Math.sqrt(Math.pow(node.x - mouseX, 2) + Math.pow(node.y - mouseY, 2)) < 150;
            
            const gradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, glowRadius
            );
            
            // Use the node's color or default with enhanced glow for mouse proximity
            const nodeColor = isNearMouse ? '#FF9D6C' : (node.color || '#E25822');
            const glowIntensity = isNearMouse ? 0.6 : 0.3; // Stronger glow for mouse-adjacent nodes
            
            gradient.addColorStop(0, nodeColor);
            gradient.addColorStop(0.4, `rgba(${hexToRgb(nodeColor)}, ${glowIntensity})`);
            gradient.addColorStop(0.7, `rgba(${hexToRgb(nodeColor)}, ${glowIntensity/2})`);
            gradient.addColorStop(1, `rgba(${hexToRgb(nodeColor)}, 0)`);
            
            // Draw glow
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw node core
            ctx.fillStyle = nodeColor;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw highlight on top of node for more 3D look
            const highlight = ctx.createRadialGradient(
                node.x - node.radius * 0.3, node.y - node.radius * 0.3, 0,
                node.x, node.y, node.radius
            );
            highlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = highlight;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Track mouse for interaction with increased sensitivity
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Create additional nodes near mouse movement for interactive effect
        if (Math.random() < 0.1) { // 10% chance on each mouse move to add a temporary node
            const tempNode = {
                x: mouseX + (Math.random() * 120 - 60),
                y: mouseY + (Math.random() * 120 - 60),
                radius: Math.random() * 2.5 + 1,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                connected: [],
                color: '#FF7E45',
                glowSize: 3,
                opacity: 0.9,
                // Remove after some time
                lifespan: 150
            };
            nodes.push(tempNode);
            
            // Limit total nodes
            if (nodes.length > nodeCount + 30) {
                // Remove oldest temporary nodes
                nodes.shift();
            }
        }
    });
    
    // Create automatic particles around mouse even without clicks
    setInterval(() => {
        if (particleEffect && mouseX && mouseY && Math.random() < 0.3) {
            // Occasionally create small bursts automatically
            const miniCount = 3 + Math.floor(Math.random() * 4);
            for (let i = 0; i < miniCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 60;
                const speed = 0.5 + Math.random() * 1.5;
                
                nodes.push({
                    x: mouseX + Math.cos(angle) * distance,
                    y: mouseY + Math.sin(angle) * distance,
                    radius: Math.random() * 1.5 + 0.8,
                    vx: Math.cos(angle) * speed * 0.5,
                    vy: Math.sin(angle) * speed * 0.5,
                    connected: [],
                    color: '#FF9D6C',
                    glowSize: 3,
                    opacity: 0.7,
                    lifespan: 40,
                    fade: { active: true, speed: 0.03 }
                });
            }
        }
    }, 300); // Every 300ms check if we should create particles
    
    // Create particle burst on click
    document.addEventListener('click', (e) => {
        if (!particleEffect) return;
        
        // Create a burst of nodes from click position
        const burstCount = 15;
        for (let i = 0; i < burstCount; i++) {
            // Calculate random angle and velocity
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            
            const burstNode = {
                x: e.clientX,
                y: e.clientY,
                radius: Math.random() * 2 + 1,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                connected: [],
                color: '#FF7E45',
                glowSize: 4,
                opacity: 1,
                lifespan: 60, // Shorter lifespan
                // Fade out effect
                fade: {
                    active: true,
                    speed: 0.02
                }
            };
            nodes.push(burstNode);
        }
    });
    
    // Toggle particle effect with keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            particleEffect = !particleEffect;
            console.log(`Particle effect ${particleEffect ? 'enabled' : 'disabled'}`);
        }
    });
    
    // Handle mouse leave
    document.addEventListener('mouseleave', () => {
        mouseX = null;
        mouseY = null;
    });

    // Handle window resizing
    window.addEventListener('resize', resizeCanvas);
    
    // Pause animation when page is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            animationFrame = requestAnimationFrame(drawNetwork);
        }
    });

    // Initialize
    resizeCanvas();
    drawNetwork();
});
