const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('.section');

// Function to change the active section
function showSection(sectionId) {
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

// Add event listeners to menu items
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.id.replace('-menu', '-section');

        if (item.id !== 'theme') {
            showSection(sectionId); // Switch section if not theme

            // Update active menu item styling
            menuItems.forEach(menu => menu.classList.remove('active'));
            item.classList.add('active');
        } else {
            // Open theme modal instead of switching section
            openThemeModal();
        }
    });
});



// Theme
const theme = document.querySelector('#theme');
const themeModal = document.querySelector('.customize-theme');
const fontSize = document.querySelectorAll('.choose-size span');
var root = document.querySelector(':root');
const colorPalette = document.querySelectorAll('.choose-color span');
const Bg1 = document.querySelector('.bg-1');
const Bg2 = document.querySelector('.bg-2');
const Bg3 = document.querySelector('.bg-3');

// ============== SIDEBAR ============== 

// Remove active class from all menu items
const changeActiveItem = () => {
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
}

// Add event listener to menu items
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // Check if the clicked menu item is not the theme
        if (item.id !== 'theme') {
            // Remove active class from all menu items
            changeActiveItem();

            // Add active class to the clicked item
            item.classList.add('active');

            // Save the active item's ID to sessionStorage
            sessionStorage.setItem('activeMenu', item.id);
        }
    });
});

// Retrieve the active state from sessionStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    const activeMenu = sessionStorage.getItem('activeMenu');

    if (activeMenu) {
        changeActiveItem(); // Clear all active states
        const activeItem = document.getElementById(activeMenu);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    // Retrieve and apply font size from localStorage
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.querySelector('html').style.fontSize = savedFontSize;
        fontSize.forEach(size => size.classList.remove('active'));
        document.querySelector(`.choose-size span[data-size="${savedFontSize}"]`)?.classList.add('active');
    }

    // Retrieve and apply theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        const [light, white, dark] = JSON.parse(savedTheme);
        root.style.setProperty('--light-color-lightness', light);
        root.style.setProperty('--white-color-lightness', white);
        root.style.setProperty('--dark-color-lightness', dark);

        Bg1.classList.remove('active');
        Bg2.classList.remove('active');
        Bg3.classList.remove('active');
        if (light === '95%' && white === '20%' && dark === '15%') Bg2.classList.add('active');
        else if (light === '95%' && white === '10%' && dark === '0%') Bg3.classList.add('active');
        else Bg1.classList.add('active');
    }
});

// ============== THEME / DISPLAY CUSTOMIZATION ============== 

// Opens Modal
const openThemeModal = () => {
    themeModal.style.display = 'grid';
}

// Closes Modal
const closeThemeModal = (e) => {
    if (e.target.classList.contains('customize-theme')) {
        themeModal.style.display = 'none';
    }
}

themeModal.addEventListener('click', closeThemeModal);
theme.addEventListener('click', openThemeModal);

// ============== FONT SIZE ============== 

// Remove active class from spans or font size selectors
const removeSizeSelectors = () => {
    fontSize.forEach(size => {
        size.classList.remove('active');
    });
}

fontSize.forEach(size => {
    size.addEventListener('click', () => {
        removeSizeSelectors();
        let fontSize;

        if (size.classList.contains('font-size-1')) fontSize = '10px';
        else if (size.classList.contains('font-size-2')) fontSize = '13px';
        else if (size.classList.contains('font-size-3')) fontSize = '16px';
        else if (size.classList.contains('font-size-4')) fontSize = '19px';
        else if (size.classList.contains('font-size-5')) fontSize = '22px';

        document.querySelector('html').style.fontSize = fontSize;
        localStorage.setItem('fontSize', fontSize); // Save to localStorage
    });
});

// Theme Background Values
let lightColorLightness;
let whiteColorLightness;
let darkColorLightness;

// Changes background color
const changeBG = () => {
    root.style.setProperty('--light-color-lightness', lightColorLightness);
    root.style.setProperty('--white-color-lightness', whiteColorLightness);
    root.style.setProperty('--dark-color-lightness', darkColorLightness);
};

// Save theme to localStorage
const saveTheme = () => {
    const theme = [
        root.style.getPropertyValue('--light-color-lightness'),
        root.style.getPropertyValue('--white-color-lightness'),
        root.style.getPropertyValue('--dark-color-lightness')
    ];
    localStorage.setItem('theme', JSON.stringify(theme)); // Save to localStorage
};

Bg1.addEventListener('click', () => {
    Bg1.classList.add('active');
    Bg2.classList.remove('active');
    Bg3.classList.remove('active');
    root.style.setProperty('--light-color-lightness', '100%');
    root.style.setProperty('--white-color-lightness', '100%');
    root.style.setProperty('--dark-color-lightness', '0%');
    saveTheme();
});

Bg2.addEventListener('click', () => {
    darkColorLightness = '95%';
    whiteColorLightness = '20%';
    lightColorLightness = '15%';
    Bg2.classList.add('active');
    Bg1.classList.remove('active');
    Bg3.classList.remove('active');
    changeBG();
    saveTheme();
});

Bg3.addEventListener('click', () => {
    darkColorLightness = '95%';
    whiteColorLightness = '10%';
    lightColorLightness = '0%';
    Bg3.classList.add('active');
    Bg1.classList.remove('active');
    Bg2.classList.remove('active');
    changeBG();
    saveTheme();
});

// ========================== HOME PAGE: NEWS FETCHING ==========================
const newsContainerHome = document.getElementById('news-home');
let displayedArticlesHome = new Set(); // To track displayed articles' URLs
let page = 1;  // Page counter for home page

async function fetchNewsForHome() {
    if (page === 1) {
        newsContainerHome.innerHTML = '<p>Loading news...</p>';
    }

    try {
        const response = await fetch(`http://localhost:3000/news?page=${page}`);
        if (!response.ok) {
            throw new Error('Failed to fetch news');
        }

        const articles = await response.json();

        if (page === 1) {
            newsContainerHome.innerHTML = '';
        }

        const newArticles = articles
            .filter(article => article.title && article.description && article.urlToImage && !displayedArticlesHome.has(article.url))
            .map(article => {
                displayedArticlesHome.add(article.url);

                const publishedDate = new Date(article.publishedAt);
                const formattedDate = `${publishedDate.toLocaleDateString()} ${publishedDate.toLocaleTimeString()}`;

                return `
                        <article class="news-card">
                            <img src="${article.urlToImage}" alt="News Image" class="news-image" />
                            <div class="news-content">
                                <h2>${article.title}</h2>
                                <p class="news-description">${article.description}</p>
                                <p class="news-date"><strong>Published:</strong> ${formattedDate}</p>
                                <a href="${article.url}" target="_blank" class="news-link">Read more</a>
                            </div>
                        </article>
                    `;
            });

        if (newArticles.length > 0) {
            newsContainerHome.innerHTML += newArticles.join('');
        } else {
            newsContainerHome.innerHTML += '<p>No new articles available.</p>';
        }
    } catch (error) {
        console.error(error);
        newsContainerHome.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    }
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight) {
        page++;
        fetchNewsForHome();
    }
}

window.addEventListener('scroll', handleScroll);

fetchNewsForHome();

// ========================== EXPLORE PAGE ==========================
const newsContainerExplore = document.getElementById('news-explore');
const categoriesDropdown = document.getElementById('categories');
let pageExplore = 1;

// Function to fetch news based on category and pagination
async function fetchNewsForExplore(category = '') {
    if (pageExplore === 1) {
        newsContainerExplore.innerHTML = '<p>Loading news...</p>';
    }

    try {
        const response = await fetch(`http://localhost:3000/news?category=${category}&page=${pageExplore}`);
        if (!response.ok) {
            throw new Error('Failed to fetch news');
        }

        const articles = await response.json();

        if (pageExplore === 1) {
            newsContainerExplore.innerHTML = '';
        }

        newsContainerExplore.innerHTML += articles
            .filter(article => article.title && article.description && article.urlToImage)
            .map(article => {
                const publishedDate = new Date(article.publishedAt);
                const formattedDate = `${publishedDate.toLocaleDateString()} ${publishedDate.toLocaleTimeString()}`;

                return `
                    <article class="news-card">
                        <img src="${article.urlToImage}" alt="News Image" class="news-image" />
                        <div class="news-content">
                            <h2>${article.title}</h2>
                            <p class="news-description">${article.description}</p>
                            <p class="news-date"><strong>Published:</strong> ${formattedDate}</p>
                            <a href="${article.url}" target="_blank" class="news-link">Read more</a>
                        </div>
                    </article>
                `;
            })
            .join('');
    } catch (error) {
        console.error(error);
        newsContainerExplore.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    }
}

function handleScrollExplore() {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight) {
        pageExplore++;
        const selectedCategory = categoriesDropdown.value;
        fetchNewsForExplore(selectedCategory);
    }
}

categoriesDropdown.addEventListener('change', () => {
    pageExplore = 1;
    fetchNewsForExplore(categoriesDropdown.value);
});

window.addEventListener('scroll', handleScrollExplore);

fetchNewsForExplore();
