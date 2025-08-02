// F1 Live Hub - Interactive JavaScript
class F1LiveHub {
    constructor() {
        this.currentSeason = new Date().getFullYear();
        this.apiBase = 'https://ergast.com/api/f1';
        this.currentTrackIndex = 0;
        this.tracks = [];
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.loadInitialData();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.hideLoadingScreen();
        this.animateOnScroll();
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 2000);
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadDriverStandings(),
                this.loadConstructorStandings(),
                this.loadTopDrivers(),
                this.loadRaceTracks(),
                this.loadCurrentRaceInfo(),
                this.loadSeasonStats()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showErrorMessage('Failed to load F1 data. Please refresh the page.');
        }
    }

    async fetchF1Data(endpoint) {
        try {
            const response = await fetch(`${this.apiBase}/${endpoint}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.MRData;
        } catch (error) {
            console.error('API fetch error:', error);
            return null;
        }
    }

    async loadDriverStandings() {
        const data = await this.fetchF1Data(`${this.currentSeason}/driverStandings`);
        if (data && data.StandingsTable.StandingsLists[0]) {
            const standings = data.StandingsTable.StandingsLists[0].DriverStandings;
            this.renderDriverStandings(standings);
        }
    }

    async loadConstructorStandings() {
        const data = await this.fetchF1Data(`${this.currentSeason}/constructorStandings`);
        if (data && data.StandingsTable.StandingsLists[0]) {
            const standings = data.StandingsTable.StandingsLists[0].ConstructorStandings;
            this.renderConstructorStandings(standings);
        }
    }

    async loadTopDrivers() {
        const data = await this.fetchF1Data(`${this.currentSeason}/driverStandings`);
        if (data && data.StandingsTable.StandingsLists[0]) {
            const drivers = data.StandingsTable.StandingsLists[0].DriverStandings.slice(0, 6);
            this.renderTopDrivers(drivers);
        }
    }

    async loadRaceTracks() {
        const data = await this.fetchF1Data(`${this.currentSeason}/circuits`);
        if (data && data.CircuitTable.Circuits) {
            this.tracks = data.CircuitTable.Circuits;
            this.renderRaceTracks();
        }
    }

    async loadCurrentRaceInfo() {
        const data = await this.fetchF1Data(`${this.currentSeason}/next`);
        if (data && data.RaceTable.Races[0]) {
            const race = data.RaceTable.Races[0];
            this.renderCurrentRaceInfo(race);
            this.startRaceCountdown(race);
        }
    }

    async loadSeasonStats() {
        const raceData = await this.fetchF1Data(`${this.currentSeason}/races`);
        if (raceData && raceData.RaceTable.Races) {
            const races = raceData.RaceTable.Races;
            const completedRaces = races.filter(race => new Date(race.date) < new Date()).length;
            
            document.getElementById('races-completed').textContent = completedRaces;
            document.getElementById('current-season').textContent = this.currentSeason;
            document.getElementById('total-races').textContent = races.length;
        }
    }

    renderDriverStandings(standings) {
        const container = document.getElementById('drivers-standings');
        container.innerHTML = '';

        standings.forEach((standing, index) => {
            const driver = standing.Driver;
            const constructor = standing.Constructors[0];
            
            const standingElement = document.createElement('div');
            standingElement.className = 'standing-item fade-in-up';
            standingElement.style.animationDelay = `${index * 0.1}s`;
            
            standingElement.innerHTML = `
                <div class="standing-position">${standing.position}</div>
                <div class="standing-info">
                    <div class="standing-name">${driver.givenName} ${driver.familyName}</div>
                    <div class="standing-team">${constructor.name}</div>
                </div>
                <div class="standing-points">${standing.points}</div>
            `;
            
            container.appendChild(standingElement);
        });
    }

    renderConstructorStandings(standings) {
        const container = document.getElementById('constructors-standings');
        container.innerHTML = '';

        standings.forEach((standing, index) => {
            const constructor = standing.Constructor;
            
            const standingElement = document.createElement('div');
            standingElement.className = 'standing-item fade-in-up';
            standingElement.style.animationDelay = `${index * 0.1}s`;
            
            standingElement.innerHTML = `
                <div class="standing-position">${standing.position}</div>
                <div class="standing-info">
                    <div class="standing-name">${constructor.name}</div>
                    <div class="standing-team">${constructor.nationality}</div>
                </div>
                <div class="standing-points">${standing.points}</div>
            `;
            
            container.appendChild(standingElement);
        });
    }

    renderTopDrivers(drivers) {
        const container = document.getElementById('drivers-grid');
        container.innerHTML = '';

        const driverImages = [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face'
        ];

        drivers.forEach((standing, index) => {
            const driver = standing.Driver;
            const constructor = standing.Constructors[0];
            
            const driverElement = document.createElement('div');
            driverElement.className = 'driver-card fade-in-up';
            driverElement.style.animationDelay = `${index * 0.2}s`;
            
            driverElement.innerHTML = `
                <img src="${driverImages[index]}" alt="${driver.givenName} ${driver.familyName}" class="driver-image">
                <div class="driver-name">${driver.givenName} ${driver.familyName}</div>
                <div class="driver-team">${constructor.name}</div>
                <div class="driver-stats">
                    <div class="driver-stat">
                        <div class="driver-stat-value">${standing.points}</div>
                        <div class="driver-stat-label">Points</div>
                    </div>
                    <div class="driver-stat">
                        <div class="driver-stat-value">${standing.wins}</div>
                        <div class="driver-stat-label">Wins</div>
                    </div>
                    <div class="driver-stat">
                        <div class="driver-stat-value">#${standing.position}</div>
                        <div class="driver-stat-label">Position</div>
                    </div>
                </div>
            `;
            
            container.appendChild(driverElement);
        });
    }

    renderRaceTracks() {
        const container = document.getElementById('tracks-container');
        container.innerHTML = '';

        const trackImages = [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1583900985737-6d0495555783?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop'
        ];

        this.tracks.slice(0, 10).forEach((circuit, index) => {
            const trackElement = document.createElement('div');
            trackElement.className = 'track-card';
            
            trackElement.innerHTML = `
                <img src="${trackImages[index % trackImages.length]}" alt="${circuit.circuitName}" class="track-image">
                <div class="track-info">
                    <div class="track-name">${circuit.circuitName}</div>
                    <div class="track-location">${circuit.Location.locality}, ${circuit.Location.country}</div>
                    <div class="track-details">
                        <div class="track-detail">
                            <div class="track-detail-value">5.891</div>
                            <div class="track-detail-label">Length (km)</div>
                        </div>
                        <div class="track-detail">
                            <div class="track-detail-value">52</div>
                            <div class="track-detail-label">Laps</div>
                        </div>
                        <div class="track-detail">
                            <div class="track-detail-value">18</div>
                            <div class="track-detail-label">Turns</div>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(trackElement);
        });
    }

    renderCurrentRaceInfo(race) {
        const countryCode = this.getCountryCode(race.Circuit.Location.country);
        
        document.getElementById('race-name').textContent = race.raceName;
        document.getElementById('race-location').textContent = race.Circuit.circuitName;
        document.getElementById('race-date').textContent = new Date(race.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('race-time').textContent = race.time ? race.time.slice(0, 5) + ' UTC' : 'TBD';
        document.getElementById('race-flag').src = `https://flagcdn.com/w80/${countryCode}.png`;
        
        // Simulate live positions for demo
        this.renderLivePositions();
    }

    renderLivePositions() {
        const container = document.getElementById('live-positions');
        const demoPositions = [
            { pos: 1, name: 'Max Verstappen', team: 'Red Bull Racing', time: '+0.000' },
            { pos: 2, name: 'Lewis Hamilton', team: 'Mercedes', time: '+0.234' },
            { pos: 3, name: 'Charles Leclerc', team: 'Ferrari', time: '+0.567' },
            { pos: 4, name: 'Lando Norris', team: 'McLaren', time: '+0.891' },
            { pos: 5, name: 'George Russell', team: 'Mercedes', time: '+1.234' }
        ];

        container.innerHTML = '<h3 style="margin-bottom: 1rem; color: var(--text-white);">Current Positions</h3>';
        
        demoPositions.forEach((position, index) => {
            const positionElement = document.createElement('div');
            positionElement.className = 'position-item fade-in-up';
            positionElement.style.animationDelay = `${index * 0.1}s`;
            
            positionElement.innerHTML = `
                <div class="position-number">${position.pos}</div>
                <div class="driver-info">
                    <div class="driver-name">${position.name}</div>
                    <div class="driver-team">${position.team}</div>
                </div>
                <div class="position-time">${position.time}</div>
            `;
            
            container.appendChild(positionElement);
        });
    }

    startRaceCountdown(race) {
        const raceDateTime = new Date(`${race.date}T${race.time || '14:00:00'}`);
        
        const updateCountdown = () => {
            const now = new Date();
            const timeDiff = raceDateTime - now;
            
            if (timeDiff > 0) {
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                
                document.getElementById('next-race-countdown').textContent = `${days}d ${hours}h`;
            } else {
                document.getElementById('next-race-countdown').textContent = 'LIVE';
                document.getElementById('race-status').textContent = 'Live';
                document.getElementById('race-status').style.background = 'var(--gradient-primary)';
            }
        };
        
        updateCountdown();
        setInterval(updateCountdown, 60000); // Update every minute
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Tabs
        this.setupTabs();
        
        // Track carousel
        this.setupTrackCarousel();
        
        // Smooth scrolling
        this.setupSmoothScrolling();
        
        // Mobile menu
        this.setupMobileMenu();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // Update active nav link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
        
        // Update active nav on scroll
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section');
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Update active button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    setupTrackCarousel() {
        const container = document.getElementById('tracks-container');
        const prevBtn = document.getElementById('tracks-prev');
        const nextBtn = document.getElementById('tracks-next');
        
        prevBtn.addEventListener('click', () => {
            this.currentTrackIndex = Math.max(0, this.currentTrackIndex - 1);
            this.updateTrackCarousel();
        });
        
        nextBtn.addEventListener('click', () => {
            const maxIndex = Math.max(0, this.tracks.length - 3);
            this.currentTrackIndex = Math.min(maxIndex, this.currentTrackIndex + 1);
            this.updateTrackCarousel();
        });
    }

    updateTrackCarousel() {
        const container = document.getElementById('tracks-container');
        const translateX = this.currentTrackIndex * -420; // 400px width + 20px gap
        container.style.transform = `translateX(${translateX}px)`;
    }

    setupSmoothScrolling() {
        // Already handled in CSS with scroll-behavior: smooth
    }

    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    startRealTimeUpdates() {
        // Update live positions every 30 seconds (simulated)
        setInterval(() => {
            this.updateLivePositions();
        }, 30000);
        
        // Update standings every 5 minutes
        setInterval(() => {
            this.loadDriverStandings();
            this.loadConstructorStandings();
        }, 300000);
    }

    updateLivePositions() {
        // Simulate position changes
        const positions = document.querySelectorAll('.position-item');
        positions.forEach((pos, index) => {
            const timeElement = pos.querySelector('.position-time');
            if (timeElement && !timeElement.textContent.includes('LIVE')) {
                const currentTime = parseFloat(timeElement.textContent.replace('+', ''));
                const newTime = (currentTime + Math.random() * 0.1).toFixed(3);
                timeElement.textContent = `+${newTime}`;
            }
        });
    }

    animateOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);
        
        // Observe all animatable elements
        const animatableElements = document.querySelectorAll('.standing-item, .driver-card, .track-card, .stat-card');
        animatableElements.forEach(el => observer.observe(el));
    }

    getCountryCode(countryName) {
        const countryCodes = {
            'UK': 'gb',
            'United Kingdom': 'gb',
            'USA': 'us',
            'United States': 'us',
            'UAE': 'ae',
            'Monaco': 'mc',
            'Italy': 'it',
            'Spain': 'es',
            'France': 'fr',
            'Germany': 'de',
            'Netherlands': 'nl',
            'Belgium': 'be',
            'Austria': 'at',
            'Hungary': 'hu',
            'Singapore': 'sg',
            'Japan': 'jp',
            'Australia': 'au',
            'Brazil': 'br',
            'Mexico': 'mx',
            'Canada': 'ca'
        };
        
        return countryCodes[countryName] || 'gb';
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-red);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Enhanced interactions and effects
class F1Effects {
    constructor() {
        this.init();
    }

    init() {
        this.addParallaxEffect();
        this.addHoverEffects();
        this.addTypingEffect();
        this.addParticleEffect();
    }

    addParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroBackground = document.querySelector('.hero-background');
            const heroCar = document.querySelector('.hero-car');
            
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
            
            if (heroCar) {
                heroCar.style.transform = `translateY(${scrolled * -0.2}px) rotate(${scrolled * 0.01}deg)`;
            }
        });
    }

    addHoverEffects() {
        // Add magnetic effect to buttons
        const buttons = document.querySelectorAll('.tab-btn, .carousel-btn');
        
        buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });
    }

    addTypingEffect() {
        const heroTitle = document.querySelector('.hero-title .highlight');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.textContent = '';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    heroTitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };
            
            setTimeout(typeWriter, 1000);
        }
    }

    addParticleEffect() {
        // Create floating particles in the hero section
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--primary-red);
                border-radius: 50%;
                opacity: 0.6;
                animation: float ${5 + Math.random() * 5}s infinite ease-in-out;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 5}s;
            `;
            
            hero.appendChild(particle);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const f1Hub = new F1LiveHub();
    const f1Effects = new F1Effects();
    
    // Add some additional CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .particle {
            pointer-events: none;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(120deg); }
            66% { transform: translateY(20px) rotate(240deg); }
        }
        
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: var(--primary-black);
            padding: 2rem;
            border-top: 1px solid var(--border-color);
        }
        
        @media (max-width: 768px) {
            .nav-menu {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}
