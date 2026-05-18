// Enhanced Panchanga Calculator
const TITHIS = ['Pratipadā', 'Dvitiā', 'Tritiā', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 
                'Navami', 'Dasami', 'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'];

const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya',
                    'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Svati',
                    'Viśākhā', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
                    'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

const YOGAS = ['Viskambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
               'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Sattva',
               'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhrti'];

const KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kintamani', 'Bhadra', 'Righu', 'Ajapada', 'Shula', 'Pisces'];

const MONTHS_HINDI = ['Chaitra', 'Vaishakh', 'Jyaistha', 'Ashadh', 'Shravan', 'Bhadrapad', 'Ashwin', 'Kartik', 'Margshirsh', 'Paush', 'Magh', 'Phalgun'];

const FESTIVALS = {
  '2026-01-26': 'Republic Day',
  '2026-03-08': 'Holi',
  '2026-03-25': 'Gudi Padwa',
  '2026-04-02': 'Eid ul-Fitr',
  '2026-04-14': 'Ambedkar Jayanti',
  '2026-04-15': 'Baisakhi',
  '2026-05-01': 'May Day',
  '2026-05-31': 'Vat Purnima',
  '2026-08-15': 'Independence Day',
  '2026-09-01': 'Ganesh Chaturthi',
  '2026-10-02': 'Gandhi Jayanti',
  '2026-10-05': 'Dussehra',
  '2026-10-29': 'Diwali',
  '2026-11-01': 'Govardhan Puja',
  '2026-12-25': 'Christmas'
};

const RITUS = ['Vasant', 'Grishma', 'Varsha', 'Sharad', 'Hemant', 'Shishir'];

function qs(id) { return document.getElementById(id); }

const defaultLoc = { lat: 28.6139, lon: 77.2090, name: 'New Delhi, IN' };

function fmt(t) {
  if (!t) return '—';
  return dayjs(t).format('HH:mm');
}

function getTithiInfo(moonAge) {
  // moonAge 0-1, tithi calculation
  const phase = moonAge % 1;
  const tithi = Math.floor(phase * 30) % 30;
  const tithiName = tithi < 15 ? TITHIS[tithi] : TITHIS[30 - tithi];
  const elapsed = Math.round((phase % 0.0333) / 0.0333 * 100);
  return { tithi: tithi % 15, name: tithiName, elapsed };
}

function getNakshatraInfo(date) {
  // Approximate: ~13.33 days per nakshatra
  const dayOfYear = dayjs(date).dayOfYear();
  const nakshatraIndex = Math.floor((dayOfYear % 365) / 13.33) % NAKSHATRAS.length;
  return { index: nakshatraIndex, name: NAKSHATRAS[nakshatraIndex] };
}

function getYogaInfo(date, moonAge) {
  // Yoga based on lunar day
  const phase = moonAge % 1;
  const yogaIndex = Math.floor(phase * 27) % YOGAS.length;
  return { index: yogaIndex, name: YOGAS[yogaIndex] };
}

function getKaranaInfo(moonAge) {
  // Karana changes twice per tithi
  const phase = moonAge % 1;
  const karana = Math.floor(phase * 60) % KARANAS.length;
  return { index: karana, name: KARANAS[karana] };
}

function getPaksha(moonPhase) {
  // Krishna (dark): 0-0.5, Shukla (bright): 0.5-1.0
  return moonPhase < 0.5 ? 'Krishna Paksha' : 'Shukla Paksha';
}

function getMoonPhaseName(illumination) {
  if (illumination < 6.25) return 'New Moon';
  if (illumination < 18.75) return 'Waxing Crescent';
  if (illumination < 31.25) return 'Waxing Crescent';
  if (illumination < 43.75) return 'First Quarter';
  if (illumination < 56.25) return 'Waxing Gibbous';
  if (illumination < 68.75) return 'Full Moon';
  if (illumination < 81.25) return 'Waning Gibbous';
  if (illumination < 93.75) return 'Last Quarter';
  return 'Waning Crescent';
}

function getRituInfo(date) {
  const month = dayjs(date).month(); // 0-11
  const rituIndex = Math.floor(month / 2);
  return RITUS[rituIndex];
}

function getDayDuration(sunrise, sunset) {
  if (!sunrise || !sunset) return '—';
  const duration = dayjs(sunset).diff(dayjs(sunrise), 'hour', true);
  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);
  return `${hours}h ${minutes}m`;
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
  const litPct = Math.round(illum.fraction * 100);
  const phaseName = getMoonPhaseName(litPct);
  
  qs('moonPhase').textContent = `${litPct}% lit — ${phaseName}`;

  // Panchanga info
  const tithi = getTithiInfo(illum.phase);
  qs('tithi').textContent = tithi.name;
  qs('tithiDesc').textContent = `(Elapsed: ${tithi.elapsed}%)`;

  const nakshatra = getNakshatraInfo(now);
  qs('nakshatra').textContent = nakshatra.name;
  qs('nakshatraDesc').textContent = `(Star: ${nakshatra.index + 1}/27)`;

  const yoga = getYogaInfo(now, illum.phase);
  qs('yoga').textContent = yoga.name;
  qs('yogaFull').textContent = yoga.name;

  const karana = getKaranaInfo(illum.phase);
  qs('karana').textContent = karana.name;
  qs('karanaFull').textContent = karana.name;

  const paksha = getPaksha(illum.phase);
  qs('paksha').textContent = paksha;

  // Additional info
  const ritu = getRituInfo(now);
  const dayDuration = getDayDuration(times.sunrise, times.sunset);
  
  // Update tab content with additional info
  const panchangPane = qs('panchang');
  panchangPane.innerHTML = `
    <div class="info-grid">
      <div class="info-item"><strong>Paksha</strong><span>${paksha}</span></div>
      <div class="info-item"><strong>Yoga</strong><span>${yoga.name}</span></div>
      <div class="info-item"><strong>Karana</strong><span>${karana.name}</span></div>
      <div class="info-item"><strong>Moon Phase</strong><span>${litPct}% • ${phaseName}</span></div>
      <div class="info-item"><strong>Ritu (Season)</strong><span>${ritu}</span></div>
      <div class="info-item"><strong>Day Duration</strong><span>${dayDuration}</span></div>
      <div class="info-item"><strong>Sun Altitude (Noon)</strong><span>${Math.round((SunCalc.getPosition(now, lat, lon).altitude || 0) * 180 / Math.PI)}°</span></div>
      <div class="info-item"><strong>Location</strong><span>${lat.toFixed(2)}°, ${lon.toFixed(2)}°</span></div>
    </div>
  `;

  // Festival info
  const dateKey = dayjs(now).format('YYYY-MM-DD');
  const festival = FESTIVALS[dateKey];
  const festivalsPane = qs('festivals');
  festivalsPane.innerHTML = festival ? `<p><strong>🎉 Festival Today:</strong> ${festival}</p>` : '<p>No major festivals today.</p>';
  
  // Muhurat info (auspicious times - simplified)
  const muhuratPane = qs('muhurat');
  const sunAltitude = SunCalc.getPosition(now, lat, lon).altitude * 180 / Math.PI;
  const isMorning = sunAltitude < 10;
  muhuratPane.innerHTML = `
    <div style="padding: 16px;">
      <p><strong>Brahmamuhurat (Pre-dawn):</strong> 4:00 AM - 5:30 AM</p>
      <p><strong>Abhijit Muhurat (Noon):</strong> 11:30 AM - 12:30 PM</p>
      <p><strong>Sayahna Sandhya (Evening):</strong> 6:00 PM - 7:30 PM</p>
      <p style="margin-top: 12px; color: #9aa4b2; font-size: 0.85rem;">Current time is ${isMorning ? 'auspicious for morning rituals' : 'suitable for regular activities'}.</p>
    </div>
  `;

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
    if (!navigator.geolocation) { 
      alert('Geolocation not supported'); 
      return; 
    }
    useGeoBtn.textContent = '📍 Locating...';
    navigator.geolocation.getCurrentPosition(pos => {
      updatePanchanga(pos.coords.latitude, pos.coords.longitude, 'Your location');
      useGeoBtn.textContent = '📍 My Location';
    }, (err) => {
      alert('Permission denied — using default (New Delhi)');
      useGeoBtn.textContent = '📍 My Location';
      updatePanchanga(defaultLoc.lat, defaultLoc.lon, defaultLoc.name);
    });
  });

  place.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = place.value.trim();
      if (!input) return;
      
      const parsed = parseCoords(input);
      if (parsed) {
        place.placeholder = 'Enter city or coordinates';
        updatePanchanga(parsed.lat, parsed.lon, `${parsed.lat.toFixed(2)}, ${parsed.lon.toFixed(2)}`);
      } else {
        place.placeholder = 'Searching...';
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=1`)
          .then(r => r.json())
          .then(arr => {
            place.placeholder = 'Enter city or coordinates';
            if (arr && arr[0]) {
              const lat = parseFloat(arr[0].lat);
              const lon = parseFloat(arr[0].lon);
              updatePanchanga(lat, lon, arr[0].display_name.split(',')[0]);
              place.value = '';
            } else {
              alert('Location not found. Try another search.');
            }
          })
          .catch(err => { 
            place.placeholder = 'Enter city or coordinates';
            alert('Error fetching location. Check your internet connection.'); 
            console.error(err); 
          });
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

  // Initial load with default location
  console.log('Loading Panchanga for default location...');
  updatePanchanga(defaultLoc.lat, defaultLoc.lon, defaultLoc.name);
});
