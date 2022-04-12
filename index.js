import './style.css';

// Coordinates for the tower of Pisa
var centerLat = 44.0131;
var centerLong = 10.3351;
var baseURL =
  'https://eu-central-1.aws.webhooks.mongodb-realm.com/api/client/v2.0/app/dhss21-mczua/service/svc/incoming_webhook';

// Display the map
var aMap = L.map('mapid', {
  center: L.latLng(centerLat, centerLong),
  zoom: 15,
  layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')]
});
// An array of markers
var markers = L.layerGroup();
markers.addTo(aMap);
// Add controls for the layer
L.control
  .layers(
    {}, // base layers, radio buttons
    { Markers: markers } // overlay layers, checkbox buttons
  )
  .addTo(aMap);

aMap.on('click', e => {
  let n = markers.getLayers().length + 1;
  let displayCoord = document.getElementById('displayCoord');
  let aMarker = L.marker(e.latlng, { title: n }).addTo(aMap);
  markers.addLayer(aMarker);
  displayCoord.innerHTML +=
    n +
    ': ' +
    aMarker.getLatLng().lat.toFixed(5) +
    ', ' +
    aMarker.getLatLng().lng.toFixed(5) +
    '<br>';
});

newButton.onclick = e => {
  fetch(baseURL + '/getKey', { method: 'POST' })
    .then(response => response.text())
    .then(body => {
      let key = JSON.parse(body);
      fetch(baseURL + '/setValue' + '?key=' + key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markers.toGeoJSON())
      }).then(
        () => {
          console.log('Success');
          document.getElementById('keyBox').value = key;
          document.getElementById('newButton').style.display = 'none';
        },
        err => console.log(err)
      );
    });
};

saveButton.onclick = e => {
  let key = document.getElementById('keyBox').value;
  fetch(baseURL + '/setValue' + '?key=' + key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(markers.toGeoJSON())
  }).then(() => alert('Save successful'), err => alert('Save failed: ' + err));
};

loadButton.onclick = e => {
  let key = document.getElementById('keyBox').value;
  let displayCoord = document.getElementById('displayCoord');
  displayCoord.innerHTML = '';
  markers.clearLayers();
  fetch(baseURL + '/getValue' + '?key=' + key)
    .then(response => response.json())
    .then(payload => {
      let layer = payload;
      for (let i in layer.features) {
        try {
          let coord = L.latLng([
            layer.features[i].geometry.coordinates[1].$numberDouble,
            layer.features[i].geometry.coordinates[0].$numberDouble
          ]);
          let aMarker = L.marker(coord, { title: Number(i) + 1 });
          markers.addLayer(aMarker);
          displayCoord.innerHTML +=
            Number(i) +
            1 +
            ': ' +
            coord.lat.toFixed(5) +
            ', ' +
            coord.lng.toFixed(5) +
            '<br>';
        } catch (e) {
          console.log('errore ' + e);
        }
      }
    });
};
