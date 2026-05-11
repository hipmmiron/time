export default function handler(req, res) {
  try {
    const tz = req.query.tz || 'UTC';
    const now = new Date();

    // проверка таймзоны
    Intl.DateTimeFormat(undefined, { timeZone: tz });

    const dateParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      weekday: 'long'
    }).formatToParts(now);

    const timeParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);

    const get = (arr, type) => arr.find(x => x.type === type)?.value;

    const dayOfYear = Math.floor(
      (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
        Date.UTC(now.getUTCFullYear(), 0, 0)) /
        86400000
    );

    res.status(200).json({
      timezone: tz,

      date: {
        weekday: get(dateParts, 'weekday'),
        day: get(dateParts, 'day'),
        month: get(dateParts, 'month'),
        year: get(dateParts, 'year')
      },

      time: {
        hours: get(timeParts, 'hour'),
        minutes: get(timeParts, 'minute'),
        seconds: get(timeParts, 'second')
      },

      iso_utc: now.toISOString(),
      unix: Math.floor(now.getTime() / 1000),
      day_of_year: dayOfYear
    });

  } catch (err) {
    res.status(400).json({
      error: 'Invalid timezone'
    });
  }
}
