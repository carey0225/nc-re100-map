// 1. Initialize Map with NCSEA-appropriate zoom and center
var map = L.map('map').setView([35.7796, -78.6382], 7);

// 2. Add Map Tiles (Light Gray Canvas works best for professional branding)
L.tileLayer('https://{s}.tile.openstreetmap.org/light_all/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var markerLayer = L.layerGroup().addTo(map);

// 3. Load and Process Data
fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        // Sort Alphabetically by Company Name
        data.sort((a, b) => (a.Company || "").localeCompare(b.Company || ""));

        const listContainer = document.getElementById('company-list');
        const searchBar = document.getElementById('search-bar');
        const filterContainer = document.getElementById('filter-container');
        const resetBtn = document.getElementById('reset-btn');

        let currentSector = 'ALL';

        // A. GENERATE NCSEA BRANDED FILTER BUTTONS
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

        // B. RENDER FUNCTION (Professional Dashboard UI)
        function renderDisplay(filteredData) {
            listContainer.innerHTML = '';
            markerLayer.clearLayers();

            if (filteredData.length === 0) {
                listContainer.innerHTML = '<p style="padding: 20px; text-align: center;">No partners found matching those criteria.</p>';
                return;
            }

            filteredData.forEach(item => {
                if (item.Latitude && item.Longitude) {
                    // NCSEA BRANDED COLORS
                    // Green = Achieved, Blue = In Progress
                    const isAchieved = (item.Goal || "").toLowerCase().includes("achieved");
                    const markerColor = isAchieved ? "#98bf3c" : "#007dc3"; 

                    const marker = L.circleMarker([item.Latitude, item.Longitude], {
                        radius: 9,
                        fillColor: markerColor,
                        color: "#ffffff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.9
                    });

                    // Professional Popup using Strategy Data
                    marker.bindPopup(`
                        <div style="font-family: 'Inter', sans-serif; min-width: 150px;">
                            <h3 style="margin: 0 0 5px 0; color: #254c91; font-size: 14px;">${item.Company}</h3>
                            <div style="font-size: 12px; color: #636566;">
                                <b>Goal:</b> ${item.Goal}<br>
                                <b>Plan:</b> ${item['Primary Strategy / Plan'] || 'Sustainability Strategy'}
                            </div>
                        </div>
                    `);

                    marker.addTo(markerLayer);

                    // Create Sidebar Card with Strategy Badge
                    const companyId = item.ID || item.id;
                    const card = document.createElement('div');
                    card.className = 'company-card';
                    card.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="images/${companyId}.png" class="company-logo" alt="${item.Company}" 
                                 onerror="this.src='https://via.placeholder.com/50?text=${item.Company.charAt(0)}'">
                            <div class="company-info">
                                <h4>${item.Company}</h4>
                                <p><strong>Goal:</strong> ${item.Goal}</p>
                                <div class="strategy-tag">${item['Primary Strategy / Plan'] || 'Clean Energy Plan'}</div>
                            </div>
                        </div>
                    `;

                    card.onclick = () => {
                        map.flyTo([item.Latitude, item.Longitude], 13, { animate: true, duration: 1.5 });
                        marker.openPopup();
                    };

                    listContainer.appendChild(card);
                }
            });
        }

        // C. FILTER LOGIC (Combined Search + Sector)
        function applyFilters() {
            const searchTerm = searchBar.value.toLowerCase().trim();
            
            const filtered = data.filter(c => {
                const companyName = (c.Company || "").toLowerCase();
                const sectorFromData = (c.Sector || "").toUpperCase().trim();
                
                const matchesSearch = companyName.includes(searchTerm);
                const matchesSector = (currentSector === 'ALL' || sectorFromData === currentSector);
                
                return matchesSearch && matchesSector;
            });
            
            renderDisplay(filtered);
        }

        // D. INTERACTION LISTENERS
        searchBar.oninput = applyFilters;

        resetBtn.onclick = () => {
            searchBar.value = '';
            currentSector = 'ALL';
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                if (b.innerText === 'All') b.classList.add('active');
            });
            map.flyTo([35.7796, -78.6382], 7);
            applyFilters();
        };

        // Initial render
        renderDisplay(data);
    })
    .catch(err => console.error("Error initializing NCSEA Map:", err));