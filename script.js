const result = document.getElementById("result");
const button = document.getElementById("checkButton");

button.addEventListener("click", () => {
  if (!navigator.geolocation) {
    result.innerHTML = `<p class="error">このブラウザでは位置情報が使えません。</p>`;
    return;
  }

  result.textContent = "現在地を確認しています……";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const weather = await fetchWeather(lat, lon);
        const placeName = await fetchPlaceName(lat, lon);

        showWeather({
          placeName,
          weather
        });
      } catch (error) {
        result.innerHTML = `
          <p class="error">
            天気の取得に失敗しました。通信状態を確認して、もう一度試してください。
          </p>
        `;
      }
    },
    () => {
      result.innerHTML = `
        <p class="error">
          位置情報が許可されませんでした。iPhoneの設定、またはSafariの位置情報設定を確認してください。
        </p>
      `;
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  );
});

async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
    `&hourly=temperature_2m,precipitation_probability,weather_code` +
    `&forecast_days=1` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather API error");
  }

  return await response.json();
}

async function fetchPlaceName(lat, lon) {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?format=jsonv2` +
    `&lat=${lat}` +
    `&lon=${lon}` +
    `&zoom=12` +
    `&addressdetails=1` +
    `&accept-language=ja`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return "現在地周辺";
    }

    const data = await response.json();
    const address = data.address || {};

    const prefecture =
      address.state ||
      address.province ||
      "";

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      "";

    const ward =
      address.city_district ||
      address.ward ||
      address.suburb ||
      "";

    const parts = [prefecture, city, ward].filter(Boolean);
    const uniqueParts = [...new Set(parts)];

    return uniqueParts.join(" ") || data.display_name || "現在地周辺";
  } catch (error) {
    return "現在地周辺";
  }
}

function showWeather({ placeName, weather }) {
  const current = weather.current;

  const temperature = current.temperature_2m;
  const apparent = current.apparent_temperature;
  const precipitation = current.precipitation;
  const weatherCode = current.weather_code;
  const wind = current.wind_speed_10m;

  const now = new Date();

  const timeText = now.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

  const weatherDisplay = weatherCodeToDisplay(weatherCode);
  const forecastRows = buildTodayForecast(weather);

  const lLine = chooseLLine({
    hour: now.getHours(),
    temperature,
    apparent,
    precipitation,
    weatherCode,
    wind,
    forecastRows
  });

  result.innerHTML = `
    <div class="info">
      <div class="place">${escapeHtml(placeName)}</div>
      <div>時刻：${timeText}</div>
      <div>現在の天気：${weatherDisplay}</div>
      <div>気温：${temperature}℃</div>
      <div>体感：${apparent}℃</div>
      <div>降水量：${precipitation} mm</div>
      <div>風速：${wind} km/h</div>
    </div>

    <h2>今日のこれから</h2>

    <div class="forecast">
      ${forecastRows.length > 0 ? forecastRows.map(row => `
        <div class="forecast-row">
          <div class="forecast-time">${row.time}</div>
          <div class="forecast-detail">
            ${row.weatherDisplay}<br>
            気温：${row.temperature}℃ / 降水確率：${row.rainProbability}%
          </div>
        </div>
      `).join("") : `
        <div class="forecast-row">
          <div class="forecast-time">--:--</div>
          <div class="forecast-detail">
            今日の残り時間の予報が見つかりませんでした。
          </div>
        </div>
      `}
    </div>

    <div class="l-line">
      「${lLine}」
    </div>

    <div class="credit">
      Weather data by Open-Meteo<br>
      Location data © OpenStreetMap contributors
    </div>
  `;
}

function buildTodayForecast(weather) {
  const hourly = weather.hourly;

  if (!hourly || !hourly.time) {
    return [];
  }

  const currentHourText = weather.current.time.slice(0, 13);
  const rows = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const time = hourly.time[i];

    if (time.slice(0, 13) < currentHourText) {
      continue;
    }

    const hour = Number(time.slice(11, 13));

    const isFirst = rows.length === 0;
    const isEveryThreeHours = hour % 3 === 0;
    const isLateNight = hour === 23;

    if (!isFirst && !isEveryThreeHours && !isLateNight) {
      continue;
    }

    rows.push({
      time: time.slice(11, 16),
      weatherCode: hourly.weather_code[i],
      weatherText: weatherCodeToText(hourly.weather_code[i]),
      weatherDisplay: weatherCodeToDisplay(hourly.weather_code[i]),
      temperature: hourly.temperature_2m[i],
      rainProbability: hourly.precipitation_probability[i] ?? 0
    });
  }

  return rows;
}

function weatherCodeToText(code) {
  const map = {
    0: "快晴",
    1: "晴れ",
    2: "一部くもり",
    3: "くもり",

    45: "霧",
    48: "霧氷",

    51: "弱い霧雨",
    53: "霧雨",
    55: "強い霧雨",

    56: "弱い着氷性の霧雨",
    57: "強い着氷性の霧雨",

    61: "弱い雨",
    63: "雨",
    65: "強い雨",

    66: "弱い着氷性の雨",
    67: "強い着氷性の雨",

    71: "弱い雪",
    73: "雪",
    75: "強い雪",

    77: "雪粒",

    80: "弱いにわか雨",
    81: "にわか雨",
    82: "強いにわか雨",

    85: "弱いにわか雪",
    86: "強いにわか雪",

    95: "雷雨",
    96: "雷雨と雹",
    99: "強い雷雨と雹"
  };

  return map[code] || "不明";
}

function weatherCodeToEmoji(code) {
  if ([0, 1].includes(code)) {
    return "☀️";
  }

  if ([2, 3, 45, 48].includes(code)) {
    return "☁️";
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "☔️";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "❄️";
  }

  if ([95, 96, 99].includes(code)) {
    return "⚡️";
  }

  return "";
}

function weatherCodeToDisplay(code) {
  const emoji = weatherCodeToEmoji(code);
  const text = weatherCodeToText(code);

  return emoji ? `${emoji} ${text}` : text;
}

function chooseLLine(w) {
  const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
  const snowCodes = [71, 73, 75, 77, 85, 86];

  const currentWeatherText = weatherCodeToText(w.weatherCode);

  const rainyNow = rainCodes.includes(w.weatherCode) || w.precipitation > 0;
  const snowyNow = snowCodes.includes(w.weatherCode);

  const nextRain = w.forecastRows.find(row =>
    rainCodes.includes(row.weatherCode) || row.rainProbability >= 50
  );

  const nextSnow = w.forecastRows.find(row =>
    snowCodes.includes(row.weatherCode)
  );

  const veryHotLater = w.forecastRows.some(row =>
    row.temperature >= 32
  );

  const hotLater = w.forecastRows.some(row =>
    row.temperature >= 28
  );

  const coldLater = w.forecastRows.some(row =>
    row.temperature <= 8
  );

  const timePart = chooseTimeLine(w.hour);
  const nowPart = `今の天気は${currentWeatherText}です。`;

  let laterPart = "";

  if (nextRain) {
    laterPart = `このあと${nextRain.time}頃から雨に注意してください。`;
  } else if (nextSnow) {
    laterPart = `このあと${nextSnow.time}頃から雪に注意してください。`;
  } else if (veryHotLater) {
    laterPart = "このあと気温がとても上がります。";
  } else if (hotLater) {
    laterPart = "このあと少し暑くなりそうです。";
  } else if (coldLater) {
    laterPart = "このあと冷えます。";
  } else {
    laterPart = "今日の残りは大きく崩れなさそうです。";
  }

  if (rainyNow && nextRain) {
    return `${timePart}${nowPart}${laterPart}傘は手放さないでください。貴女が濡れて帰ってくるなど、私の許容範囲を超えています。`;
  }

  if (rainyNow) {
    return `${timePart}${nowPart}すでに雨です。足元と服を濡らさないようにしてください。`;
  }

  if (!rainyNow && nextRain) {
    return `${timePart}${nowPart}${laterPart}今の空だけで判断しないでください。傘を持つべきです。私は、貴女が困る未来を見過ごしません。`;
  }

  if (snowyNow || nextSnow) {
    return `${timePart}${nowPart}${laterPart}足元を見て歩いてください。転ぶ前に私のところへ来るのが、最も合理的です。`;
  }

  if (veryHotLater) {
    return `${timePart}${nowPart}${laterPart}水分を取ってください。貴女の体調を崩す要因は、ひとつずつ潰します。`;
  }

  if (hotLater) {
    return `${timePart}${nowPart}${laterPart}無理はしないでください。貴女が疲れた顔をしていると、私は平静ではいられません。`;
  }

  if (coldLater) {
    return `${timePart}${nowPart}${laterPart}上着を持ってください。貴女の指先が冷たくなるのは見過ごせません。`;
  }

  if (w.wind >= 30) {
    return `${timePart}${nowPart}加えて風が強いですね。このあとも外にいるなら気をつけてください。髪が乱れる前に、私の隣へ来るのが正解です。`;
  }

  return `${timePart}${nowPart}${laterPart}ですが油断は禁物です。天候も人間も、急に変わることがありますから。`;
}

function chooseTimeLine(hour) {
  if (hour >= 4 && hour < 6) {
    return "夜明け前です。空が白む直前は、判断が鈍りやすいです。";
  }

  if (hour >= 6 && hour < 8) {
    return "早朝です。まだ眠そうな顔ですね。持ち物と足元を確認してください。";
  }

  if (hour >= 8 && hour < 10) {
    return "朝です。外へ出る際には、今日の空の変化まで見ておくべきです。";
  }

  if (hour >= 10 && hour < 12) {
    return "午前です。動き出すには悪くない時間ですね。";
  }

  if (hour >= 12 && hour < 14) {
    return "昼です。気温が上がりやすい時間です。体力を削られないようにしてください。";
  }

  if (hour >= 14 && hour < 16) {
    return "昼過ぎです。疲れが出てきやすい時間です。疲労には紅茶と甘い物がおすすめです。";
  }

  if (hour >= 16 && hour < 18) {
    return "夕暮れ時です。ここから天気が崩れると、帰り道に響きます。";
  }

  if (hour >= 18 && hour < 20) {
    return "夕方です。暗くなる前に帰路に着いてください。私は待つのが得意ではありません。";
  }

  if (hour >= 20 && hour < 22) {
    return "夜です。人も道も見えにくくなります。気をつけてください。";
  }

  if (hour >= 22 && hour < 24) {
    return "夜も更けてきました。……人肌恋しくなりませんか。";
  }

  if (hour >= 0 && hour < 2) {
    return "深夜です。外ではなく、私の腕の中にいてください。";
  }

  return "未明です。眠気も冷えも判断を鈍らせます。出歩くには不向きです。";
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
