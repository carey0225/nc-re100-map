// 1. Initialize the Map centered on North Carolina
const map = L.map('map').setView([35.7596, -79.0193], 7);

// 2. Add a clean Light-themed Basemap (CartoDB Positron)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const companyList = document.getElementById('company-list');

// 3. Load the data from your companies.json
fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            // Add Marker to Map using Latitude and Longitude
            const marker = L.circleMarker([item.Latitude, item.Longitude], {
                radius: 10,
                fillColor: item.Status === "Achieved" ? "#2ecc71" : "#3498db", // Green if achieved, Blue if in progress
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(map);

            // Popup content using your specific keys
            const popupContent = `
                <div class="map-popup">
                    <strong>${item.Company}</strong><br>
                    <small>${item.Sector}</small><br>
                    <hr>
                    ${item["Primary Strategy / Plan"]}
                </div>
            `;
            marker.bindPopup(popupContent);

            // 4. Create Sidebar Card
            const card = document.createElement('div');
            card.className = 'company-card';
            
            // Note: If you have a folder of logos named by ID (e.g., 1.png), 
            // you can change the src to `logos/${item.ID}.png`
            card.innerHTML = `
                <div class="card-logo-placeholder">${item.Company.charAt(0)}</div>
                <div class="card-info">
                    <h3>${item.Company}</h3>
                    <p><strong>Goal:</strong> ${item["Goal Year"]}</p>
                    <p class="sector-tag">${item.Sector}</p>
                </div>
            `;

            // Click event to "Fly" to the location and open popup
            card.addEventListener('click', () => {
                map.flyTo([item.Latitude, item.Longitude], 11, {
                    duration: 1.5
                });
                // Delay opening popup slightly for the animation to finish
                setTimeout(() => marker.openPopup(), 1200);
            });

            companyList.appendChild(card);
        });
    })
    .catch(err => console.error("Error loading JSON:", err));