// 1. Initialize the Map
// Centered on Raleigh, NC with a zoom level of 7
var map = L.map('map').setView([35.7796, -78.6382], 7);

// 2. Add the Map Tiles (The actual background map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Load the Company Data
fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        const listContainer = document.getElementById('company-list');

        data.forEach(item => {
            // A. Create the Marker on the Map
            // Assumes your JSON has "Latitude" and "Longitude" fields
            if (item.Latitude && item.Longitude) {
                var marker = L.marker([item.Latitude, item.Longitude]).addTo(map);
                
                // Add a popup that opens when you click the marker
                marker.bindPopup(`
                    <strong>${item.Company}</strong><br>
                    Goal: ${item.Goal}<br>
                    <small>${item.Sector}</small>
                `);
            }

            // B. Create the Sidebar Card
            const card = document.createElement('div');
            card.className = 'company-card';
            
            // Note: If your logos are in a folder called "images", the path below works.
            // If the images aren't showing, check if your folder is capitalized (Images vs images).
            card.innerHTML = `
                <img src="images/${item.Logo}" class="company-logo" alt="${item.Company}" onerror="this.src='https://via.placeholder.com/50?text=${item.Company.charAt(0)}'">
                <div class="company-info">
                    <h4>${item.Company}</h4>
                    <p>Goal: ${item.Goal}</p>
                    <span class="sector-tag">${item.Sector}</span>
                </div>
            `;

            // C. Add Interactivity: Click card to fly to map location
            card.addEventListener('click', () => {
                if (item.Latitude && item.Longitude) {
                    map.flyTo([item.Latitude, item.Longitude], 12);
                    marker.openPopup();
                }
            });

            listContainer.appendChild(card);
        });
    })
    .catch(error => console.error('Error loading the JSON data:', error));