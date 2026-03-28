var map = L.map('map').setView([35.7796, -78.6382], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var markerLayer = L.layerGroup().addTo(map);

fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        // Sort A-Z
        data.sort((a, b) => (a.Company || "").localeCompare(b.Company || ""));

        const listContainer = document.getElementById('company-list');
        const searchBar = document.getElementById('search-bar');
        const filterContainer = document.getElementById('filter-container');

        // FAIL-SAFE: Check if HTML elements exist
        if (!listContainer) { 
            console.error("ERORR: Could not find 'company-list' in your HTML!");
            return; 
        }

        let currentSector = 'ALL';

        // A. CREATE BUTTONS
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

        // B. THE RENDERER
        function renderDisplay(filteredData) {
            listContainer.innerHTML = '';
            markerLayer.clearLayers();

            filteredData.forEach(item => {
                if (item.Latitude && item.Longitude) {
                    // Marker Logic
                    const markerColor = (item.Goal && item.Goal.toLowerCase() === "achieved") ? "#2ecc71" : "#3498db";
                    const marker = L.circleMarker([item.Latitude, item.Longitude], {
                        radius: 8, fillColor: markerColor, color: "#fff", weight: 2, fillOpacity: 0.8
                    });
                    marker.bindPopup(`<strong>${item.Company}</strong><br>Goal: ${item.Goal}`);
                    marker.addTo(markerLayer);

                    // Card Logic - using a fallback for the ID
                    const companyId = item.ID || item.id || "placeholder";
                    const card = document.createElement('div');
                    card.className = 'company-card';
                    card.innerHTML = `
                        <img src="images/${companyId}.png" class="company-logo" onerror="this.src='https://via.placeholder.com/50?text=${item.Company.charAt(0)}'">
                        <div class="company-info">
                            <h4>${item.Company}</h4>
                            <p>Goal: ${item.Goal}</p>
                            <span class="sector-tag">${item.Sector}</span>
                        </div>`;
                    
                    card.onclick = () => {
                        map.flyTo([item.Latitude, item.Longitude], 12);
                        marker.openPopup();
                    };
                    listContainer.appendChild(card);
                }
            });
        }

        function applyFilters() {
            const searchTerm = searchBar.value.toLowerCase().trim();
            const filtered = data.filter(c => {
                const companyMatch = c.Company.toLowerCase().includes(searchTerm);
                const sectorFromData = c.Sector.toUpperCase().trim();
                const sectorMatch = (currentSector === 'ALL' || sectorFromData === currentSector);
                return companyMatch && sectorMatch;
            });
            renderDisplay(filtered);
        }

        searchBar.oninput = applyFilters;
        renderDisplay(data); // Run once on load
    })
    .catch(err => console.error("Data Load Error:", err));