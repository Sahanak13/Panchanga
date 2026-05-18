// Panchanga Calculator
const TITHIS = ['Pratipadā', 'Dvitiā', 'Tritiā', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 
                'Navami', 'Dasami', 'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'];

const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya',
                    'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Svati',
                    'Viśākhā', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
                    'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

const YOGAS = ['Viskambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
               'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Sattva',
               'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhrti'];

const KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kintamani', 'Bhadra', 'Righu', 'Ajapada', 'Shula', 'Pisces', 'Naga', 'Shankara', 'Chatushpada', 'Rikta', 'Purna'];

function qs(id) { return document.getElementById(id); }

const defaultLoc = { lat: 28.6139, lon: 77.2090, name: 'New Delhi, IN' };

function fmt(t) {
  if (!t) return '—';
  return dayjs(t).format('HH:mm');
}

function getTithiInfo(moonAge) {
  // moonAge 0-1, convert to 0-15 (15 tithis per paksha)
  const tithi = Math.floor((moonAge % 1) * 15);
  return { tithi, name: TITHIS[tithi] };
}

function getNakshatraInfo(date) {
  // Simplified: approximate Nakshatra based on day of year
  const dayOfYear = dayjs(date).dayOfYear();
  const nakshatraIndex = Math.floor((dayOfYear % 365) / 13.33) % NAKSHATRAS.length;
  return { index: nakshatraIndex, name: NAKSHATRAS[nakshatraIndex] };
}

function getYogaInfo(date) {
  const dayOfYear = dayjs(date).dayOfYear();
  const yogaIndex = Math.floor((dayOfYear % 365) / 15.2) % YOGAS.length;
  return { index: yogaIndex, name: YOGAS[yogaIndex] };
}

function getKaranaInfo(moonAge) {
  const karana = Math.floor((moonAge % 1) * 60) % KARANAS.length;
  return { index: karana, name: KARANAS[karana] };
}

function getPaksha(moonPhase) {
  return moonPhase < 0.5 ? 'Krishna Paksha' : 'Shukla Paksha';
}

async function updatePanchanga(lat, lon, name) {
  const now = new Date();
  const dayName = dayjs(now).format('dddd');
  const dateStr = dayjs(now).format('MMMM D, YYYY');
  qs('dateDisplay').textContent = `${dayName.toUpperCase()}, ${dateStr}`;

  // Sun times
  const times = SunCalc.getTimes(now, lat, lon);
  qs('sunrise').textContent = fmt(times.sunrise);
  qs('sunset').textContent = fmt(times.sunset);

  // Moon times
  const moonTimes = SunCalc.getMoonTimes(now, lat, lon);
  qs('moonrise').textContent = fmt(moonTimes.rise);
  qs('moonset').textContent = fmt(moonTimes.set);

  // Moon illum & phase
  const illum = SunCalc.getMoonIllumination(now);
  const phasePct = Math.round(illum.phase * 100);
  const litPct = Math.round(illum.fraction * 100);
  qs('moonPhase').textContent = `${litPct}% lit (${phasePct}% phase)`;

  // Panchanga info
  const tithi = getTithiInfo(illum.phase);
  qs('tithi').textContent = tithi.name;
  qs('tithiDesc').textContent = `(${litPct}% illuminated)`;

  const nakshatra = getNakshatraInfo(now);
  qs('nakshatra').textContent = nakshatra.name;

  const yoga = getYogaInfo(now);
  qs('yoga').textContent = yoga.name;
  qs('yogaFull').textContent = yoga.name;

  const karana = getKaranaInfo(illum.phase);
  qs('karana').textContent = karana.name;
  qs('karanaFull').textContent = karana.name;

  qs('paksha').textContent = getPaksha(illum.phase);

  // Weekly view
  const weekContainer = qs('weekView');
  weekContainer.innerHTML = '';
  for (let i = -3; i <= 3; i++) {
    const d = dayjs(now).add(i, 'day');
    const dayElem = document.createElement('div');
    dayElem.className = `week-day ${i === 0 ? 'active' : ''}`;
    dayElem.innerHTML = `<div class="week-day-name">${d.format('ddd')}</div><div class="week-day-date">${d.format('D')}</div>`;
    weekContainer.appendChild(dayElem);
  }
}

function parseCoords(text) {
  if (!text) return null;
  const m = text.split(/[ ,]+/).map(x => parseFloat(x)).filter(x => !isNaN(x));
  if (m.length >= 2) return { lat: m[0], lon: m[1] };
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  const place = qs('place');
  const useGeoBtn = qs('useGeolocation');

  useGeoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      updatePanchanga(pos.coords.latitude, pos.coords.longitude, 'Your location');
    }, () => {
      alert('Permission denied — using default');
      updatePanchanga(defaultLoc.lat, defaultLoc.lon, defaultLoc.name);
    });
  });

  place.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const parsed = parseCoords(place.value);
      if (parsed) {
        updatePanchanga(parsed.lat, parsed.lon, place.value);
      } else {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place.value)}`)
          .then(r => r.json()).then(arr => {
            if (arr && arr[0]) {
              updatePanchanga(parseFloat(arr[0].lat), parseFloat(arr[0].lon), arr[0].display_name);
            } else {
              alert('Location not found');
            }
          }).catch(err => { alert('Error fetching location'); console.error(err); });
      }
    }
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      qs(tabName).classList.add('active');
    });
  });

  // Initial load
  updatePanchanga(defaultLoc.lat, defaultLoc.lon, defaultLoc.name);
});
