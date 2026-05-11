export default function handler(req, res) {
  const now = new Date();
  res.setHeader('Content-Type', 'text/plain');
  res.send(
    'datetime: ' + now.toISOString() + '\n' +
    'day_of_week: ' + now.getDay() + '\n' +
    'day_of_year: ' + Math.floor((now - new Date(now.getFullYear(),0,0))/86400000)
  );
}
