var map = L.map('map').setView([35.7796, -78.6382], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var markerLayer = L.layerGroup().addTo(map);

fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        // Sort everything A-Z right at the start
        data.sort((a, b) => (a.Company || "").localeCompare(b.Company || ""));

        const listContainer = document.getElementById('company-list');
        const searchBar = document.getElementById('search-bar');
        const filterContainer = document.getElementById('filter-container');

        let currentSector = 'ALL';

        // A. CREATE BUTTONS
        const uniqueSectors = [...new Set(data.map(item => item.Sector.trim()))];
        const sectors = ['All', ...uniqueSectors];
        
        filterContainer.innerHTML = ''; // Clear old buttons
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

        // B. THE RENDERER
        function renderDisplay(filteredData) {
            listContainer.innerHTML = '';
            markerLayer.clearLayers();

            if (filteredData.length === 0) {
                listContainer.innerHTML = `<p style="padding:20px;">No results for "${currentSector}"</p>`;
                return;
            }

            filteredData.forEach(item => {
                if (item.Latitude && item.Longitude) {
                    const markerColor = item.Goal === "Achieved" ? "#2ecc71" : "#3498db";
                    const marker = L.circleMarker([item.Latitude, item.Longitude], {
                        radius: 8, fillColor: markerColor, color: "#fff", weight: 2, fillOpacity: 0.8
                    });

                    marker.bindPopup(`<strong>${item.Company}</strong><br>Goal: ${item.Goal}`);
                    marker.addTo(markerLayer);

                    const card = document.createElement('div');
                    card.className = 'company-card';
                    card.innerHTML = `
                        <img src="images/${item.ID}.png" class="company-logo" onerror="this.src='https://via.placeholder.com/50?text=${item.Company.charAt(0)}'">
                        <div class="company-info">
                            <h4>${item.Company}</h4>
                            <p>Goal: ${item.Goal}</p>
                            <span class="sector-tag">${item.Sector}</span>
                        </div>`;
                    
                    card.addEventListener('click', () => {
                        map.flyTo([item.Latitude, item.Longitude], 12);
                        marker.openPopup();
                    });
                    listContainer.appendChild(card);
                }
            });
        }

        // C. THE FILTER (Case Insensitive & Space Insensitive)
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

        searchBar.addEventListener('input', applyFilters);
        renderDisplay(data); // Initial view
    });