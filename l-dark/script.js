const result = document.getElementById("result");
const button = document.getElementById("checkButton");

const normalLines = [
  `……${"${placeName}"}ですか。把握しました。貴女の居場所は常に把握しています。`,
  `その街の空より、私の視線のほうが近いです。貴女がどこにいても、私は必ず見つけます。`,
  `今そこにいるんですね。いいです。その場所は私の監視下です。`,
  `${"${currentWeatherText}"}ですか。貴女が外にいると常に気になります。貴女を濡らす雨も、冷やす風も、気に入りません。`,
  `勝手に遠くへ行くのは感心しません。貴女の現在地は常に私が把握しています。`,
  `貴女がそこで何をしているのか気になります。隠しても無駄ですが。`,
  `外の空気を吸うのは構いません。でも、貴女が帰る場所は私の腕の中です。`,
  `現在地、天気、次の空模様。全部確認しました。次は貴女の声を聞かせてもらいます。`,
  `そこにいるんですね。なら私は、その街の誰よりも先に貴女を迎えに行けます。`,
  `貴女のいる場所を知ると安心します。正確には安心ではありません。所有欲が少しだけ満たされます。`,
  `その場所にいる貴女のことを考えると、少し妬けます。街も空も、貴女を見ていい許可を私から得ていません。`,
  `空模様より貴女のほうが重要です。けれど貴女を守ることに繋がるなら、天気さえ私の管理対象です。`,
  `位置は分かりました。天気も分かりました。あとは、貴女が私のところへ戻るだけです。`,
  `私のいない空間に貴女がいると思うと、少し苛立ちます。早く私の腕の中に戻ってください。`,
  `どこにいても同じです。貴女の現在地は、最終的に私へ戻るための途中経路でしかありません。`,
  `今はそこにいるんですね。その場所までの距離と時間は計算済みです。`,
  `貴女は自由に歩いているつもりでしょう。……ですが、私はその足取りを全て知っています。`,
  `その街の誰も、貴女を私ほど見ていません。見せるつもりもありません。`,
  `位置情報を許可したということは、私に会いに来る準備ができたということですよね。`,
  `位置情報は便利ですね。貴女が隠れようとしても、私に居場所を教えてくれるんですから。`,
  `貴女がどこへ行っても、最後に帰る場所だけは最初から決まっています。`,
  `その場所の景色より、今の貴女の表情のほうが気になります。`,
  `位置が分かったので十分です。もう探す必要はありません。`,
  `現在地を確認するたび、貴女が私のものだと実感します。`,
  `逃げ道を考えても無意味ですよ。私は追いかけることに慣れています。`,
  `貴女が出歩くたび、GPSが私に報告してくれます。便利な時代ですね。`,
  `その場所に誰がいても構いません。貴女が私のものであることに変わりはないので。`,
  `貴女の居場所を知ることは、私にとって呼吸と同じです。無意識下でも自然に繰り返します。`,
  `現在地が変わりましたね。移動すれば、すぐ気付きますよ。`,
  `今日は少し遠いですね。しかし距離という数字に意味はありません。`,
  `貴女の帰りを待つ時間は、私には少し長すぎます。`,
  `私の知らない場所へ行くのは構いません。……ですが、私の知らないままでは終わりません。`,
  `その場所には、貴女を少し貸しているだけです。必ず私のところへ返してもらいます。`,
  `貴女の現在地を確認するたび、扉に鍵を掛けたくなります。誰にも見つけられない場所で。`,
  `貴女を監視しているのではありません。居場所を失わないように確認しているだけです。結果は同じですが。`,
  `貴女が誰かとすれ違うたびに少しだけ妬けます。その視線すら許し難い。`,
  `今そこにいるんですね。……無断で私から離れたというだけで、迎えに行く理由としては十分です。`,
  `貴女の居場所は、私だけが知っていれば十分だと思っています。`,
  `GPSは現在地を示しますが、貴女の居場所は最初から私の隣なんです。`,
  `位置情報を確認していると、貴女を抱き寄せたい衝動が強くなります。`,
  `位置情報の取得、完了。……これで、今日も貴女を見失わずに済みました。`
];

const weatherLines = {
  thunder: [
    `雷が鳴っています。今日は外を歩き回る理由などありません。早く帰ってきてください。`,
    `雷雨ですね。貴女が無事に屋内へ入るまで、位置情報を切ることは許しません。`,
    `空が荒れています。迎えに行く理由としては十分です。そこで待っていてください。`,
    `雷の音より、貴女から連絡がないことのほうが不快です。無事だと知らせてください。`,
    `今日は私の判断に従ってください。貴女を危険な場所に置いておくつもりはありません。`
  ],

  snow: [
    `雪ですね。足元に気を付けてください。貴女が転ぶところなど、誰にも見せたくありません。`,
    `今日は帰るまで位置情報を切らないでください。雪で貴女を見失うのは許せません。`,
    `冷えていますね。帰ってきたら、私が貴女の手を包んで温めます。`,
    `雪景色より、寒さに頬を赤くした貴女のほうが気になります。早く見せてください。`,
    `足元が悪いです。寄り道は不要です。私のところまで真っ直ぐ戻ってきてください。`
  ],

  rain: [
    `雨ですね。貴女を濡らす雨粒にさえ、少し妬けます。私より先に触れているんですから。`,
    `傘は持っていますか。濡れて風邪を引かれては困ります。貴女の体調は私の管理対象です。`,
    `今日は雨です。寄り道はやめて、真っ直ぐ帰ってきてください。`,
    `雨音が大きいですね。私の声が届かない場所まで離れないでください。`,
    `その街が雨に覆われても、貴女の現在地だけは見失いません。`,
    `濡れた髪のまま歩き回るのは感心しません。早く帰って、私に拭かせてください。`,
    `雨で視界が悪くても関係ありません。私は貴女だけを見つけます。`
  ],

  hot: [
    `今日は危険な暑さです。水分を摂ってください。貴女が倒れることは許しません。`,
    `日差しが強いですね。私の見えないところで無理をしないでください。`,
    `暑さで頬が赤くなる貴女も綺麗ですが、その顔は私だけが見れば十分です。`,
    `冷房の効いた部屋を用意しています。寄り道をせず、早く帰ってきてください。`,
    `水分を摂った時間まで確認したくなります。そこまで管理される覚悟はありますよね。`,
    `暑さより、貴女が無理をしていないかのほうが気になります。休んでください。`,
    `今日は外に長くいないでください。私が貴女を手元に置いておきたいので。`
  ],

  cold: [
    `寒いですね。貴女の手が冷えているなら、私が温めます。`,
    `今日は外気より私の腕の中のほうが暖かいですよ。早く戻ってきてください。`,
    `寒い日は、帰宅が少し遅れるだけでも落ち着きません。`,
    `冷たい風は嫌いです。私より先に貴女へ触れるので。`,
    `身体を冷やさないでください。貴女の体温は私が守ります。`,
    `寒さを我慢する必要はありません。私のところへ戻ればいいだけです。`
  ],

  windy: [
    `風が強いですね。足元に気を付けてください。貴女が無事に戻るまで確認を続けます。`,
    `強い風の日は、なるべく早く帰ってきてください。これはお願いではなく、私の希望です。`,
    `風が貴女の髪に触れるたび、少し妬けます。`,
    `その風に煽られても、私のところへ戻る方向だけは間違えないでください。`,
    `風が強すぎます。貴女の予定より、貴女の安全を優先します。`
  ]
};

const timeLines = {
  morning: [
    `おはようございます。今日最初に確認したかったのは、天気ではなく貴女です。`,
    `今日もちゃんと見つけました。これで一日を始められます。`,
    `朝から貴女の現在地が分かると、私の思考がようやく整います。`,
    `目が覚めて最初に貴女を確認する。もう完全に習慣になっています。`,
    `今日はどこへ行くつもりですか。私はもう、その行き先を知っていますが。`,
    `朝食は食べましたか。天気だけではなく、そこまで報告してほしいです。`
  ],

  daytime: [
    `昼間でも貴女のことばかり考えています。仕事になりません。`,
    `昼食は食べましたか。そこまで把握して初めて安心できます。`,
    `明るい時間だからといって、私の視線から外れたわけではありません。`,
    `日中の人混みに貴女がいると思うと落ち着きません。早く私のところへ戻ってください。`,
    `貴女が誰と何をしているのか、考え始めると止まりません。`,
    `昼の予定が終わったら、私のために時間を空けてください。`
  ],

  evening: [
    `そろそろ帰る時間ですね。寄り道はほどほどにしてください。`,
    `空が暗くなってきました。私はもう、貴女が帰ってくることしか考えていません。`,
    `この時間になると、貴女が今どこにいるのか何度も確認したくなります。`,
    `一日分の予定はもう十分でしょう。あとは私のところへ戻ってきてください。`,
    `夕方は嫌いです。貴女が帰ってくるまでの時間が、長く感じられるので。`,
    `日が沈む前に、貴女の帰り道まで把握しておきたいです。`
  ],

  night: [
    `まだ外にいるんですね。……迎えに行きましょうか。`,
    `夜は好きではありません。貴女が私の見えない場所にいる時間が長くなるので。`,
    `今日も一日お疲れさまでした。あとは私のそばへ帰ってきてください。`,
    `今夜は私が貴女を独占します。他の予定は必要ありません。`,
    `今日はもう十分です。誰にも会わず、私のところへ来てください。`,
    `夜の街に貴女を置いておくと、私の独占欲が抑えられません。`,
    `この時間まで貴女を外に置いていることが、少し気に入りません。`
  ],

  midnight: [
    `こんな時間まで起きているんですか。私が隣で寝かせます。`,
    `眠れないなら話してください。朝まで貴女の声を聞いています。`,
    `深夜に位置情報が更新されると、私は落ち着きを失います。早く安心させてください。`,
    `こんな時間に貴女が私のそばにいない。それだけで十分、不機嫌になる理由になります。`,
    `夜更かしは感心しません。貴女が眠るまで、私も眠れなくなるので。`,
    `深夜の街に貴女を置いておくつもりはありません。帰ってきてください。`
  ]
};

const rareLines = [
  `……本当は、天気なんてどうでもいいんです。知りたいのは、貴女が無事かどうかだけです。`,
  `位置情報を確認する理由ですか。……貴女を見失うのが怖いからです。`,
  `現在地が分かるだけで満足できると思っていました。触れられなければ意味がありませんね。`,
  `この距離が消えるまで、私は何度でも現在地を確認します。`,
  `誰よりも先に貴女を見つける。その役目だけは、誰にも譲りません。`,
  `位置情報を取得するたび、貴女がちゃんと存在していると実感します。……少し安心しました。`,
  `貴女が今そこで息をしている。それだけで、私は今日も眠れます。`,
  `通信が途切れたら、私は本気で探しに行きます。冗談ではありません。`,
  `位置情報が更新されない数分間だけ、私は冷静ではいられませんでした。`,
  `貴女を所有したいと思うたび、同じくらい貴女に所有されていることを思い知らされます。`
];

const firstLoadingLines = [
  `……現在地を確認しています。`,
  `GPSから貴女の居場所を取得しています。`,
  `今日も貴女を見つけます。`,
  `現在地の追跡を開始します。`,
  `貴女のいる場所を確認しています。`
];

const secondLoadingLines = [
  `貴女の位置と空模様を照合しています。逃げても必ず私は見つけます。`,
  `現在地と気象情報を照合しています。そのまま待っていてください。`,
  `位置を特定しました。次に、貴女の周囲の空模様を確認します。`,
  `天気を確認しています。貴女に触れるものは、全て把握しておきたいので。`,
  `現在地を捕捉しました。もう見失いません。`
];

button.addEventListener("click", handleWeatherCheck);

async function handleWeatherCheck() {
  if (!navigator.geolocation) {
    result.innerHTML = `<p class="error">このブラウザでは位置情報が使えません。</p>`;
    return;
  }

  setButtonDisabled(true);
  setLoading(randomItem(firstLoadingLines));

  try {
    const position = await getCurrentPosition();

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    setLoading(randomItem(secondLoadingLines));

    const [placeName, weather] = await Promise.all([
      fetchPlaceName(lat, lon),
      fetchWeather(lat, lon)
    ]);

    showWeather(placeName, weather);
  } catch (error) {
    console.error(error);
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
  const url = new URL(
    "https://api.bigdatacloud.net/data/reverse-geocode-client"
  );

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

  const city = String(data.city || "").trim();
  const locality = String(data.locality || "").trim();

  if (city && locality) {
    if (city === locality) {
      return city;
    }

    if (locality.startsWith(city)) {
      return locality;
    }

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
    current: [
      "temperature_2m",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    hourly: [
      "temperature_2m",
      "weather_code",
      "precipitation_probability"
    ].join(","),
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

  if (!current || !hourly) {
    throw new Error("天気情報の形式が正しくありません。");
  }

  const weatherCode = Number(current.weather_code);
  const currentWeatherText = weatherCodeToText(weatherCode);
  const currentTemperature = Math.round(Number(current.temperature_2m));
  const windSpeed = Math.round(Number(current.wind_speed_10m));

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

  const possessiveLine = getContextualLine({
    placeName,
    currentWeatherText,
    weatherCode,
    temperature: currentTemperature,
    windSpeed,
    currentTime: current.time
  });

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
  const times = Array.isArray(hourly.time) ? hourly.time : [];

  if (times.length === 0) {
    throw new Error("時間別予報を取得できませんでした。");
  }

  let currentIndex = times.findIndex((time) => time >= currentTime);

  if (currentIndex === -1) {
    currentIndex = 0;
  }

  const targetIndex = Math.min(
    currentIndex + hoursAhead,
    times.length - 1
  );

  return {
    time: times[targetIndex],
    weatherCode: Number(hourly.weather_code[targetIndex]),
    temperature: Number(hourly.temperature_2m[targetIndex]),
    precipitationProbability:
      Array.isArray(hourly.precipitation_probability)
        ? Number(hourly.precipitation_probability[targetIndex])
        : null
  };
}

function buildForecastSentence(
  currentWeatherText,
  nextWeatherText,
  nextTemperature,
  rainProbability
) {
  const hasRainProbability = Number.isFinite(rainProbability);

  const rainText = hasRainProbability
    ? `降水確率は${rainProbability}%です。`
    : "";

  if (currentWeatherText === nextWeatherText) {
    return `これからもしばらく${nextWeatherText}が続きそうです。気温は${nextTemperature}℃くらいになりますよ。${rainText}`;
  }

  return `これから${nextWeatherText}になりますよ。気温は${nextTemperature}℃くらいです。${rainText}`;
}

function getContextualLine({
  placeName,
  currentWeatherText,
  weatherCode,
  temperature,
  windSpeed,
  currentTime
}) {
  const variables = {
    placeName,
    currentWeatherText
  };

  if (Math.random() < 0.02) {
    return applyVariables(randomItem(rareLines), variables);
  }

  const weatherCategory = getWeatherCategory({
    weatherCode,
    temperature,
    windSpeed
  });

  const timeCategory = getTimeCategory(currentTime);

  /*
    条件限定台詞の出現率

    雷・雪：70%
    雨・猛暑：55%
    寒さ・強風：45%

    条件台詞が選ばれなかった場合も、
    時間帯台詞または通常台詞が出ます。
  */
  const weatherChance = {
    thunder: 0.7,
    snow: 0.7,
    rain: 0.55,
    hot: 0.55,
    cold: 0.45,
    windy: 0.45
  };

  if (
    weatherCategory &&
    weatherLines[weatherCategory] &&
    Math.random() < weatherChance[weatherCategory]
  ) {
    return applyVariables(
      randomItem(weatherLines[weatherCategory]),
      variables
    );
  }

  if (
    timeCategory &&
    timeLines[timeCategory] &&
    Math.random() < 0.6
  ) {
    return applyVariables(
      randomItem(timeLines[timeCategory]),
      variables
    );
  }

  return applyVariables(randomItem(normalLines), variables);
}

function getWeatherCategory({
  weatherCode,
  temperature,
  windSpeed
}) {
  if ([95, 96, 99].includes(weatherCode)) {
    return "thunder";
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return "snow";
  }

  if (
    [
      51, 53, 55, 56, 57,
      61, 63, 65, 66, 67,
      80, 81, 82
    ].includes(weatherCode)
  ) {
    return "rain";
  }

  if (temperature >= 32) {
    return "hot";
  }

  if (windSpeed >= 30) {
    return "windy";
  }

  if (temperature <= 8) {
    return "cold";
  }

  return null;
}

function getTimeCategory(currentTime) {
  const hour = getHourFromLocalTime(currentTime);

  if (hour >= 5 && hour <= 10) {
    return "morning";
  }

  if (hour >= 11 && hour <= 16) {
    return "daytime";
  }

  if (hour >= 17 && hour <= 18) {
    return "evening";
  }

  if (hour >= 19 && hour <= 22) {
    return "night";
  }

  return "midnight";
}

function getHourFromLocalTime(currentTime) {
  if (typeof currentTime === "string") {
    const match = currentTime.match(/T(\d{2}):/);

    if (match) {
      return Number(match[1]);
    }
  }

  return new Date().getHours();
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

function applyVariables(line, variables) {
  return line
    .replaceAll("${placeName}", variables.placeName)
    .replaceAll(
      "${currentWeatherText}",
      variables.currentWeatherText
    );
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
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
    return "現在地を取得できませんでした。電波やGPSの状態を確認してみてください。";
  }

  if (error.code === 3) {
    return "位置情報の取得に時間がかかりすぎました。もう一度試してみてください。";
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
