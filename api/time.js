export default function handler(req, res) {
  try {
    // Таймзона из URL
    const tz = req.query.tz || 'UTC';

    const now = new Date();

    // Проверка таймзоны
    Intl.DateTimeFormat(undefined, {
      timeZone: tz
    });

    // День года
    const start = Date.UTC(now.getUTCFullYear(), 0, 0);
    const diff = now.getTime() - start;
    const dayOfYear = Math.floor(diff / 86400000);

    // Форматированное локальное время
    const localTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);

    // День недели
    const weekday = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      weekday: 'long'
    }).format(now);

    res.status(200).json({
      timezone: tz,
      iso_utc: now.toISOString(),
      local_time: localTime,
      weekday: weekday,
      day_of_year: dayOfYear,
      unix: Math.floor(now.getTime() / 1000)
    });

  } catch (err) {
    res.status(400).json({
      error: 'Invalid timezone'
    });
  }
}
