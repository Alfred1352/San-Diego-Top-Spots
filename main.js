$(document).ready(function() {
  $.getJSON('data.json', function(data){
    $.each(data, function (key, value) {
      
      var table = document.getElementById('myTable');
      var newRow = document.createElement('tr');
      var valueName = document.createElement('td');
      var valueDescription = document.createElement('td');
      var googleMaps = document.createElement('td');

      valueName.innerHTML = value.name;
      valueDescription.innerHTML = value.description;
      googleMaps.innerHTML = '<a href="https://www.google.com/maps?q=' + value.location + '">' + '<button>View Location</button>' + '</a>';

      newRow.appendChild(valueName);
      newRow.appendChild(valueDescription);
      newRow.appendChild(googleMaps);

     table.appendChild(newRow);

  });
  
  });

});



function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: {lat:32.7157, lng:-117.1611},
  });
  const geoLocationMarker = new google.maps.Marker({map});
  const geoLocationWindow = new google.maps.InfoWindow({content: 'Current location'});
  const directionsService = new google.maps.DirectionsService;
  const directionsDisplay = new google.maps.DirectionsRenderer({map});
  const service = new google.maps.DistanceMatrixService();
  const table = $('table > tbody');
  const information = [];

  function addRow(value, index) {
    const latLng = new google.maps.LatLng(value.location[0], value.location[1]);
    const marker = new google.maps.Marker({position: latLng, map});
    const contentString = '<h3>' + value.name + '</h3>' + '<p>' + value.description + '</p>';
    const infowindow = new google.maps.InfoWindow({content: contentString});
    const htmlTable = table.find('tr').eq(index).find('td').eq(2);
    
    myMarker.then((success) => {
      service.getDistanceMatrix({
        origins: [success],
        destinations: [latLng],
        travelMode: 'DRIVING',
      }, (response, status) => {
        if (status === 'OK') {
          const results = response.rows[0].elements[0];
          htmlTable.append('<p>Distance: ' + results.distance.text + '</p>');
        } else {
          alert('Error was: ' + status);
        }
      });       
    });       

    google.maps.event.addListener(marker, 'mouseover', () => {
      noInformation();
      infowindow.open(map, marker);
      information[0] = infowindow;
    });

    table.append(`<tr><td>${value.name}</td><td>${value.description}</td><td><a href="https://www.google.com/maps?q=${value.location}" target="blank">Open in Google Maps</a></td></tr>`);
    $('#destination').append(`<option value="${value.location}">${value.name}</option>`);
  }

  function noInformation() {
    if (information.length > 0) {
      information[0].set('marker', null);
      information[0].close();
      information.length = 0;
    }
  }

  const myMarker = new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((currentPosition) => {
        const position = {lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude};
        geoLocationMarker.setPosition(position);
        geoLocationWindow.setPosition(position);
        map.setCenter(position);
        resolve(position);
        
      });
    } else {
      reject(new Error('Geolocation is not supported by this browser'));
    }
  });
  function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    const destination = $('#destination').val();
    directionsService.route({
      origin: myMarker,
      destination: destination,
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }
  
  $('#submit').click(() => {
    calculateAndDisplayRoute(directionsService, directionsDisplay);
  });
  

  $(() => {
    $.getJSON('data.json', (data) => {
      data.forEach(addRow);
    });
  });
}


  
      
 