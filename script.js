function qs(id){return document.getElementById(id)}

const defaultLoc = {lat:28.6139, lon:77.2090, name:'New Delhi, IN'}

function fmt(t){if(!t) return '—'; return dayjs(t).format('HH:mm')}

async function updatePanchanga(lat, lon, name){
  const now = new Date()
  qs('date').textContent = dayjs(now).format('ddd, D MMM YYYY')
  qs('locLabel').textContent = name || `${lat.toFixed(3)}, ${lon.toFixed(3)}`

  const times = SunCalc.getTimes(now, lat, lon)
  qs('sunrise').textContent = fmt(times.sunrise)
  qs('sunset').textContent = fmt(times.sunset)

  const moonTimes = SunCalc.getMoonTimes(now, lat, lon)
  qs('moonrise').textContent = fmt(moonTimes.rise)
  qs('moonset').textContent = fmt(moonTimes.set)

  const illum = SunCalc.getMoonIllumination(now)
  const pct = Math.round(illum.phase*100)
  qs('moonphase').textContent = `${Math.round(illum.fraction*100)}% lit • phase ${pct}`

  qs('details').textContent = `Sun altitude at noon: ${Math.round((SunCalc.getPosition(now, lat, lon).altitude||0)*180/Math.PI)}°`;
}

function parseCoords(text){
  if(!text) return null
  const m = text.split(/[ ,]+/).map(x=>parseFloat(x)).filter(x=>!isNaN(x))
  if(m.length>=2) return {lat:m[0], lon:m[1]}
  return null
}

document.addEventListener('DOMContentLoaded', ()=>{
  const place = qs('place')
  qs('useGeolocation').addEventListener('click', ()=>{
    if(!navigator.geolocation) { alert('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(pos=>{
      updatePanchanga(pos.coords.latitude, pos.coords.longitude, 'Your location')
    }, ()=>{
      alert('Permission denied — using default')
      updatePanchanga(defaultLoc.lat, defaultLoc.lon, defaultLoc.name)
    })
  })

  place.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){
      const parsed = parseCoords(place.value)
      if(parsed) updatePanchanga(parsed.lat, parsed.lon, place.value)
      else fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place.value)}`)
        .then(r=>r.json()).then(arr=>{
          if(arr && arr[0]) updatePanchanga(parseFloat(arr[0].lat), parseFloat(arr[0].lon), arr[0].display_name)
          else alert('Location not found')
        })
    }
  })

  // initial
  updatePanchanga(defaultLoc.lat, defaultLoc.lon, defaultLoc.name)
})
