export default function handler(req, res) {
  try {
    const tz = req.query.tz || 'UTC';
    const field = req.query.field; // новый режим

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

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const weekdayNames = [
      "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
    ];

    const local = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);

    const local12h = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(now);

    const data = {
      timezone: tz,

      date: {
        day: String(day),
        month_number: month + 1,
        month_name: monthNames[month],
        weekday: weekdayNames[now.getUTCDay()],
        year
      },

      time: {
        hours_24: String(now.getUTCHours()).padStart(2, '0'),
        hours_12: local12h.split(':')[0],
        minutes: String(now.getUTCMinutes()).padStart(2, '0'),
        seconds: String(now.getUTCSeconds()).padStart(2, '0'),
        ampm: local12h.includes('PM') ? 'PM' : 'AM'
      },

      meta: {
        iso_utc: now.toISOString(),
        unix: Math.floor(now.getTime() / 1000),
        epoch_ms: now.getTime(),
        day_of_year: dayOfYear,
        week_of_year: weekOfYear,
        is_leap_year: isLeapYear,
        timezone_offset_min: now.getTimezoneOffset()
      }
    };

    // -----------------------------
    // МАГИЧЕСКИЕ ОДНОПОЛЕВЫЕ РЕЖИМЫ
    // -----------------------------
    const routes = {
      "month-num": data.date.month_number,
      "month-name": data.date.month_name,
      "day": data.date.day,
      "year": data.date.year,
      "weekday": data.date.weekday,
      "unix": data.meta.unix,
      "iso": data.meta.iso_utc,
      "day-of-year": data.meta.day_of_year,
      "week": data.meta.week_of_year,
      "ampm": data.time.ampm
    };

    // 1. режим /?field=month-num
    if (field && routes[field] !== undefined) {
      return res.status(200).json({
        field,
        value: routes[field]
      });
    }

    // 2. режим старого “пути”
    const path = req.query.path;
    if (path && routes[path] !== undefined) {
      return res.status(200).json({
        field: path,
        value: routes[path]
      });
    }

    // 3. полный ответ
    res.status(200).json(data);

  } catch (err) {
    res.status(400).json({
      error: "Invalid timezone"
    });
  }
}
