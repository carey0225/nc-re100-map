var map = L.map('map').setView([35.7796, -78.6382], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var markerLayer = L.layerGroup().addTo(map);

fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        data.sort((a, b) => a.Company.localeCompare(b.Company));

        const listContainer = document.getElementById('company-list');
        const searchBar = document.getElementById('search-bar');
        const filterContainer = document.getElementById('filter-container');

        let currentSector = 'All';

        // A. GENERATE FILTER BUTTONS DYNAMICALLY
        const sectors = ['All', ...new Set(data.map(item => item.Sector))];
        
        sectors.forEach(sector => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (sector === 'All' ? ' active' : '');
            btn.innerText = sector;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSector = sector;
                applyFilters();
            });
            filterContainer.appendChild(btn);
        });

        // B. RENDER FUNCTION
        function renderDisplay(filteredData) {
            listContainer.innerHTML = '';
            markerLayer.clearLayers();

            filteredData.forEach(item => {
                const markerColor = item.Goal === "Achieved" ? "#2ecc71" : "#3498db";

                if (item.Latitude && item.Longitude) {
                    const marker = L.circleMarker([item.Latitude, item.Longitude], {
                        radius: 8,
                        fillColor: markerColor,
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    });

                    marker.bindPopup(`
                        <div style="text-align:center;">
                            <img src="images/${item.ID}.png" style="width:50px; margin-bottom:5px;" onerror="this.style.display='none'"><br>
                            <strong>${item.Company}</strong><br>
                            Goal: ${item.Goal}
                        </div>
                    `);

                    marker.addTo(markerLayer);

                    const card = document.createElement('div');
                    card.className = 'company-card';
                    card.innerHTML = `
                        <img src="images/${item.ID}.png" class="company-logo" onerror="this.src='https://via.placeholder.com/50?text=${item.Company.charAt(0)}'">
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

        // C. COMBINED FILTER LOGIC (Search + Sector)
        function applyFilters() {
            const searchTerm = searchBar.value.toLowerCase();
            const filtered = data.filter(c => {
                const matchesSearch = c.Company.toLowerCase().includes(searchTerm);
                const matchesSector = currentSector === 'All' || c.Sector === currentSector;
                return matchesSearch && matchesSector;
            });
            renderDisplay(filtered);
        }

        searchBar.addEventListener('input', applyFilters);
        renderDisplay(data); // Initial load
    });