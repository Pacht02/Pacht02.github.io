let locations = [];
let userLocation = null;

// Solicita la ubicación del usuario
navigator.geolocation.getCurrentPosition(
    (position) => {
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        };
        alert(`Tu ubicación actual es: ${userLocation.lat}, ${userLocation.lng}`);
    },
    (error) => {
        alert("No se pudo obtener tu ubicación. Por favor, habilítala en tu dispositivo.");
    }
);

// Maneja el formulario para agregar ubicaciones
document.getElementById("location-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const coordinates = document.getElementById("coordinates").value;
    const phone = document.getElementById("phone").value;

    const [lat, lng] = coordinates.split(",").map((item) => parseFloat(item.trim()));

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        alert("Por favor, ingresa coordenadas válidas en formato 'lat, lng'.");
        return;
    }

    locations.push({ phone, lat, lng });
    document.getElementById("coordinates").value = "";
    document.getElementById("phone").value = "";
    renderList(locations);
});

// Calcula distancias y ordena las ubicaciones
document.getElementById("calculate-route").addEventListener("click", async () => {
    if (!userLocation) {
        alert("No se puede calcular la distancia sin tu ubicación actual.");
        return;
    }

    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destinations = locations.map((loc) => `${loc.lat},${loc.lng}`).join("|");

    const apiKey = "AIzaSyDIGXKfC3l8btI1dafKYXEITkTRqAA0xyU";
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
            data.rows[0].elements.forEach((element, index) => {
                locations[index].distance = element.distance.value / 1000; // Convertir a kilómetros
            });

            locations.sort((a, b) => a.distance - b.distance);
            renderList(locations);
        } else {
            console.error("Error al calcular distancias:", data);
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
    }
});

// Renderiza la lista de ubicaciones
function renderList(locations) {
    const listContainer = document.getElementById("location-list");
    listContainer.innerHTML = "";

    locations.forEach((loc, index) => {
        const item = document.createElement("div");
        item.className = "p-4 border rounded bg-gray-50";

        item.innerHTML = `
            <p><strong>#${index + 1}</strong></p>
            <p><strong>Número:</strong> <a href="tel:${loc.phone}" class="text-blue-500">${loc.phone}</a></p>
            <p><strong>Coordenadas:</strong> ${loc.lat}, ${loc.lng}</p>
            <p><strong>Distancia:</strong> ${loc.distance ? loc.distance.toFixed(2) + " km" : "N/A"}</p>
            <button 
                class="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                onclick="openInMaps(${loc.lat}, ${loc.lng})">
                Abrir en Google Maps
            </button>
        `;
        listContainer.appendChild(item);
    });
}

// Abre Google Maps con la ubicación
function openInMaps(lat, lng) {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
}