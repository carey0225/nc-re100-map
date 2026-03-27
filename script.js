var map = L.map('map').setView([35.7796, -78.6382], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var markerLayer = L.layerGroup().addTo(map);

fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        console.log("Data Loaded:", data.length, "companies found.");

        // 1. Sort Alphabetically
        data.sort((a, b) => a.Company.localeCompare(b.Company));

        const listContainer = document.getElementById('company-list');
        const searchBar = document.getElementById('search-bar');
        const filterContainer = document.getElementById('filter-container');

        let currentSector = 'All';

        // 2. Generate Filter Buttons
        const uniqueSectors = [...new Set(data.map(item => item.Sector.trim()))];
        const sectors = ['All', ...uniqueSectors];
        
        sectors.forEach(sector => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (sector === 'All' ? ' active' : '');
            btn.innerText = sector;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSector = sector;
                console.log("Sector Filter Changed to:", currentSector);
                applyFilters();
            });
            filterContainer.appendChild(btn);
        });

        // 3. Render Function
        function renderDisplay(filteredData) {
            listContainer.innerHTML = '';
            markerLayer.clearLayers();

            if (filteredData.length === 0) {
                listContainer.innerHTML = '<p style="padding: 20px; color: #666;">No companies match your search or filter.</p>';
                return;
            }

            filteredData.forEach(item => {
                if (item.Latitude && item.Longitude) {
                    const markerColor = item.Goal === "Achieved" ? "#2ecc71" : "#3498db";
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

        // 4. Combined Filter Logic
        function applyFilters() {
            const searchTerm = searchBar.value.toLowerCase().trim();
            
            const filtered = data.filter(c => {
                const matchesSearch = c.Company.toLowerCase().includes(searchTerm);
                // We use .trim() to prevent "Technology " (with a space) from failing to match "Technology"
                const matchesSector = currentSector === 'All' || c.Sector.trim() === currentSector;
                return matchesSearch && matchesSector;
            });
            
            console.log(`Filtering: Search="${searchTerm}", Sector="${currentSector}" -> Found: ${filtered.length}`);
            renderDisplay(filtered);
        }

        searchBar.addEventListener('input', applyFilters);
        
        // Initial render
        renderDisplay(data);
    })
    .catch(err => {
        console.error("Critical Error loading JSON:", err);
    });