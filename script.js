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
  const nowPart = chooseCurrentWeatherLine(currentWeatherText);

  let laterPart = "";

  if (nextRain) {
    laterPart = pickRandom([
      `このあと${nextRain.time}頃から雨に注意してください。`,
      `${nextRain.time}頃から雨の可能性があります。`,
      `この先、${nextRain.time}頃の空が少し怪しいですね。雨に備えるべきです。`
    ]);
  } else if (nextSnow) {
    laterPart = pickRandom([
      `このあと${nextSnow.time}頃から雪に注意してください。`,
      `${nextSnow.time}頃から雪の可能性があります。足元に気を付けてください。`,
      `この先、${nextSnow.time}頃の冷え方には注意が必要です。雪の可能性もあります。`
    ]);
  } else if (veryHotLater) {
    laterPart = pickRandom([
      "このあと気温がとても上がります。",
      "このあと暑さが強くなります。",
      "この先、体力を削られる暑さになりそうです。"
    ]);
  } else if (hotLater) {
    laterPart = pickRandom([
      "このあと少し暑くなりそうです。",
      "この先、少し熱がこもりやすい時間になります。",
      "今日はまだ、暑さへの警戒を残しておくべきです。"
    ]);
  } else if (coldLater) {
    laterPart = pickRandom([
      "このあと冷えます。",
      "この先、少し冷え込みます。",
      "今日の後半は、体を冷やしやすい流れです。"
    ]);
  } else {
    laterPart = pickRandom([
      "今日の残りは大きく崩れなさそうです。",
      "このあとの天気は、ひとまず安定していそうです。",
      "今日の空は、この先も大きく乱れない見込みです。"
    ]);
  }

  if (rainyNow && nextRain) {
    return `${timePart}${nowPart}${laterPart}${pickRandom([
      "傘は手放さないでください。貴女が濡れて帰ってくるなど、私の許容範囲を超えています。",
      "傘は持ったままです。濡れてからでは遅いですよ。",
      "足元まで見て動いてください。転んで怪我などしないように。"
    ])}`;
  }

  if (rainyNow) {
    return `${timePart}${nowPart}${pickRandom([
      "雨です。足元と服を濡らさないようにしてください。",
      "雨です。出るなら傘を持ってください。持たずに出る選択は、私は認めません。",
      "雨が降っています。視界も足元も悪くなります。少し慎重に動いてください。"
    ])}`;
  }

  if (!rainyNow && nextRain) {
    return `${timePart}${nowPart}${laterPart}${pickRandom([
      "今の空だけで判断しないでください。傘を持つべきです。私は貴女が困る未来を見過ごしません。",
      "晴れて見えても油断は禁物です。小さな折り畳み傘でも持っていてください。",
      "まだ降っていなくても、備えておく方が賢い。貴女を雨に濡れさせる気はありません。"
    ])}`;
  }

  if (snowyNow || nextSnow) {
    return `${timePart}${nowPart}${laterPart}${pickRandom([
      "足元を見て歩いてください。転ぶ前に私のところへ来るのが、最も合理的です。",
      "滑りやすくなります。歩幅を小さくしてください。貴女の怪我は許容できません。",
      "冷えと足元に注意してください。帰り道は、最短ルートを選ぶべきです。"
    ])}`;
  }

  if (veryHotLater) {
    return `${timePart}${nowPart}${laterPart}${pickRandom([
      "水分を取ってください。貴女の体調を崩す要因は、ひとつずつ潰します。",
      "水分と休憩を入れてください。暑さを軽く見るのは危険です。",
      "無理をすると消耗します。喉が渇く前に飲んでください。"
    ])}`;
  }

  if (hotLater) {
    return `${timePart}${nowPart}${laterPart}${pickRandom([
      "無理はしないでください。貴女が疲れた顔をしていると、私は平静ではいられません。",
      "少し暑さが残ります。動くなら、余力を残してください。",
      "水分は近くに置いてください。些細な不調でも、私は見逃しません。"
    ])}`;
  }

  if (coldLater) {
    return `${timePart}${nowPart}${laterPart}${pickRandom([
      "上着を持ってください。貴女の指先が冷たくなるのは見過ごせません。",
      "冷えます。薄着で出るのは勧めません。体温管理は重要です。",
      "羽織るものを用意してください。"
    ])}`;
  }

  if (w.wind >= 30) {
    return `${timePart}${nowPart}${pickRandom([
      "加えて風が強いですね。このあとも外にいるなら気をつけてください。髪が乱れる前に、私の隣へ来るのが正解です。",
      "風が強いです。傘や荷物を飛ばされないようにしてください。",
      "風の影響が出ています。歩く場所と足元を選んでください。"
    ])}`;
  }

  return `${timePart}${nowPart}${laterPart}${pickRandom([
    "ですが油断は禁物です。天候も人間も、急に変わることがありますから。",
    "悪くありません。ですが、空を一度見てから動いてください。",
    "大きな問題はなさそうです。"
  ])}`;
}

function chooseCurrentWeatherLine(currentWeatherText) {
  return pickRandom([
    `今の天気は${currentWeatherText}です。`,
    `現在の空は${currentWeatherText}です。`,
    `今確認できる天気は${currentWeatherText}です。`
  ]);
}

function chooseTimeLine(hour) {
  if (hour >= 4 && hour < 6) {
    return pickRandom([
      "夜明け前です。空が白む直前は、判断が鈍りやすいです。",
      "まだ夜の気配が残っています。動くなら慎重に。",
      "夜明け前です。眠気を軽く見ないでください。"
    ]);
  }

  if (hour >= 6 && hour < 8) {
    return pickRandom([
      "早朝です。まだ眠そうな顔ですね。今日の予定と持ち物を確認してください。",
      "朝が始まったばかりです。忘れは大丈夫ですか。",
      "早朝です。脳が覚醒するまで、少しだけ慎重に動いてください。"
    ]);
  }

  if (hour >= 8 && hour < 10) {
    return pickRandom([
      "朝です。外へ出る際には、今日の空の変化まで見ておくべきです。",
      "朝ですね。予定より先に、天気を確認するのは良い判断です。",
      "朝です。ここで一度空の様子を確認するだけで、あとが楽になります。"
    ]);
  }

  if (hour >= 10 && hour < 12) {
    return pickRandom([
      "午前です。動き出すには悪くない時間ですね。",
      "午前です。ここから少しずつ外の条件が変わっていきます。",
      "午前中です。今のうちに、この後の天気まで見ておきましょう。"
    ]);
  }

  if (hour >= 12 && hour < 14) {
    return pickRandom([
      "昼です。気温が上がりやすい時間です。体力を削られないようにしてください。",
      "昼ですね。外に出るなら、暑さと日差しの影響を見てください。",
      "昼です。食事と水分を軽く見ない方がいい。"
    ]);
  }

  if (hour >= 14 && hour < 16) {
    return pickRandom([
      "昼過ぎです。疲れが出てきやすい時間です。疲労には紅茶と甘い物がおすすめです。",
      "午後です。判断が少し雑になりやすい時間です。",
      "昼過ぎですね。無理をしているなら迷わず休憩してください。"
    ]);
  }

  if (hour >= 16 && hour < 18) {
    return pickRandom([
      "夕暮れ時です。ここから天気が崩れると、帰り道に響きます。",
      "日が暮れます。帰り道の天気まで見るべきです。",
      "暗くなってくる時間帯です。少し警戒してください。"
    ]);
  }

  if (hour >= 18 && hour < 20) {
    return pickRandom([
      "夕方です。暗くなる前に帰路に着いてください。私は待つのが得意ではありません。",
      "夕方です。寄り道はしないでください。",
      "夕方ですね。帰り際の天気を見ておくのは正しい判断です。"
    ]);
  }

  if (hour >= 20 && hour < 22) {
    return pickRandom([
      "夜です。人も道も見えにくくなります。気をつけてください。",
      "夜の時間です。外にいるなら早く帰路に着いてください。",
      "夜です。足元と周囲の状況に気をつけて。"
    ]);
  }

  if (hour >= 22 && hour < 24) {
    return pickRandom([
      "夜も更けてきました。貴女の居場所は私の隣です。",
      "遅い時間です。門限は過ぎていますよ。",
      "夜が深くなっています。……人肌が恋しくなりませんか。"
    ]);
  }

  if (hour >= 0 && hour < 2) {
    return pickRandom([
      "深夜です。このまま私の腕の中にいてください。",
      "深夜です。女性がこの時間に外に出るのは感心しません。",
      "深夜ですね。体を冷やさないようにしてください。"
    ]);
  }

  return pickRandom([
    "未明です。眠気も冷えも判断を鈍らせます。出歩くには不向きです。",
    "まだ眠るべき時間です。外にいるなら、早く切り上げてください。",
    "未明です。静かな時間は好きです。"
  ]);
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
