// 1. Initialize Map
var map = L.map('map').setView([35.7796, -78.6382], 7);

// 2. Add Standard OpenStreetMap Tiles (Most Reliable)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fix for map display issues in flex containers
setTimeout(() => { map.invalidateSize(); }, 500);

var markerLayer = L.layerGroup().addTo(map);

// 3. Load Data
fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        data.sort((a, b) => (a.Company || "").localeCompare(b.Company || ""));

        const listContainer = document.getElementById('company-list');
        const searchBar = document.getElementById('search-bar');
        const filterContainer = document.getElementById('filter-container');
        const resetBtn = document.getElementById('reset-btn');

        let currentSector = 'ALL';

        // Sector Buttons
        const uniqueSectors = [...new Set(data.map(item => item.Sector.trim()))];
        const sectors = ['All', ...uniqueSectors];
        
        filterContainer.innerHTML = ''; 
        sectors.forEach(sector => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (sector === 'All' ? ' active' : '');
            btn.innerText = sector;
            btn.onclick = () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSector = sector.toUpperCase().trim();
                applyFilters();
            };
            filterContainer.appendChild(btn);
        });

        function renderDisplay(filteredData) {
            listContainer.innerHTML = '';
            markerLayer.clearLayers();

            filteredData.forEach(item => {
                if (item.Latitude && item.Longitude) {
                    const isAchieved = (item.Goal || "").toLowerCase().includes("achieved");
                    const markerColor = isAchieved ? "#98bf3c" : "#007dc3"; 

                    const marker = L.circleMarker([item.Latitude, item.Longitude], {
                        radius: 8,
                        fillColor: markerColor,
                        color: "#fff",
                        weight: 2,
                        fillOpacity: 0.9
                    }).addTo(markerLayer);

                    marker.bindPopup(`<b>${item.Company}</b><br>${item.Goal}`);

                    const card = document.createElement('div');
                    card.className = 'company-card';
                    card.innerHTML = `
                        <img src="images/${item.ID}.png" class="company-logo" 
                             onerror="this.src='https://via.placeholder.com/60?text=NCSEA'">
                        <div class="company-info">
                            <h4 style="margin:0; font-size: 0.9rem;">${item.Company}</h4>
                            <div class="strategy-tag">${item['Primary Strategy / Plan'] || 'Sustainability'}</div>
                        </div>
                    `;

                    card.onclick = () => {
                        map.flyTo([item.Latitude, item.Longitude], 14);
                        marker.openPopup();
                    };
                    listContainer.appendChild(card);
                }
            });
        }

        function applyFilters() {
            const term = searchBar.value.toLowerCase();
            const filtered = data.filter(c => {
                const matchesSearch = c.Company.toLowerCase().includes(term);
                const matchesSector = currentSector === 'ALL' || c.Sector.toUpperCase() === currentSector;
                return matchesSearch && matchesSector;
            });
            renderDisplay(filtered);
        }

        searchBar.oninput = applyFilters;
        
        if(resetBtn) {
            resetBtn.onclick = () => {
                searchBar.value = '';
                currentSector = 'ALL';
                map.flyTo([35.7796, -78.6382], 7);
                applyFilters();
            };
        }

        renderDisplay(data);
    });