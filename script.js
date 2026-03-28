// 1. Initialize the Map centered on North Carolina
var map = L.map('map').setView([35.7796, -78.6382], 7);

// 2. Add the Map Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Layer group to manage markers during filtering
var markerLayer = L.layerGroup().addTo(map);

// 3. Load the Company Data
fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        // A. PRE-SORT DATA ALPHABETICALLY
        data.sort((a, b) => (a.Company || "").localeCompare(b.Company || ""));

        const listContainer = document.getElementById('company-list');
        const searchBar = document.getElementById('search-bar');
        const filterContainer = document.getElementById('filter-container');
        const resetBtn = document.getElementById('reset-btn');

        let currentSector = 'ALL';

        // B. GENERATE FILTER BUTTONS DYNAMICALLY
        const uniqueSectors = [...new Set(data.map(item => item.Sector.trim()))];
        const sectors = ['All', ...uniqueSectors];
        
        filterContainer.innerHTML = ''; 
        sectors.forEach(sector => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (sector === 'All' ? ' active' : '');
            btn.innerText = sector;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSector = sector.toUpperCase().trim();
                applyFilters();
            });
            filterContainer.appendChild(btn);
        });

        // C. RENDER FUNCTION (The "Engine")
        function renderDisplay(filteredData) {
            listContainer.innerHTML = '';
            markerLayer.clearLayers();

            if (filteredData.length === 0) {
                listContainer.innerHTML = '<p style="padding: 20px; color: #666;">No companies match these filters.</p>';
                return;
            }

            filteredData.forEach(item => {
                if (item.Latitude && item.Longitude) {
                    // Color Logic: Green for Achieved, Blue for Goal Set
                    const isAchieved = item.Goal && item.Goal.toLowerCase().includes("achieved");
                    const markerColor = isAchieved ? "#2ecc71" : "#3498db";

                    const marker = L.circleMarker([item.Latitude, item.Longitude], {
                        radius: 8,
                        fillColor: markerColor,
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    });

                    marker.bindPopup(`
                        <div style="text-align:center; font-family: sans-serif;">
                            <img src="images/${item.ID}.png" style="width:50px; margin-bottom:5px;" onerror="this.style.display='none'"><br>
                            <strong>${item.Company}</strong><br>
                            Goal: ${item.Goal}
                        </div>
                    `);

                    marker.addTo(markerLayer);

                    // Create Sidebar Card
                    const card = document.createElement('div');
                    card.className = 'company-card';
                    card.innerHTML = `
                        <img src="images/${item.ID}.png" class="company-logo" alt="${item.Company}" onerror="this.src='https://via.placeholder.com/50?text=${item.Company.charAt(0)}'">
                        <div class="company-info">
                            <h4>${item.Company}</h4>
                            <p>Goal: ${item.Goal}</p>
                            <span class="sector-tag">${item.Sector}</span>
                        </div>
                    `;

                    card.addEventListener('click', () => {
                        map.flyTo([item.Latitude, item.Longitude], 12);
                        marker.openPopup();
                    });

                    listContainer.appendChild(card);
                }
            });
        }

        // D. FILTER LOGIC
        function applyFilters() {
            const searchTerm = searchBar.value.toLowerCase().trim();
            
            const filtered = data.filter(c => {
                const companyName = (c.Company || "").toLowerCase();
                const sectorFromData = (c.Sector || "").toUpperCase().trim();
                const selectedSector = currentSector;

                const matchesSearch = companyName.includes(searchTerm);
                const matchesSector = selectedSector === 'ALL' || sectorFromData === selectedSector;
                
                return matchesSearch && matchesSector;
            });
            
            renderDisplay(filtered);
        }

        // E. EVENT LISTENERS
        searchBar.addEventListener('input', applyFilters);

        // F. RESET BUTTON LOGIC
        resetBtn.addEventListener('click', () => {
            searchBar.value = ''; // Clear search
            currentSector = 'ALL'; // Reset sector
            
            // Reset Button Styling
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                if (b.innerText === 'All') b.classList.add('active');
            });

            // Reset Map View
            map.flyTo([35.7796, -78.6382], 7);
            
            applyFilters();
        });

        // Initial Load
        renderDisplay(data);
    })
    .catch(err => console.error("Critical Error loading JSON:", err));