document.addEventListener("DOMContentLoaded", () => {
    
    // 1. LENIS SMOOTH SCROLL
    let lenis;
    const content = document.getElementById('content-skew');
    
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            if (content) {
                let skew = lenis.velocity * 0.15;
                content.style.transform = `skewY(${skew}deg)`;
            }
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    } else {
        document.body.style.overflow = 'auto';
    }

    // 2. HACKER TEXT
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    document.querySelectorAll(".hacker-text").forEach(element => {
        element.addEventListener("mouseover", event => {
            let iterations = 0;
            const originalText = element.dataset.value;
            const interval = setInterval(() => {
                event.target.innerText = event.target.innerText
                    .split("").map((letter, index) => {
                        if(index < iterations) return originalText[index];
                        return letters[Math.floor(Math.random() * 26)];
                    }).join("");
                if(iterations >= originalText.length) clearInterval(interval);
                iterations += 1 / 3;
            }, 30);
        });
    });

    // 3. CURSOR
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });
    }

    // 4. PRELOADER
    const tl = gsap.timeline();
    let counter = 0;
    const counterElement = document.querySelector('.counter');
    document.body.style.overflow = 'hidden';

    const loaderInterval = setInterval(() => {
        if(counter === 100) {
            clearInterval(loaderInterval);
            revealSite();
        } else {
            counter += Math.floor(Math.random() * 5) + 1;
            if(counter > 100) counter = 100;
            counterElement.textContent = counter.toString().padStart(3, '0');
        }
    }, 20);

    function revealSite() {
        tl.to('.preloader', {
            y: '-100%',
            duration: 1.5,
            ease: 'power4.inOut',
            onComplete: () => { document.body.style.overflow = ''; }
        })
        .to('.hero-title span', {
            y: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power3.out'
        }, "-=1")
        .from('.hero-footer', {
            opacity: 0,
            y: 30,
            duration: 1
        }, "-=0.8");
    }

    // 5. PROJECT HOVER REVEAL (CORREÇÃO DE POSIÇÃO)
    const projectItems = document.querySelectorAll('.project-item');
    const revealContainer = document.querySelector('.hover-reveal');
    const revealImg = document.querySelector('.reveal-img');

    // Movimento suave seguindo o mouse
    window.addEventListener('mousemove', (e) => {
        gsap.to(revealContainer, {
            x: e.clientX,
            y: e.clientY,
            xPercent: -50,
            yPercent: -50,
            duration: 0.5,
            ease: 'power2.out'
        });
    });

    projectItems.forEach(item => {
        // CORREÇÃO: Passamos o evento (e) para pegar a posição inicial exata
        item.addEventListener('mouseenter', (e) => {
            const imgUrl = item.getAttribute('data-img');
            revealImg.src = imgUrl;
            
            // FORÇA a posição inicial para onde o mouse está AGORA
            // Evita que a imagem apareça no canto (0,0)
            gsap.set(revealContainer, { 
                x: e.clientX, 
                y: e.clientY,
                xPercent: -50,
                yPercent: -50
            });
            
            // Agora sim faz o fade in
            gsap.to(revealContainer, { opacity: 1, duration: 0.3, scale: 1 });
            gsap.to(revealImg, { scale: 1, duration: 0.3 });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(revealContainer, { opacity: 0, duration: 0.3, scale: 0.8 });
            gsap.to(revealImg, { scale: 1.2, duration: 0.3 });
        });
    });

    // 6. WEBGL
    if (typeof THREE !== 'undefined' && document.getElementById('webgl-container')) {
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050505, 0.002);
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        const container = document.getElementById('webgl-container');
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const count = 2000;
        const positions = new Float32Array(count * 3);
        for(let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 40;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            size: 0.04, color: 0xffffff, transparent: true, opacity: 0.4
        });
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        camera.position.z = 15;
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        const clock = new THREE.Clock();
        function animate() {
            targetX = mouseX * 0.5;
            targetY = mouseY * 0.5;
            particles.rotation.y += 0.002;
            particles.rotation.x += (targetY - particles.rotation.x) * 0.05;
            particles.rotation.y += (targetX - particles.rotation.y) * 0.05;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // 7. PARALLAX
    if(document.querySelector(".profile-pic")) {
        gsap.to(".profile-pic", {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
                trigger: ".about-container",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    }
});
