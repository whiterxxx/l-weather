const result = document.getElementById("result");
const button = document.getElementById("checkButton");

button.addEventListener("click", handleWeatherCheck);

async function handleWeatherCheck() {
  if (!navigator.geolocation) {
    result.innerHTML = `<p class="error">このブラウザでは位置情報が使えません。</p>`;
    return;
  }

  setButtonDisabled(true);
  setLoading("……現在地を確認しています。");

  try {
    const position = await getCurrentPosition();

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    setLoading("貴女の位置と空模様を照合しています。逃げても必ず私は見つけます。");

    const [placeName, weather] = await Promise.all([
      fetchPlaceName(lat, lon),
      fetchWeather(lat, lon)
    ]);

    showWeather(placeName, weather);
  } catch (error) {
    result.innerHTML = `<p class="error">${escapeHtml(getFriendlyError(error))}</p>`;
  } finally {
    setButtonDisabled(false);
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
}

async function fetchPlaceName(lat, lon) {
  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");

  url.search = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    localityLanguage: "ja"
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("場所の取得に失敗しました。");
  }

  const data = await response.json();

  const city = data.city || "";
  const locality = data.locality || "";

  if (city && locality && city !== locality) {
    return `${city}${locality}`;
  }

  return (
    locality ||
    city ||
    data.principalSubdivision ||
    data.countryName ||
    "今いる場所"
  );
}

async function fetchWeather(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.search = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,precipitation_probability",
    forecast_days: "1",
    timezone: "auto"
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("天気の取得に失敗しました。");
  }

  return await response.json();
}

function showWeather(placeName, weather) {
  const current = weather.current;
  const hourly = weather.hourly;

  const currentWeatherText = weatherCodeToText(current.weather_code);
  const currentTemperature = Math.round(current.temperature_2m);
  const windSpeed = Math.round(current.wind_speed_10m);

  const nextForecast = getNextForecast(hourly, current.time, 3);

  const nextWeatherText = weatherCodeToText(nextForecast.weatherCode);
  const nextTemperature = Math.round(nextForecast.temperature);
  const rainProbability = nextForecast.precipitationProbability;

  const forecastSentence = buildForecastSentence(
    currentWeatherText,
    nextWeatherText,
    nextTemperature,
    rainProbability
  );

  const possessiveLine = getRandomPossessiveLine(
    placeName,
    currentWeatherText
  );

  result.innerHTML = `
    <article class="weather-card">
      <p class="location-line">
        今、${escapeHtml(placeName)}にいるんですね。
      </p>

      <p class="weather-line">
        そちらの今の天気は${escapeHtml(currentWeatherText)}です。
        気温は${currentTemperature}℃、風は${windSpeed}km/hほどです。
      </p>

      <p class="forecast-line">
        ${escapeHtml(forecastSentence)}
      </p>

      <div class="detail-list">
        <div class="detail-item">
          <span class="detail-label">現在の天気</span>
          <span class="detail-value">
            ${escapeHtml(currentWeatherText)}
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">現在の気温</span>
          <span class="detail-value">
            ${currentTemperature}℃
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">約3時間後</span>
          <span class="detail-value">
            ${escapeHtml(nextWeatherText)}
          </span>
        </div>
      </div>

      <p class="l-line">
        ${escapeHtml(possessiveLine)}
      </p>
    </article>
  `;
}

function getNextForecast(hourly, currentTime, hoursAhead) {
  let currentIndex = hourly.time.findIndex(
    (time) => time >= currentTime
  );

  if (currentIndex === -1) {
    currentIndex = 0;
  }

  let targetIndex = currentIndex + hoursAhead;

  if (targetIndex >= hourly.time.length) {
    targetIndex = hourly.time.length - 1;
  }

  return {
    time: hourly.time[targetIndex],
    weatherCode: hourly.weather_code[targetIndex],
    temperature: hourly.temperature_2m[targetIndex],
    precipitationProbability:
      hourly.precipitation_probability
        ? hourly.precipitation_probability[targetIndex]
        : null
  };
}

function buildForecastSentence(
  currentWeatherText,
  nextWeatherText,
  nextTemperature,
  rainProbability
) {
  const rainText =
    typeof rainProbability === "number"
      ? `降水確率は${rainProbability}%です。`
      : "";

  if (currentWeatherText === nextWeatherText) {
    return `これからもしばらく${nextWeatherText}が続きそうです。気温は${nextTemperature}℃くらいになりますよ。${rainText}`;
  }

  return `これから${nextWeatherText}になりますよ。気温は${nextTemperature}℃くらいです。${rainText}`;
}

function weatherCodeToText(code) {
  const weatherMap = {
    0: "快晴",
    1: "晴れ",
    2: "少し曇り",
    3: "曇り",
    45: "霧",
    48: "霧氷",
    51: "弱い霧雨",
    53: "霧雨",
    55: "強い霧雨",
    56: "弱い凍る霧雨",
    57: "強い凍る霧雨",
    61: "弱い雨",
    63: "雨",
    65: "強い雨",
    66: "弱い凍る雨",
    67: "強い凍る雨",
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
    96: "雹を伴う雷雨",
    99: "強い雹を伴う雷雨"
  };

  return weatherMap[code] || "不明な天気";
}

function getRandomPossessiveLine(
  placeName,
  currentWeatherText
) {
  const lines = [
    `……${placeName}ですか。把握しました。貴女の居場所は常に把握しています。`,
    `その街の空より、私の視線のほうが近いです。貴女がどこにいても、私は必ず見つけます。`,
    `今そこにいるんですね。いいです。その場所は私の監視下です。`,
    `${currentWeatherText}ですか。貴女が外にいると常に気になります。貴女を濡らす雨も、冷やす風も、気に入りません。`,
    `勝手に遠くへ行くのは感心しません。貴女の現在地は常に私が把握しています。`,
    `貴女がそこで何をしているのか気になります。隠しても無駄ですが。`,
    `外の空気を吸うのは構いません。でも、貴女が帰る場所は私の腕の中です。`,
    `現在地、天気、次の空模様。全部確認しました。次は貴女の声を聞かせてもらいます。`,
    `そこにいるんですね。……私は、その街の誰よりも先に貴女を迎えに行けます。`,
    `貴女のいる場所を知ると安心します。正確には安心ではありません。所有欲が少しだけ満たされます。`,
    `その場所にいる貴女のことを考えると、少し妬けます。街も空も、貴女を見ていい許可を私から得ていません。`,
    `空模様より貴女のほうが重要です。けれど貴女を守ることに繋がるなら、天気さえ私の管理対象です。`,
    `位置は分かりました。天気も分かりました。あとは、貴女が私のところへ戻るだけです。`,
    `私の居ない空間に貴女がいると思うと、少し苛立ちます。早く私の腕の中に戻ってください。`,
    `どこにいても同じです。貴女の現在地は、最終的に私へ戻るための途中経路でしかありません。`
  ];

  return lines[Math.floor(Math.random() * lines.length)];
}

function setLoading(message) {
  result.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function setButtonDisabled(isDisabled) {
  button.disabled = isDisabled;
  button.textContent = isDisabled
    ? "確認しています……"
    : "Lから連絡を受ける";
}

function getFriendlyError(error) {
  if (error.code === 1) {
    return "位置情報が許可されませんでした。私から隠れるつもりですか。";
  }

  if (error.code === 2) {
    return "現在地を取得できませんでした。電波やGPSの状態を確認してもらえますか。";
  }

  if (error.code === 3) {
    return "位置情報の取得に時間がかかりすぎました。……もう一度試してみてください。";
  }

  return error.message || "……何かがうまくいきませんでした。";
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
