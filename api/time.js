export default function handler(req, res) {
  try {
    const tz = req.query.tz || 'UTC';
    const field = req.query.field;

    const now = new Date();

    // проверка таймзоны
    Intl.DateTimeFormat(undefined, { timeZone: tz });

    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    const dayOfYear = Math.floor(
      (Date.UTC(year, month, day) - Date.UTC(year, 0, 0)) / 86400000
    );

    const isLeapYear =
      (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    const weekOfYear = Math.ceil(dayOfYear / 7);

    // ISO week number (стандарт ISO 8601)
    const d = new Date(Date.UTC(year, month, day));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const isoWeek = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const monthNamesRu = [
      "Январь","Февраль","Март","Апрель","Май","Июнь",
      "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
    ];

    const weekdayNames = [
      "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
    ];

    const weekdayNamesRu = [
      "Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"
    ];

    const seasons = ["Winter","Winter","Spring","Spring","Spring","Summer","Summer","Summer","Autumn","Autumn","Autumn","Winter"];
    const quarter = Math.floor(month / 3) + 1;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const daysLeftInMonth = daysInMonth - day;
    const daysLeftInYear = (isLeapYear ? 366 : 365) - dayOfYear;
    const weekendOrWeekday = [0, 6].includes(now.getUTCDay()) ? "Weekend" : "Weekday";
    const isWeekend = [0, 6].includes(now.getUTCDay());

    // локальное время в запрошенной таймзоне
    const local = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).format(now);

    const local12h = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    }).format(now);

    const localDate = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(now);

    const localFull = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      dateStyle: 'full', timeStyle: 'long'
    }).format(now);

    // смещение таймзоны
    const tzOffsetParts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, timeZoneName: 'shortOffset'
    }).formatToParts(now);
    const tzOffsetStr = tzOffsetParts.find(p => p.type === 'timeZoneName')?.value || 'UTC';

    const tzLongParts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, timeZoneName: 'long'
    }).formatToParts(now);
    const tzLongName = tzLongParts.find(p => p.type === 'timeZoneName')?.value || tz;

    // IP и геолокация (Vercel / стандартные заголовки)
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown';

    const country     = req.headers['x-vercel-ip-country']       || req.headers['cf-ipcountry']       || null;
    const countryName = req.headers['x-vercel-ip-country-name']  || null;
    const region      = req.headers['x-vercel-ip-country-region']|| null;
    const city        = req.headers['x-vercel-ip-city']          || req.headers['cf-ipcity']          || null;
    const latitude    = req.headers['x-vercel-ip-latitude']      || null;
    const longitude   = req.headers['x-vercel-ip-longitude']     || null;
    const timezone_geo= req.headers['x-vercel-ip-timezone']      || null;
    const isp         = req.headers['x-vercel-ip-isp']           || null;
    const asn         = req.headers['x-vercel-ip-asn']           || null;

    // браузер / клиент
    const userAgent   = req.headers['user-agent']   || null;
    const acceptLang  = req.headers['accept-language'] || null;
    const referer     = req.headers['referer']       || req.headers['referrer'] || null;
    const origin      = req.headers['origin']        || null;
    const host        = req.headers['host']          || null;

    // протокол
    const protocol    = req.headers['x-forwarded-proto'] || 'http';
    const method      = req.method;

    // простой парсер браузера из UA
    function parseUA(ua) {
      if (!ua) return { browser: null, os: null, device: null };
      const browser =
        ua.includes('Edg/')    ? 'Edge' :
        ua.includes('Chrome/') ? 'Chrome' :
        ua.includes('Firefox/') ? 'Firefox' :
        ua.includes('Safari/')  ? 'Safari' :
        ua.includes('OPR/')     ? 'Opera' :
        ua.includes('curl/')    ? 'curl' :
        'Unknown';
      const os =
        ua.includes('Windows') ? 'Windows' :
        ua.includes('Mac OS')  ? 'macOS' :
        ua.includes('Linux')   ? 'Linux' :
        ua.includes('Android') ? 'Android' :
        ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' :
        'Unknown';
      const device =
        ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone') ? 'Mobile' :
        ua.includes('Tablet') || ua.includes('iPad') ? 'Tablet' :
        'Desktop';
      return { browser, os, device };
    }

    const { browser, os: clientOs, device } = parseUA(userAgent);

    // основной объект ответа
    const data = {
      timezone: tz,

      date: {
        day: String(day).padStart(2, '0'),
        day_raw: day,
        month_number: month + 1,
        month_name: monthNames[month],
        month_name_ru: monthNamesRu[month],
        weekday: weekdayNames[now.getUTCDay()],
        weekday_ru: weekdayNamesRu[now.getUTCDay()],
        weekday_number: now.getUTCDay(), // 0=Sun
        year,
        local_date: localDate,           // "12/05/2026"
        local_full: localFull,           // полная строка
        season: seasons[month],
        quarter: `Q${quarter}`,
        days_in_month: daysInMonth,
        days_left_in_month: daysLeftInMonth,
      },

      time: {
        utc_24h: `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}:${String(now.getUTCSeconds()).padStart(2,'0')}`,
        local_24h: local,
        local_12h: local12h,
        hours_utc: now.getUTCHours(),
        minutes: now.getUTCMinutes(),
        seconds: now.getUTCSeconds(),
        milliseconds: now.getUTCMilliseconds(),
        ampm: local12h.toUpperCase().includes('PM') ? 'PM' : 'AM',
        timezone_offset: tzOffsetStr,
        timezone_long_name: tzLongName,
      },

      meta: {
        iso_utc: now.toISOString(),
        unix: Math.floor(now.getTime() / 1000),
        epoch_ms: now.getTime(),
        day_of_year: dayOfYear,
        days_left_in_year: daysLeftInYear,
        week_of_year: weekOfYear,
        iso_week: isoWeek,
        is_leap_year: isLeapYear,
        is_weekend: isWeekend,
        day_type: weekendOrWeekday,
        year_progress_percent: parseFloat(((dayOfYear / (isLeapYear ? 366 : 365)) * 100).toFixed(2)),
      },

      client: {
        ip,
        country_code: country,
        country_name: countryName,
        region,
        city,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        geo_timezone: timezone_geo,
        isp,
        asn,
        user_agent: userAgent,
        accept_language: acceptLang,
        browser,
        os: clientOs,
        device,
        referer,
        origin,
        host,
        protocol,
        method,
      }
    };

    // однополевые маршруты
    const routes = {
      "month-num":           data.date.month_number,
      "month-name":          data.date.month_name,
      "month-name-ru":       data.date.month_name_ru,
      "day":                 data.date.day,
      "weekday":             data.date.weekday,
      "weekday-ru":          data.date.weekday_ru,
      "year":                data.date.year,
      "season":              data.date.season,
      "quarter":             data.date.quarter,
      "days-in-month":       data.date.days_in_month,
      "days-left-month":     data.date.days_left_in_month,
      "unix":                data.meta.unix,
      "epoch-ms":            data.meta.epoch_ms,
      "iso":                 data.meta.iso_utc,
      "day-of-year":         data.meta.day_of_year,
      "days-left-year":      data.meta.days_left_in_year,
      "week":                data.meta.week_of_year,
      "iso-week":            data.meta.iso_week,
      "ampm":                data.time.ampm,
      "is-weekend":          data.meta.is_weekend,
      "day-type":            data.meta.day_type,
      "year-progress":       data.meta.year_progress_percent,
      "ip":                  data.client.ip,
      "country":             data.client.country_code,
      "country-name":        data.client.country_name,
      "city":                data.client.city,
      "region":              data.client.region,
      "lat":                 data.client.latitude,
      "lon":                 data.client.longitude,
      "isp":                 data.client.isp,
      "browser":             data.client.browser,
      "os":                  data.client.os,
      "device":              data.client.device,
      "user-agent":          data.client.user_agent,
      "language":            data.client.accept_language,
      "protocol":            data.client.protocol,
    };

    if (field && routes[field] !== undefined) {
      return res.status(200).json({ field, value: routes[field] });
    }

    const path = req.query.path;
    if (path && routes[path] !== undefined) {
      return res.status(200).json({ field: path, value: routes[path] });
    }

    res.status(200).json(data);

  } catch (err) {
    res.status(400).json({ error: "Invalid timezone or internal error", detail: err.message });
  }
}
