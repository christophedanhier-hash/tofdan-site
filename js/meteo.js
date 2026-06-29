(function () {
  'use strict';

  var LAT = 50.5333;
  var LON = 4.6;
  var TIMEZONE = 'Europe/Brussels';

  var cards = {};
  var refreshBtn = null;
  var timestampEl = null;
  var errorEl = null;
  var loadingEl = null;

  function $(id) {
    return document.getElementById(id);
  }

  function calcMoonPhase(date) {
    var jd = date.getTime() / 86400000 + 2440587.5;
    var daysSinceNew = jd - 2451549.5;
    var newMoons = daysSinceNew / 29.53058867;
    var phase = newMoons - Math.floor(newMoons);
    var age = phase * 29.53058867;
    var illum = Math.round(((1 - Math.cos(phase * 2 * Math.PI)) / 2) * 100);

    var name;
    if (age < 1.8457) name = 'Nouvelle Lune';
    else if (age < 5.53699) name = 'Premier Croissant';
    else if (age < 9.22831) name = 'Premier Quartier';
    else if (age < 12.91963) name = 'Gibbeuse Croissante';
    else if (age < 16.61096) name = 'Pleine Lune';
    else if (age < 20.30228) name = 'Gibbeuse Décroissante';
    else if (age < 23.99361) name = 'Dernier Quartier';
    else if (age < 27.68493) name = 'Dernier Croissant';
    else name = 'Nouvelle Lune';

    return { name: name, illumination: illum, age: Math.round(age * 10) / 10 };
  }

  function moonEmoji(name, illum) {
    if (name === 'Nouvelle Lune') return '\uD83C\uDF11';
    if (name === 'Premier Croissant') return '\uD83C\uDF12';
    if (name === 'Premier Quartier') return '\uD83C\uDF13';
    if (name === 'Gibbeuse Croissante') return '\uD83C\uDF14';
    if (name === 'Pleine Lune') return '\uD83C\uDF15';
    if (name === 'Gibbeuse Décroissante') return '\uD83C\uDF16';
    if (name === 'Dernier Quartier') return '\uD83C\uDF17';
    if (name === 'Dernier Croissant') return '\uD83C\uDF18';
    return '\uD83C\uDF15';
  }

  function cloudEmoji(cover) {
    if (cover <= 10) return '\u2600\uFE0F';
    if (cover <= 30) return '\uD83C\uDF24\uFE0F';
    if (cover <= 60) return '\u26C5';
    if (cover <= 85) return '\uD83C\uDF25\uFE0F';
    return '\u2601\uFE0F';
  }

  function seeingLabel(score) {
    if (score <= 2.5) return 'Excellent';
    if (score <= 4.5) return 'Bon';
    if (score <= 6.5) return 'Moyen';
    if (score <= 8.5) return 'Médiocre';
    return 'Mauvais';
  }

  function seeingColor(score) {
    if (score <= 2.5) return '#22c55e';
    if (score <= 4.5) return '#84cc16';
    if (score <= 6.5) return '#eab308';
    if (score <= 8.5) return '#f97316';
    return '#ef4444';
  }

  function windEmoji(speed) {
    if (speed < 5) return '\uD83C\uDF43';
    if (speed < 15) return '\uD83C\uDF2C\uFE0F';
    if (speed < 30) return '\uD83D\uDCA8';
    return '\uD83C\uDF2A\uFE0F';
  }

  function humidityEmoji(hum) {
    if (hum < 40) return '\uD83C\uDF35';
    if (hum < 70) return '\uD83D\uDCA7';
    return '\uD83D\uDCA6';
  }

  function tempEmoji(temp) {
    if (temp < 0) return '\uD83E\uDD76';
    if (temp < 10) return '\uD83D\uDE30';
    if (temp < 20) return '\uD83D\uDE0A';
    if (temp < 30) return '\uD83D\uDE0E';
    return '\uD83E\uDD75';
  }

  function jetEmoji(speed) {
    if (speed < 60) return '\uD83D\uDFE2';
    if (speed < 100) return '\uD83D\uDFE1';
    if (speed < 140) return '\uD83D\uDFE0';
    return '\uD83D\uDD34';
  }

  function showLoading() {
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (refreshBtn) refreshBtn.disabled = true;
    Object.keys(cards).forEach(function (id) {
      cards[id].classList.add('weather-card--loading');
    });
  }

  function hideLoading() {
    if (loadingEl) loadingEl.style.display = 'none';
    if (refreshBtn) refreshBtn.disabled = false;
    Object.keys(cards).forEach(function (id) {
      cards[id].classList.remove('weather-card--loading');
    });
  }

  function showError(msg) {
    hideLoading();
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  function formatTime(iso) {
    if (!iso) return '--:--';
    var d = new Date(iso);
    var h = d.getHours();
    var m = d.getMinutes();
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  function formatTimestamp(d) {
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var hours = String(d.getHours()).padStart(2, '0');
    var minutes = String(d.getMinutes()).padStart(2, '0');
    return day + '/' + month + ' ' + hours + ':' + minutes;
  }

  function getCurrentHourIndex(hourlyTimes) {
    var now = new Date();
    var nowIso = now.toISOString().substring(0, 13) + ':00';
    var idx = hourlyTimes.indexOf(nowIso);
    if (idx >= 0) return idx;
    for (var i = 0; i < hourlyTimes.length; i++) {
      if (hourlyTimes[i] >= nowIso) return i;
    }
    return 0;
  }

  function updateCard(id, value, detail, iconOverride, valueColor) {
    var card = cards[id];
    if (!card) return;
    var valueEl = card.querySelector('.weather-card__value');
    var detailEl = card.querySelector('.weather-card__detail');
    var iconEl = card.querySelector('.weather-card__icon');
    if (valueEl) {
      valueEl.textContent = value;
      if (valueColor) valueEl.style.color = valueColor;
      else valueEl.style.color = '';
    }
    if (detailEl) detailEl.textContent = detail;
    if (iconEl && iconOverride) iconEl.textContent = iconOverride;
  }

  function processOpenMeteo(data) {
    var hourly = data.hourly;
    var daily = data.daily;
    var i = getCurrentHourIndex(hourly.time);

    var cloudCover = hourly.cloud_cover ? hourly.cloud_cover[i] : null;
    var humidity = hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : null;
    var dewPoint = hourly.dew_point_2m ? hourly.dew_point_2m[i] : null;
    var temp = hourly.temperature_2m ? hourly.temperature_2m[i] : null;
    var windSpeed = hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : null;
    var windGusts = hourly.wind_gusts_10m ? hourly.wind_gusts_10m[i] : null;

    var jetSpeed = null;
    if (hourly.wind_speed_250hPa) {
      jetSpeed = hourly.wind_speed_250hPa[i];
    } else if (hourly.wind_speed_200hPa) {
      jetSpeed = hourly.wind_speed_200hPa[i];
    }

    var seeingScore = null;
    if (jetSpeed !== null && cloudCover !== null && humidity !== null) {
      seeingScore = (jetSpeed / 40) + (cloudCover / 100) + (humidity / 100);
      seeingScore = Math.round(seeingScore * 10) / 10;
    } else if (jetSpeed !== null) {
      seeingScore = Math.round((jetSpeed / 40) * 10) / 10;
    }

    var sunrise = daily && daily.sunrise ? daily.sunrise[0] : null;
    var sunset = daily && daily.sunset ? daily.sunset[0] : null;

    if (cloudCover !== null) {
      var cloudLow = hourly.cloud_cover_low ? hourly.cloud_cover_low[i] : null;
      var cloudMid = hourly.cloud_cover_mid ? hourly.cloud_cover_mid[i] : null;
      var cloudHigh = hourly.cloud_cover_high ? hourly.cloud_cover_high[i] : null;
      var cloudDetail = cloudCover + '%';
      if (cloudLow !== null) cloudDetail += '  (basse ' + cloudLow + '%';
      if (cloudMid !== null) cloudDetail += ' / moy. ' + cloudMid + '%';
      if (cloudHigh !== null) cloudDetail += ' / haute ' + cloudHigh + '%)';
      updateCard('wc-cloud', cloudCover + '%', cloudDetail, cloudEmoji(cloudCover));
    }

    if (seeingScore !== null) {
      var label = seeingLabel(seeingScore);
      var color = seeingColor(seeingScore);
      updateCard('wc-seeing', label, 'Indice: ' + seeingScore + '/10', '\uD83D\uDC41\uFE0F', color);
    }

    if (humidity !== null) {
      var dewDetail = humidity + '%';
      if (dewPoint !== null && temp !== null) {
        var delta = temp - dewPoint;
        var dewRisk = delta < 2 ? ' — Risque buée élevé' : (delta < 5 ? ' — Risque buée modéré' : '');
        dewDetail = humidity + '% (pt rosée ' + dewPoint + '\u00B0C)' + dewRisk;
      }
      updateCard('wc-humidity', humidity + '%', dewDetail, humidityEmoji(humidity));
    }

    if (windSpeed !== null) {
      var windDetail = windSpeed + ' km/h';
      if (windGusts !== null) windDetail += ' (rafales ' + windGusts + ' km/h)';
      updateCard('wc-wind', windSpeed + ' km/h', windDetail, windEmoji(windSpeed));
    }

    if (temp !== null) {
      updateCard('wc-temp', temp + '\u00B0C', 'Mise en température du tube', tempEmoji(temp));
    }

    if (sunrise && sunset) {
      updateCard('wc-sun', formatTime(sunrise) + ' / ' + formatTime(sunset), 'Lever / Coucher du Soleil', '\uD83C\uDF05');
    } else if (sunrise) {
      updateCard('wc-sun', formatTime(sunrise), 'Lever du Soleil', '\uD83C\uDF05');
    }

    if (jetSpeed !== null) {
      var jetDetail = jetSpeed + ' km/h à ~10 500m';
      if (jetSpeed < 60) jetDetail += ' — très favorable';
      else if (jetSpeed < 100) jetDetail += ' — favorable';
      else if (jetSpeed < 140) jetDetail += ' — modéré';
      else jetDetail += ' — défavorable';
      updateCard('wc-jet', jetSpeed + ' km/h', jetDetail, jetEmoji(jetSpeed));
    }

    var moon = calcMoonPhase(new Date());
    updateCard('wc-moon', moon.name, moon.illumination + '% illuminée — Âge: ' + moon.age + ' jours', moonEmoji(moon.name, moon.illumination));
  }

  function fetchWeatherData() {
    showLoading();

    var url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=' + LAT
      + '&longitude=' + LON
      + '&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,relative_humidity_2m,dew_point_2m,temperature_2m,wind_speed_10m,wind_gusts_10m,wind_speed_250hPa'
      + '&daily=sunrise,sunset'
      + '&timezone=' + TIMEZONE
      + '&forecast_hours=24';

    fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error('Erreur API: ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (data.error) throw new Error(data.reason || 'Erreur API');
        processOpenMeteo(data);
        hideLoading();
        var now = new Date();
        if (timestampEl) {
          timestampEl.textContent = 'Mis à jour le ' + formatTimestamp(now);
          timestampEl.style.display = 'inline';
        }
      })
      .catch(function (err) {
        console.error('Météo fetch error:', err);
        var moon = calcMoonPhase(new Date());
        updateCard('wc-moon', moon.name, moon.illumination + '% illuminée — Âge: ' + moon.age + ' jours', moonEmoji(moon.name, moon.illumination));
        showError('Impossible de récupérer les données météo. Vérifiez votre connexion internet.');
      });
  }

  function init() {
    cards['wc-cloud'] = $('wc-cloud');
    cards['wc-seeing'] = $('wc-seeing');
    cards['wc-humidity'] = $('wc-humidity');
    cards['wc-wind'] = $('wc-wind');
    cards['wc-temp'] = $('wc-temp');
    cards['wc-moon'] = $('wc-moon');
    cards['wc-jet'] = $('wc-jet');
    cards['wc-sun'] = $('wc-sun');

    refreshBtn = $('meteo-refresh');
    timestampEl = $('meteo-timestamp');
    errorEl = $('meteo-error');
    loadingEl = $('meteo-loading');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        fetchWeatherData();
      });
    }

    fetchWeatherData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
