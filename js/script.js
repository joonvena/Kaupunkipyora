var data = document.querySelector("#lista");
var nappi = document.querySelector("#nap");
/*var haku = document.querySelector("#hae");*/
var uusi;


xmlhttp = new XMLHttpRequest();

xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

        /* console.log(xmlhttp.responseText);*/

        var taulukko = JSON.parse(this.responseText);

        var map = L.map('map').setView([60.192059, 24.945831], 11);
        L.tileLayer('https://cdn.digitransit.fi/map/v1/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
            id: 'hsl-map'
        }).addTo(map);


        var vektori = L.vectorGrid.protobuf("https://cdn.digitransit.fi/map/v1/{id}/{z}/{x}/{y}.pbf", {
            vectorTileLayerStyles: {},
            maxNativeZoom: 18,
            id: 'hsl-citybike-map',
            interactive: true,
            opacity: 0

        }).addTo(map);
        /*    L.control.locate().addTo(map);*/



        L.easyButton('fa-crosshairs fa-sm', function (btn, map) {

            function onLocationFound(e) {
                var radius = e.accuracy / 2;
                L.marker(e.latlng).addTo(map)
                    .bindPopup("You are within " + radius + " meters from this point").openPopup();
                L.circle(e.latlng, radius).addTo(map);
            }

            map.on('locationfound', onLocationFound);
            map.locate({setView: true, watch: true, enableHighAccuracy: true, maxZoom: 16});


        }).addTo(map);

        var osoitteet = [];

        var hakunappi = document.getElementById("nap")

        var pvapaana = 0;
        var tpaikkoja = 0;


        var stats = document.getElementById("statiikka");

        for (var k = 0; k < 220; k++) {
            pvapaana += taulukko.stations[k].bikesAvailable;
            tpaikkoja += taulukko.stations[k].spacesAvailable;
            osoitteet.push(taulukko.stations[k].name);

        }


        console.log(taulukko);

        stats.innerHTML += "Pyöräpaikkoja yhteensä: " + tpaikkoja + " " +
            "Pyöriä vapaana: " + pvapaana;

        for (var s = 0; s < 220; s++) {

            var koordinaatitX = taulukko.stations[s].x;
            var koordinaatitY = taulukko.stations[s].y;

            L.marker([koordinaatitY, koordinaatitX]).bindPopup(taulukko.stations[s].name + '<br>' + 'Pyöriä vapaana: ' + taulukko.stations[s].bikesAvailable).addTo(map);

        }

        hakunappi.addEventListener("click", function () {

            data.innerHTML = "";

            for (var i = 0; i < 220; i++) {

                var haku = document.getElementById("hae").value;

                var koordinaatitX = taulukko.stations[i].x;
                var koordinaatitY = taulukko.stations[i].y;


                if (taulukko.stations[i].name === haku) {


                    data.innerHTML += '<li>' + '<b>' + "Asema: " + '</b>' + taulukko.stations[i].name + '<b>' + " Pyöriä vapaana: " + '</b>' + taulukko.stations[i].bikesAvailable +
                        '<b>' + " Tyhjiä paikkoja: " + '</b>' + taulukko.stations[i].spacesAvailable + '</li>';
                    data.style.fontSize = "15px";
                    data.style.letterSpacing = "1px";

                    L.marker([koordinaatitY, koordinaatitX]).bindPopup(taulukko.stations[i].name + '<br>' + 'Pyöriä vapaana: ' + taulukko.stations[i].bikesAvailable).addTo(map).openPopup();

                    map.setView([koordinaatitY, koordinaatitX], 16);

                    console.log(koordinaatitY);
                    console.log(koordinaatitX);

                }

            }
        });


        // Hakulomake


        var options = {
            data: osoitteet,
            list: {
                maxNumberOfElements: 10,
                match:
                    {
                        enabled: true
                    }
            }
        };


        $("#hae").easyAutocomplete(options);


    } else {
        console.log("Ei saatu yhteyttä palvelimelle");
    }


// Ladataan karttatiedot


};


xmlhttp.open("GET", "https://api.digitransit.fi/routing/v1/routers/hsl/bike_rental");
xmlhttp.send(null);

