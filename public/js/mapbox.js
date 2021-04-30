export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoieW9zdWlzaGVyciIsImEiOiJja28xNXIya3IwbWhmMnFwZ2EzMTZmbDBqIn0.p8__75D8BLzYpQheAutZBg';

    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yosuisherr/cko15yp140k1h17npoj06gnhp',
    // scrollZoom:false,
    zoom:4,
    });

    const bounds = new mapboxgl.LngLatBounds()

    locations.forEach(loc =>{
        const el = document.createElement('div')
        el.className = 'marker'

        new mapboxgl.Marker({
            element:el,
            anchor:'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map)

        new mapboxgl.Popup({
            offset:30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map)

        bounds.extend(loc.coordinates)
    })

    map.fitBounds(bounds, {
        padding:{
            top:200,
            bottom:150,
            left:100,
            right:100
        }
    })
}

