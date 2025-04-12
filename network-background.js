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
    const nodeCount = 300; // Increased node count for even denser network
    const connectionDistance = 350; // Increased connection distance for more connections
    const mouseInfluenceRadius = 400; // Increased mouse influence radius
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
            // Create more larger, brighter nodes as focal points
            const isFocalNode = Math.random() < 0.2; // 20% chance of being a focal node
            
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: isFocalNode ? Math.random() * 4 + 3 : Math.random() * 2.5 + 1.5, // Larger node radius
                vx: Math.random() * 0.35 - 0.175, // Slightly faster movement
                vy: Math.random() * 0.35 - 0.175,
                connected: [],
                color: isFocalNode ? '#FF9966' : '#E25822', // Brighter orange for focal nodes
                glowSize: isFocalNode ? 6 : 3.5, // Increased glow effect
                opacity: isFocalNode ? 1 : 0.85, // Higher base opacity
                // Enhanced pulsing effect
                pulse: {
                    active: Math.random() < 0.5, // 50% of nodes pulse
                    min: 0.65,
                    max: 1.0,
                    speed: 0.015 + (Math.random() * 0.025), // Faster pulsing
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
                        node.glowSize = 5; // Temporarily increase glow
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
        // Clear connections
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].connected = [];
        }
        
        // Draw connections between nodes that are close enough
        for (let i = 0; i < nodes.length; i++) {
            const nodeA = nodes[i];
            
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeB = nodes[j];
                
                // Calculate distance between nodes
                const dx = nodeB.x - nodeA.x;
                const dy = nodeB.y - nodeA.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    // Track connection
                    nodeA.connected.push(j);
                    nodeB.connected.push(i);
                    
                    // Calculate opacity based on distance (increased minimum opacity)
                    const opacity = Math.max(0.2, (1 - distance / connectionDistance) * 0.7);
                    
                    // Determine line width based on distance (thicker for closer nodes)
                    const lineWidth = Math.max(0.5, (1 - distance / connectionDistance) * 1.5);
                    
                    // Draw line with gradient
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(nodeB.x, nodeB.y);
                    ctx.strokeStyle = `rgba(226, 88, 34, ${opacity})`;
                    ctx.lineWidth = lineWidth;
                    ctx.stroke();
                }
            }
        }
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
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            
            // Update node pulse effect if active - enhanced pulsing
            if (node.pulse && node.pulse.active) {
                node.pulse.value += node.pulse.speed * node.pulse.direction;
                if (node.pulse.value >= 1) {
                    node.pulse.value = 1;
                    node.pulse.direction = -1;
                } else if (node.pulse.value <= 0) {
                    node.pulse.value = 0;
                    node.pulse.direction = 1;
                }
                
                // Calculate current opacity based on pulse with stronger effect
                node.currentOpacity = node.pulse.min + (node.pulse.max - node.pulse.min) * node.pulse.value;
                // Apply more dynamic radius based on pulse
                node.currentRadius = node.radius * (0.85 + node.pulse.value * 0.3);
            } else {
                node.currentOpacity = node.opacity;
                node.currentRadius = node.radius;
            }
            
            // Add enhanced glow effect to nodes
            const glowSize = node.glowSize || 5; // Larger default glow
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
            // Draw node with enhanced shadow glow
            const rgb = hexToRgb(node.color);
            ctx.shadowColor = node.color;
            ctx.shadowBlur = node.glowSize * (node.pulse && node.pulse.active ? (0.8 + node.pulse.value * 0.5) : 1);
            ctx.beginPath();
            
            // Use current radius if available, otherwise use base radius
            const displayRadius = node.currentRadius || node.radius;
            
            ctx.arc(node.x, node.y, displayRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb}, ${node.currentOpacity})`;
            ctx.fill();
            // Draw highlight on top of node for more 3D look
            const highlight = ctx.createRadialGradient(
                node.x - node.radius * 0.3, node.y - node.radius * 0.3, 0,
                node.x, node.y, node.radius
            );
            highlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = highlight;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();
        }
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
        if (particleEffect && mouseX && mouseY && Math.random() < 0.4) { // Increased probability
            // Occasionally create small bursts automatically
            const miniCount = 4 + Math.floor(Math.random() * 5); // More particles
            for (let i = 0; i < miniCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 80; // Larger spread
                const speed = 0.7 + Math.random() * 1.8; // Faster movement
                
                nodes.push({
                    x: mouseX + Math.cos(angle) * distance,
                    y: mouseY + Math.sin(angle) * distance,
                    radius: Math.random() * 2.5 + 1.2, // Larger particles
                    vx: Math.cos(angle) * speed * 0.6,
                    vy: Math.sin(angle) * speed * 0.6,
                    connected: [],
                    color: '#FF9D6C',
                    glowSize: 4.5, // Increased glow
                    opacity: 0.85, // Higher opacity
                    lifespan: 60, // Longer lifespan
                    fade: { active: true, speed: 0.025 }
                });
            }
        }
    }, 250); // More frequent checks
    
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
