import mapboxgl from 'mapbox-gl';

console.log('Hello from the client side!');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1Ijoib3Vzc2FtYS0xODQiLCJhIjoiY20wczE3dWo3MGZybjJpczQxY2w5eHV6MSJ9.wXbcvQKN0vg5V9XFoJMVjg'; // Remplacez par votre clé API Mapbox
const map = new mapboxgl.Map({
  container: 'map', // ID de votre conteneur HTML
  style: 'mapbox://styles/mapbox/streets-v11', // URL de style Mapbox
  center: [longitude, latitude], // Coordonnées de centrage [longitude, latitude]
  zoom: 9 // Niveau de zoom initial
});
