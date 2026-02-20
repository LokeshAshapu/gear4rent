import { getLaptops } from './db.js';
import { monitorAuthState, logoutUser } from './auth.js';

// DOM Elements
const laptopGrid = document.getElementById('laptop-grid');
const authButtons = document.getElementById('auth-buttons');
const navContainer = document.querySelector('nav .max-w-7xl .flex'); // Select container to append profile info on mobile if needed

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth State
    monitorAuthState((user, role) => {
        if (user) {
            updateNavForLoggedInUser(user, role);
        } else {
            updateNavForGuest();
        }
    });

    // 2. Render Laptops if on home page
    if (laptopGrid) {
        await renderFeaturedLaptops();
    }
});

function updateNavForLoggedInUser(user, role) {
    if (!authButtons) return;

    // Create Dashboard Link based on Role
    let dashboardLink = '#';
    if (role === 'admin') dashboardLink = 'dashboard-admin.html';
    else if (role === 'vendor') dashboardLink = 'dashboard-vendor.html';
    else dashboardLink = 'dashboard-student.html';

    authButtons.innerHTML = `
        <div class="relative group">
            <button class="flex items-center gap-2 text-gray-700 hover:text-primary font-medium focus:outline-none">
                <img src="https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random" class="w-8 h-8 rounded-full">
                <span class="hidden md:inline">${user.displayName || 'User'}</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
            </button>
            <!-- Dropdown -->
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 hidden group-hover:block px-2">
                <div class="px-4 py-2 border-b border-gray-100 mb-1">
                    <p class="text-xs text-gray-500">Signed in as</p>
                    <p class="text-sm font-bold text-gray-800 truncate">${user.email}</p>
                </div>
                <a href="${dashboardLink}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Dashboard</a>
                <a href="#" id="logout-btn" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Sign out</a>
            </div>
        </div>
    `;

    // Attach Logout Listener
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
    });
}

function updateNavForGuest() {
    if (!authButtons) return;
    authButtons.innerHTML = `
        <a href="login.html" class="text-gray-600 hover:text-primary font-medium transition">Log in</a>
        <a href="signup.html" class="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition shadow-lg shadow-blue-500/30">Sign up</a>
    `;
}

// Render Laptops to Grid
async function renderFeaturedLaptops() {
    // Show Loading
    laptopGrid.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-500">
             <i class="fa-solid fa-circle-notch fa-spin text-3xl mb-4 text-primary"></i>
             <p>Finding the best gear for you...</p>
        </div>
    `;

    // Fetch Data
    const laptops = await getLaptops();

    // Clear Grid
    laptopGrid.innerHTML = '';

    if (laptops.length === 0) {
        laptopGrid.innerHTML = '<p class="text-center col-span-full text-gray-500">No laptops available at the moment.</p>';
        return;
    }

    // Populate Grid
    laptops.forEach(laptop => {
        const card = createLaptopCard(laptop);
        laptopGrid.appendChild(card);
    });
}

function createLaptopCard(laptop) {
    const div = document.createElement('div');
    div.className = "bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full";

    const availabilityBadge = laptop.available
        ? `<span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md"><i class="fa-solid fa-check mr-1"></i> Available</span>`
        : `<span class="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md"><i class="fa-solid fa-times mr-1"></i> Rented</span>`;

    div.innerHTML = `
        <div class="relative h-48 overflow-hidden bg-gray-100">
            <img src="${laptop.image}" alt="${laptop.model}" class="w-full h-full object-cover transform group-hover:scale-105 transition duration-500">
            <div class="absolute top-3 right-3 z-10">
                ${availabilityBadge}
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                 <p class="text-white text-xs font-semibold uppercase tracking-wider opacity-90">${laptop.brand}</p>
            </div>
        </div>
        
        <div class="p-5 flex-grow flex flex-col">
            <h3 class="text-lg font-bold text-gray-900 mb-1 leading-tight">${laptop.model}</h3>
            <p class="text-sm text-gray-500 mb-4">${laptop.category}</p>
            
            <div class="space-y-2 mb-6 flex-grow">
                <div class="flex items-center text-sm text-gray-600 gap-3">
                    <i class="fa-solid fa-microchip w-4 text-primary text-center"></i>
                    <span>${laptop.specs.processor}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600 gap-3">
                    <i class="fa-solid fa-memory w-4 text-primary text-center"></i>
                    <span>${laptop.specs.ram}</span>
                </div>
                 <div class="flex items-center text-sm text-gray-600 gap-3">
                    <i class="fa-solid fa-hdd w-4 text-primary text-center"></i>
                    <span>${laptop.specs.storage}</span>
                </div>
            </div>
            
            <div class="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex flex-col">
                     <span class="text-2xl font-bold text-primary">₹${laptop.price_per_day}</span>
                     <span class="text-xs text-gray-400">/day</span>
                </div>
                <!-- Pass ID in URL -->
                <button onclick="window.location.href='laptop-details.html?id=${laptop.id}'" class="bg-secondary hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg transform active:scale-95">
                    View & Rent
                </button>
            </div>
        </div>
    `;
    return div;
}

// Export for global access if needed
window.renderFeaturedLaptops = renderFeaturedLaptops;
