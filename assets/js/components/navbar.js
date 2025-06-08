export class NavbarComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentRoute = '/quotes';
        this.user = null;
        this.router = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    setRouter(router) {
        this.router = router;
        this.listenToRouterChanges();
    }

    listenToRouterChanges() {
        if (!this.router) return;

        window.addEventListener('routeChanged', (event) => {
            this.currentRoute = event.detail.route;
            this.updateActiveRoute();
        });

        this.currentRoute = this.router.currentRoute || '/quotes';
        this.updateActiveRoute();
    }

    setupEventListeners() {
        this.shadowRoot.addEventListener('click', (e) => {
            const navLink = e.target.closest('.nav-link');
            if (navLink) {
                e.preventDefault();
                const route = navLink.getAttribute('data-route');
                if (route && this.router) {
                    this.router.navigate(route);
                    // Disparar evento personalizado
                    window.dispatchEvent(new CustomEvent('routeChanged', {
                        detail: { route }
                    }));
                }
            }

            if (e.target.closest('.logout-btn')) {
                this.handleLogout();
            }
            if (e.target.closest('.mobile-toggle')) {
                this.toggleMobileMenu();
            }
            if (e.target.closest('.navbar-brand')) {
                e.preventDefault();
                if (this.router) {
                    this.router.navigate('/quotes');
                    window.dispatchEvent(new CustomEvent('routeChanged', {
                        detail: { route: '/quotes' }
                    }));
                }
            }
        });
    }

    handleLogout() {
        this.user = null;
        this.updateUserInfo();
        
        if (this.router) {
            this.router.navigate('/quotes');
            window.dispatchEvent(new CustomEvent('routeChanged', {
                detail: { route: '/quotes' }
            }));
        }
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }

    toggleMobileMenu() {
        const navbarNav = this.shadowRoot.querySelector('.navbar-nav');
        navbarNav.classList.toggle('active');
    }

    static get observedAttributes() {
        return ['current-route', 'user-name'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'current-route') {
            this.currentRoute = newValue;
            this.updateActiveRoute();
        }
        if (name === 'user-name') {
            this.user = newValue;
            this.updateUserInfo();
        }
    }

    updateActiveRoute() {
        const navLinks = this.shadowRoot.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const route = link.getAttribute('data-route');
            if (route === this.currentRoute) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    updateUserInfo() {
        const userInfo = this.shadowRoot.querySelector('.user-info');
        const userAvatar = this.shadowRoot.querySelector('.user-avatar');
        const userName = this.shadowRoot.querySelector('.user-name');

        if (this.user) {
            userInfo.style.display = 'flex';
            userName.textContent = this.user;
            userAvatar.textContent = this.user.charAt(0).toUpperCase();
        } else {
            userInfo.style.display = 'none';
        }
    }

    updateRoute(route) {
        this.currentRoute = route;
        this.updateActiveRoute();
    }

    updateUser(userName) {
        this.user = userName;
        this.updateUserInfo();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .navbar {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 0;
                    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
                    position: relative;
                    overflow: hidden;
                }
                .navbar::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                }
                .navbar-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                    position: relative;
                    z-index: 1;
                }
                .navbar-brand {
                    display: flex;
                    align-items: center;
                    color: white;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 1.5rem;
                    transition: transform 0.3s ease;
                    cursor: pointer;
                }
                .navbar-brand:hover {
                    transform: scale(1.05);
                }
                .brand-icon {
                    width: 40px;
                    height: 40px;
                    margin-right: 12px;
                    background: linear-gradient(45deg, #ff6b6b, #ffd93d);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }
                .navbar-nav {
                    display: flex;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    gap: 0.5rem;
                }
                .nav-item {
                    position: relative;
                }
                .nav-link {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.95rem;
                    border-radius: 8px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                }
                .nav-link::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.1);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s ease;
                    border-radius: 8px;
                }
                .nav-link:hover::before {
                    transform: scaleX(1);
                }
                .nav-link:hover {
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }
                .nav-link.active {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }
                .nav-link.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 30px;
                    height: 3px;
                    background: #ffd93d;
                    border-radius: 2px;
                }
                .nav-icon {
                    margin-right: 8px;
                    font-size: 1rem;
                    transition: transform 0.3s ease;
                }
                .nav-link:hover .nav-icon {
                    transform: scale(1.2);
                }
                .user-menu {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.9rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                }
                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 8px;
                    font-weight: bold;
                    font-size: 0.8rem;
                    color: white;
                }
                .logout-btn {
                    background: rgba(255, 107, 107, 0.2);
                    border: 1px solid rgba(255, 107, 107, 0.3);
                    color: white;
                    padding: 0.6rem 1.2rem;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                .logout-btn:hover {
                    background: rgba(255, 107, 107, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                }
                .mobile-toggle {
                    display: none;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 4px;
                    transition: background 0.3s ease;
                }
                .mobile-toggle:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                @media (max-width: 768px) {
                    .navbar-container {
                        padding: 0 1rem;
                    }
                    .mobile-toggle {
                        display: block;
                    }
                    .navbar-nav {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        flex-direction: column;
                        padding: 1rem;
                        transform: translateY(-100%);
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    }
                    .navbar-nav.active {
                        transform: translateY(0);
                        opacity: 1;
                        visibility: visible;
                    }
                    .nav-item {
                        width: 100%;
                    }
                    .nav-link {
                        width: 100%;
                        justify-content: flex-start;
                        margin-bottom: 0.5rem;
                    }
                    .user-menu {
                        flex-direction: column;
                        gap: 0.5rem;
                        margin-top: 1rem;
                        padding-top: 1rem;
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                    }
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .navbar {
                    animation: slideIn 0.5s ease-out;
                }
            </style>
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="#/quotes" class="navbar-brand">
                        <div class="brand-icon">🏪</div>
                        <span>Cotishama</span>
                    </a>
                    <button class="mobile-toggle" aria-label="Toggle navigation">
                        <i class="fas fa-bars"></i>
                    </button>
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a href="#/quotes" class="nav-link" data-route="/quotes">
                                <i class="fas fa-file-invoice nav-icon"></i>
                                <span>Cotizaciones</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#/customers" class="nav-link" data-route="/customers">
                                <i class="fas fa-users nav-icon"></i>
                                <span>Clientes</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#/inventory" class="nav-link" data-route="/inventory">
                                <i class="fas fa-boxes nav-icon"></i>
                                <span>Inventario</span>
                            </a>
                        </li>
                    </ul>
                    <div class="user-menu">
                        <div class="user-info" style="display: none;">
                            <div class="user-avatar"></div>
                            <span class="user-name">Usuario</span>
                        </div>
                        <button class="logout-btn">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Salir</span>
                        </button>
                    </div>
                </div>
            </nav>
        `;
    }
}

customElements.define('app-navbar', NavbarComponent);